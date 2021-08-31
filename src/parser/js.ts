import { Parser } from 'acorn';
import { simple, base } from 'acorn-walk';

import jsx from 'acorn-jsx';

import type { Node } from 'acorn';
import type {
  ImportDeclaration,
  ImportExpression,
  CallExpression,
  SourceLocation
} from 'estree';

const parser = Parser.extend(jsx());

/**
 * Parse native JavaScript nodes for imports to `dependency`
 *
 * @param {Node} sourceNode AST representation of the file
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export function parseNode(sourceNode: Node, dependency: string): number[] {
  const lines: number[] = [];

  simple(sourceNode, {
    ImportExpression(node: Node) {
      const importExpr = node as unknown as ImportExpression;

      if (
        importExpr.source.type === 'Literal' &&
        importExpr.source.value?.toString().split('/')[0] === dependency
      ) {
        lines.push((node.loc as SourceLocation).start.line);
      }
    },

    ImportDeclaration(node: Node) {
      const importDec = node as unknown as ImportDeclaration;

      if (
        importDec.source.type === 'Literal' &&
        importDec.source.value?.toString().split('/')[0] === dependency
      ) {
        lines.push((node.loc as SourceLocation).start.line);
      }
    },

    CallExpression(node: Node) {
      const callExpr = node as unknown as CallExpression;

      if (
        callExpr.callee.type === 'Identifier' &&
        callExpr.callee.name === 'require' &&
        callExpr.arguments[0].type === 'Literal' &&
        callExpr.arguments[0].value?.toString().split('/')[0] === dependency
      ) {
        lines.push((node.loc as SourceLocation).start.line);
      }
    },
  }, {
    ...base,
    JSXElement: () => {
      // empty
    },
  });

  return lines;
}

/**
 * Analyze JavaScript files for all imports to `dependency`
 *
 * @param {string} content File content
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export async function getJSImportLines(
  content: string,
  dependency: string,
): Promise<number[]> {
  const node: Node = parser.parse(content, {
    ecmaVersion: 'latest',
    locations: true,
    allowHashBang: true,
    sourceType: 'module',
  });

  return parseNode(node, dependency);
}
