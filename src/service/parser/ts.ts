import { resolve } from 'path';

import globalDirs from 'global-dirs';

import type {
  SourceFile,
  Node,
  ImportDeclaration,
  CallExpression,
} from 'typescript';

let ts: typeof import('typescript');

try {
  const basePath = ['typescript', 'lib', 'typescript.js'];
  const localPath = resolve(process.cwd(), 'node_modules', ...basePath);
  const npmPath = resolve(globalDirs.npm.packages, ...basePath);
  const yarnPath = resolve(globalDirs.yarn.packages, ...basePath);

  const imports = await Promise.allSettled([
    import(localPath),
    import(npmPath),
    import(yarnPath),
  ]);

  for (let i = 0; i < imports.length; i++) {
    const impor = imports[i];

    if (impor.status === 'fulfilled') {
      ts = impor.value.default as typeof import('typescript');
      break;
    }
  }
} catch (_) {
  /* ignore for now */
}

/**
 * Parse TypeScript node for imports to `dependency`
 *
 * @param {SourceFile} sourceNode AST representation of the file
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
function parseNode(sourceNode: SourceFile, dependency: string): number[] {
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
  if (!ts) {
    throw new Error('No Typescript parsers available');
  }

  const node = ts.createSourceFile(
    '',
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  return parseNode(node, dependency);
}
