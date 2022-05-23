import { resolve } from 'path';
import { pathToFileURL } from 'url';

import type {
  ImportDeclaration,
  ImportExpression,
  CallExpression,
  SourceLocation
} from 'estree';

import { getGlobalNPMPath, getGlobalYarnPath, getGlobalPnpmPath } from '@/utils/global';

import type { BaseNode } from 'estree-walker';

let compiler: typeof import('svelte/compiler');

/**
 * Get available Svelte compiler. Will prioritize locally-installed
 * compiler.
 *
 * @returns {Promise<void>}
 */
export async function loadSvelteCompiler(): Promise<void> {
  // Do not load the compiler twice
  if (compiler) {
    return;
  }

  const compilerPath = ['svelte', 'compiler.js'];

  const globalManagerPath = await Promise.all([
    getGlobalNPMPath(),
    getGlobalYarnPath(),
    getGlobalPnpmPath(),
  ]);

  const localPath = resolve(process.cwd(), 'node_modules', ...compilerPath);
  const npmPath = resolve(globalManagerPath[0], ...compilerPath);
  const yarnPath = resolve(globalManagerPath[1], ...compilerPath);
  const pnpmPath = resolve(globalManagerPath[2], ...compilerPath);

  const compilerImports = await Promise.allSettled([
    import(pathToFileURL(localPath).toString()),
    import(pathToFileURL(npmPath).toString()),
    import(pathToFileURL(yarnPath).toString()),
    import(pathToFileURL(pnpmPath).toString()),
  ]);

  for (let i = 0; i < compilerImports.length; i++) {
    const fileModule = compilerImports[i];

    if (fileModule.status === 'fulfilled') {
      compiler = fileModule.value.default as typeof import('svelte/compiler');
      return;
    }
  }

  throw new Error('No Svelte compiler available');
}

/**
 * Parse native JavaScript nodes for imports to `dependency`
 *
 * @param {typeof compiler} svelte svelte compiler
 * @param {Node} sourceNode AST representation of the file
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export function parseNode(
  svelte: typeof compiler,
  sourceNode: BaseNode,
  dependency: string,
): number[] {
  const lines: number[] = [];

  svelte.walk(sourceNode, {
    enter(node) {
      switch (node.type) {
        case 'ImportDeclaration': {
          const importDec = node as ImportDeclaration;

          if (
            importDec.source.type === 'Literal' &&
            importDec.source.value?.toString().split('/')[0] === dependency
          ) {
            lines.push((node.loc as SourceLocation).start.line);
          }

          break;
        }

        case 'ImportExpression': {
          const importExpr = node as ImportExpression;

          if (
            importExpr.source.type === 'Literal' &&
            importExpr.source.value?.toString().split('/')[0] === dependency
          ) {
            lines.push((node.loc as SourceLocation).start.line);
          }

          break;
        }

        case 'CallExpression': {
          const callExpr = node as CallExpression;

          if (
            callExpr.callee.type === 'Identifier' &&
            callExpr.callee.name === 'require' &&
            callExpr.arguments[0].type === 'Literal' &&
            callExpr.arguments[0].value?.toString().split('/')[0] === dependency
          ) {
            lines.push((node.loc as SourceLocation).start.line);
          }

          break;
        }

        default: break;
      }
    }
  })

  return lines;
}

/**
 * Analyze Svelte file for all imports to `dependency`
 *
 * @param {string} content File content
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export async function getSvelteImportLines(
  content: string,
  dependency: string,
): Promise<number[]> {
  if (!compiler) {
    throw new Error('Svelte compiler has not been loaded');
  }

  const node = compiler.parse(content);
  return [
    ...parseNode(compiler, node.instance as BaseNode, dependency),
    ...parseNode(compiler, node.module as BaseNode, dependency),
  ];
}
