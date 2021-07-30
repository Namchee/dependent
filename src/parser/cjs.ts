import { parse } from 'acorn';
import { simple } from 'acorn-walk';

import type { Node } from 'acorn';
import type { CallExpression, SourceLocation } from 'estree';

/**
 * Parse CommonJS nodes for imports to `dependency`
 *
 * @param {Node} baseNode AST representation of the file
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export function parseNode(
  baseNode: Node,
  dependency: string,
): number[] {
  const lines: number[] = [];

  simple(baseNode, {
    CallExpression(node: Node) {
      const callExpr = node as unknown as CallExpression;

      if (
        callExpr.callee.type === 'Identifier' &&
        callExpr.callee.name === 'require' &&
        callExpr.arguments[0].type === 'Literal' &&
        callExpr.arguments[0].value === dependency
      ) {
        lines.push((node.loc as SourceLocation).start.line);
      }
    },
  });

  return lines;
}

/**
 * Analyze CommonJS module for all imports to `dependency`
 *
 * @param {string} content File content
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export function getCommonJSImportLines(
  content: string,
  dependency: string,
): number[] {
  const node: Node = parse(content, {
    ecmaVersion: 'latest',
    locations: true,
    allowHashBang: true,
    sourceType: 'module',
  });

  return parseNode(node, dependency);
}
