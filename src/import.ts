import { parse, Options, Node, SourceLocation } from 'acorn';
import { simple } from 'acorn-walk';

import type {
  ImportDeclaration,
  ImportExpression,
  CallExpression,
} from 'estree';

import { DependantFile, ProjectFile } from './types';

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

export function getDependantFiles(
  files: ProjectFile[],
  dependency: string,
  module: boolean,
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
  }

  return dependant;
}
