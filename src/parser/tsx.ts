import ts from 'typescript';

/**
 * Parse TypeScript node for imports to `dependency`
 *
 * @param {ts.SourceFile} sourceNode AST representation of the file
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
          specifier.getText().slice(1, -1).startsWith(dependency)
        ) {
          lineNumbers.push(
            sourceNode.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          );
        }

        break;
      }

      case ts.SyntaxKind.CallExpression: {
        const callExpr = node as ts.CallExpression;

        const expression = callExpr.expression;
        const child = callExpr.arguments;

        const isImport = expression.kind === ts.SyntaxKind.ImportKeyword &&
          child.length === 1 &&
          child[0].kind === ts.SyntaxKind.StringLiteral &&
          child[0].getText().slice(1, -1).startsWith(dependency);

        const isRequire = expression.kind === ts.SyntaxKind.Identifier &&
          expression.getText() === 'require' &&
          child.length === 1 &&
          child[0].kind === ts.SyntaxKind.StringLiteral &&
          child[0].getText().slice(1, -1).startsWith(dependency);

        if (isImport || isRequire) {
          lineNumbers.push(
            sourceNode.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          );
        }

        break;
      }
    }

    ts.forEachChild(node, walk);
  }

  walk(sourceNode);

  return lineNumbers;
}

/**
 * Analyze TypeScript's JSX  file for all imports to `dependency`
 *
 * @param {string} content File content
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export function getTSXImportLines(
  content: string,
  dependency: string,
): number[] {
  const node = ts.createSourceFile(
    '',
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  return parseNode(node, dependency);
}
