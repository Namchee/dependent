import { parse, Options, Node, SourceLocation } from 'acorn';
import { simple } from 'acorn-walk';

import type {
  ImportDeclaration,
  ImportExpression,
  CallExpression,
} from 'estree';

import { DependantFile, ParserOptions, ProjectFile } from './types';

/**
 * Analyze ES modules for all imports to `dependency`
 *
 * @param {Node} baseNode AST representation of the file
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
function getESModulesImportLines(
  baseNode: Node,
  dependency: string,
): number[] {
  const lines: number[] = [];

  simple(baseNode, {
    ImportExpression(node: Node) {
      const importExpr = node as unknown as ImportExpression;

      if (
        importExpr.source.type === 'Literal' &&
        importExpr.source.value === dependency
      ) {
        lines.push((node.loc as SourceLocation).start.line);
      }
    },

    ImportDeclaration(node: Node) {
      const importDec = node as unknown as ImportDeclaration;

      if (
        importDec.source.type === 'Literal' &&
        importDec.source.value === dependency
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
        callExpr.arguments[0].value === dependency
      ) {
        lines.push((node.loc as SourceLocation).start.line);
      }
    },
  });

  return lines;
}

/**
 * Analyze CommonJS modules for all imports to `dependency`
 *
 * @param {Node} baseNode AST representation of the file
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
function getCommonJSImportLines(
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
 * Analyze all relevant files for imports to `dependency`
 *
 * @param {ProjectFile[]} files Relevant files
 * @param {string} dependency Package name
 * @param {ParserOptions} options Parsing options
 * @param {boolean} options.module `true` if all files should
 * be parsed as ES modules, `false` otherwise.
 * @param {boolean} options.silent `true` if the parser
 * should ignore invalid files, `false` otherwise.
 * @returns {DependantFile[]} List of files which imports `dependency`.
 */
export function getDependantFiles(
  files: ProjectFile[],
  dependency: string,
  { module, silent }: ParserOptions,
): DependantFile[] {
  const baseOptions: Options = {
    ecmaVersion: 'latest',
    locations: true,
    allowHashBang: true,
  };

  const baseReader = module ? getESModulesImportLines : getCommonJSImportLines;
  const dependant: DependantFile[] = [];

  for (const file of files) {
    let source: 'module' | 'script' = module ? 'module' : 'script';
    let reader = baseReader;

    if (file.name.endsWith('mjs')) {
      reader = getESModulesImportLines;
      source = 'module';
    } else if (file.name.endsWith('cjs')) {
      reader = getCommonJSImportLines;
      source = 'script';
    }

    try {
      const node: Node = parse(file.content, {
        ...baseOptions,
        sourceType: source,
      });

      const isDependant = reader(node, dependency);

      if (isDependant.length) {
        dependant.push(
          { name: file.name, path: file.path, lineNumbers: isDependant }
        );
      }
    } catch (err) {
      if (silent) {
        continue;
      } else {
        throw new Error(`Failed to parse ${file.path}`);
      }
    }
  }

  return dependant;
}
