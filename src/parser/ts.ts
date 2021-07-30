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
        const expectedChild = node.getChildAt(
          node.getChildCount() > 1 ?
            2 : 1,
        );

        if (
          expectedChild.kind === ts.SyntaxKind.StringLiteral &&
          expectedChild.getText() === dependency
        ) {
          lineNumbers.push(
            sourceNode.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          );
        }

        break;
      }

      case ts.SyntaxKind.CallExpression: {
        const keyword = node.getChildAt(1);
        const child = node.getChildAt(2);

        const isImport = keyword.kind === ts.SyntaxKind.ImportKeyword &&
          child.kind === ts.SyntaxKind.StringLiteral &&
          child.getText() === dependency;

        const isRequire = keyword.kind === ts.SyntaxKind.CallExpression &&
          (keyword as ts.CallExpression).expression.getText() === 'require' &&
          child.kind === ts.SyntaxKind.StringLiteral &&
          child.getText() === dependency;

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
 * Analyze TypeScript file for all imports to `dependency`
 *
 * @param {string} content File content
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export function getTypeScriptImportLines(
  content: string,
  dependency: string,
): number[] {
  const node = ts.createSourceFile(
    'dummy.ts',
    content,
    ts.ScriptTarget.Latest,
    true,
  );

  return parseNode(node, dependency);
}
