import { resolve } from 'path';
import { pathToFileURL } from 'url';

import type {
  SourceFile,
  Node,
  ImportDeclaration,
  CallExpression,
} from 'typescript';

import { getGlobalNPMPath, getGlobalPnpmPath, getGlobalYarnPath } from '@/utils/global';

let compiler: typeof import('typescript');

/**
 * Get available TypeScript compiler. Will prioritize locally-installed
 * compiler instead of the global one.
 *
 * @returns {Promise<typeof compiler>} Typescript compiler
 */
async function getCompiler(): Promise<typeof compiler> {
  if (compiler) {
    return compiler;
  }

  const compilerPath = ['typescript', 'lib', 'typescript.js'];
  const globalManagerPath = await Promise.all([
    getGlobalNPMPath(),
    getGlobalYarnPath(),
    getGlobalPnpmPath(),
  ]);

  const localPath = resolve(process.cwd(), 'node_modules', ...compilerPath);
  const npmPath = resolve(globalManagerPath[0], ...compilerPath);
  const yarnPath = resolve(globalManagerPath[1], ...compilerPath);
  const pnpmPath = resolve(globalManagerPath[2], ...compilerPath);

  const imports = await Promise.allSettled([
    import(pathToFileURL(localPath).toString()),
    import(pathToFileURL(npmPath).toString()),
    import(pathToFileURL(yarnPath).toString()),
    import(pathToFileURL(pnpmPath).toString()),
  ]);

  for (let i = 0; i < imports.length; i++) {
    const fileModule = imports[i];

    if (fileModule.status === 'fulfilled') {
      compiler = fileModule.value.default as typeof import('typescript');
      break;
    }
  }

  return compiler;
}

/**
 * Parse TypeScript node for imports to `dependency`
 *
 * @param {typeof compiler} ts typescript compiler
 * @param {SourceFile} sourceNode AST representation of the file
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
function parseNode(
  ts: typeof compiler,
  sourceNode: SourceFile,
  dependency: string,
): number[] {
  const lineNumbers: number[] = [];

  const walk = (node: Node) => {
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration: {
        const specifier = (node as ImportDeclaration)
          .moduleSpecifier;

        if (
          specifier.kind === 10 &&
          specifier.getText().slice(1, -1).split('/')[0] === dependency
        ) {
          lineNumbers.push(
            sourceNode.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          );
        }

        break;
      }

      case ts.SyntaxKind.CallExpression: {
        const callExpr = node as CallExpression;

        const { expression } = callExpr;
        const child = callExpr.arguments;

        const isImport = expression.kind === ts.SyntaxKind.ImportKeyword &&
          child.length === 1 &&
          child[0].kind === ts.SyntaxKind.StringLiteral &&
          child[0].getText().slice(1, -1).split('/')[0] === dependency;

        const isRequire = expression.kind === ts.SyntaxKind.Identifier &&
          expression.getText() === 'require' &&
          child.length === 1 &&
          child[0].kind === ts.SyntaxKind.StringLiteral &&
          child[0].getText().slice(1, -1).split('/')[0] === dependency;

        if (isImport || isRequire) {
          lineNumbers.push(
            sourceNode.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          );
        }

        break;
      }

      default: break;
    }

    ts.forEachChild(node, walk);
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
  const compiler = await getCompiler();
  if (!compiler) {
    throw new Error('No Typescript parsers available');
  }

  const node = compiler.createSourceFile(
    '',
    content,
    compiler.ScriptTarget.Latest,
    true,
    compiler.ScriptKind.TSX,
  );

  return parseNode(compiler, node, dependency);
}
