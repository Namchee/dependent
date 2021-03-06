import { resolve } from 'path';
import { pathToFileURL } from 'url';

import { getRootPackage } from '@/utils/package';

import type {
  SourceFile,
  Node,
  ImportDeclaration,
  CallExpression,
} from 'typescript';

let compiler: typeof import('typescript');

/**
 * Get available TypeScript compiler. Will prioritize locally-installed
 * compiler instead of the global one.
 *
 * @param {string[]} globs global package manager path
 * @returns {Promise<void>}
 */
export async function loadTSCompiler(globs: string[]): Promise<void> {
  // Do not load the compiler twice
  if (compiler) {
    return;
  }

  const compilerPath = ['typescript', 'lib', 'typescript.js'];

  const paths = [
    resolve(process.cwd(), 'node_modules', ...compilerPath),
    ...globs.map(path => resolve(path, ...compilerPath)),
  ];

  const imports = paths.map(path => import(pathToFileURL(path).toString()));
  const compilerImports = await Promise.allSettled(imports);

  for (let i = 0; i < compilerImports.length; i++) {
    const fileModule = compilerImports[i];

    if (fileModule.status === 'fulfilled') {
      compiler = fileModule.value.default as typeof import('typescript');
      return;
    }
  }

  throw new Error('No TypeScript parsers available');
}

/**
 * Parse TypeScript node for imports to `dependency`
 *
 * @param {SourceFile} sourceNode AST representation of the file
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
function parseNode(
  sourceNode: SourceFile,
  dependency: string,
): number[] {
  const lineNumbers: number[] = [];

  const walk = (node: Node) => {
    switch (node.kind) {
      case compiler.SyntaxKind.ImportDeclaration: {
        const specifier = (node as ImportDeclaration)
          .moduleSpecifier;

        if (
          specifier.kind === 10 &&
          getRootPackage(specifier.getText().slice(1, -1)) === dependency
        ) {
          lineNumbers.push(
            sourceNode.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          );
        }

        break;
      }

      case compiler.SyntaxKind.CallExpression: {
        const callExpr = node as CallExpression;

        const { expression } = callExpr;
        const child = callExpr.arguments;

        const isImport =
          expression.kind === compiler.SyntaxKind.ImportKeyword &&
          child.length === 1 &&
          child[0].kind === compiler.SyntaxKind.StringLiteral &&
          getRootPackage(child[0].getText().slice(1, -1)) === dependency

        const isRequire = expression.kind === compiler.SyntaxKind.Identifier &&
          expression.getText() === 'require' &&
          child.length === 1 &&
          child[0].kind === compiler.SyntaxKind.StringLiteral &&
          getRootPackage(child[0].getText().slice(1, -1)) === dependency;

        if (isImport || isRequire) {
          lineNumbers.push(
            sourceNode.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          );
        }

        break;
      }

      default: break;
    }

    compiler.forEachChild(node, walk);
  }

  walk(sourceNode);

  return lineNumbers;
}

/**
 * Analyze TypeScript file for all imports to `dependency`
 *
 * @param {string} content File content
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export async function getTSImportLines(
  content: string,
  dependency: string,
): Promise<number[]> {
  if (!compiler) {
    throw new Error('TypeScript compiler has not been loaded');
  }

  const node = compiler.createSourceFile(
    '',
    content,
    compiler.ScriptTarget.Latest,
    true,
    compiler.ScriptKind.TSX,
  );

  return parseNode(node, dependency);
}
