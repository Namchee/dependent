import { resolve } from 'path';

import globalDirs from 'global-dirs';

import type {
  ImportDeclaration,
  ImportExpression,
  CallExpression,
  SourceLocation
} from 'estree';
import type { BaseNode } from 'estree-walker';

let svelte: typeof import('svelte/compiler');

try {
  const basePath = ['svelte', 'compiler.js'];
  const localPath = resolve(process.cwd(), 'node_modules', ...basePath);
  const npmPath = resolve(globalDirs.npm.packages, ...basePath);
  const yarnPath = resolve(globalDirs.yarn.packages, ...basePath);

  const compilerImports = await Promise.allSettled([
    import(localPath),
    import(npmPath),
    import(yarnPath),
  ]);

  for (let i = 0; i < compilerImports.length; i++) {
    const impor = compilerImports[i];

    if (impor.status === 'fulfilled') {
      svelte = impor.value.default as typeof import('svelte/compiler');
      break;
    }
  }
} catch (_) {
  /* ignore for now */
}

/**
 * Parse native JavaScript nodes for imports to `dependency`
 *
 * @param {Node} sourceNode AST representation of the file
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export function parseNode(sourceNode: BaseNode, dependency: string): number[] {
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
  if (!svelte) {
    throw new Error('No Svelte parsers available');
  }

  const node = svelte.parse(content);
  return [
    ...parseNode(node.instance as BaseNode, dependency),
    ...parseNode(node.module as BaseNode, dependency),
  ];
}
