import { getRootPackage } from '@/utils/package';

// CommonJS hack
import ts from 'typescript';

/**
 * Parse TypeScript node for imports to `dependency`
 *
 * @param {SourceFile} sourceNode AST representation of the file
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
function parseNode(
  sourceNode: ts.SourceFile,
  dependency: string,
): number[] {
  const lineNumbers: number[] = [];

  const walk = (node: ts.Node) => {
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration: {
        const specifier = (node as ts.ImportDeclaration)
          .moduleSpecifier;

        if (
          specifier.kind === ts.SyntaxKind.StringLiteral &&
          getRootPackage(specifier.getText().slice(1, -1)) === dependency
        ) {
          lineNumbers.push(
            sourceNode.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          );
        }

        break;
      }

      case ts.SyntaxKind.CallExpression: {
        const callExpr = node as ts.CallExpression;

        const { expression } = callExpr;
        const child = callExpr.arguments;

        const isImport =
          expression.kind === ts.SyntaxKind.ImportKeyword &&
          child.length === 1 &&
          child[0].kind === ts.SyntaxKind.StringLiteral &&
          getRootPackage(child[0].getText().slice(1, -1)) === dependency

        const isRequire = expression.kind === ts.SyntaxKind.Identifier &&
          expression.getText() === 'require' &&
          child.length === 1 &&
          child[0].kind === ts.SyntaxKind.StringLiteral &&
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
  const node = ts.createSourceFile(
    '',
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  return parseNode(node, dependency);
}
