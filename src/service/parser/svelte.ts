import { resolve } from 'path';
import { pathToFileURL } from 'url';

import type {
  ImportDeclaration,
  ImportExpression,
  CallExpression,
  SourceLocation
} from 'estree';

import type { BaseNode } from 'estree-walker';

import { getRootPackage } from '@/utils/package';

let compiler: typeof import('svelte/compiler');

async function loadSvelteCompiler(globs: string[]): Promise<void> {
  // Do not load the compiler twice
  if (compiler) {
    return;
  }

  const oldCompilerPath = ['svelte', 'compiler.js'];
  const newCompilerPath = ['svelte', 'src', 'compiler', 'index.js'];

  const paths = [
    resolve(process.cwd(), 'node_modules', ...newCompilerPath),
    resolve(process.cwd(), 'node_modules', ...oldCompilerPath),
    ...globs.map(path => resolve(path, ...newCompilerPath)),
    ...globs.map(path => resolve(path, ...oldCompilerPath)),
  ];

  const imports = paths.map(path => import(pathToFileURL(path).toString()));
  const compilerImports = await Promise.allSettled(imports);

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
            getRootPackage(
              importDec.source.value?.toString() as string
            ) === dependency
          ) {
            lines.push((node.loc as SourceLocation).start.line);
          }

          break;
        }

        case 'ImportExpression': {
          const importExpr = node as ImportExpression;

          if (
            importExpr.source.type === 'Literal' &&
            getRootPackage(
              importExpr.source.value?.toString() as string
            ) === dependency
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
            getRootPackage(
              callExpr.arguments[0].value?.toString() as string,
            ) === dependency
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
  globs: string[],
): Promise<number[]> {
  if (!compiler) {
    await loadSvelteCompiler(globs);
  }

  const node = compiler.parse(content);
  return [
    ...parseNode(compiler, node.instance as BaseNode, dependency),
    ...parseNode(compiler, node.module as BaseNode, dependency),
  ];
}
