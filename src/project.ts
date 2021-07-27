import { parse, Options, Node, SourceLocation } from 'acorn';
import { simple } from 'acorn-walk';

import type { ImportDeclaration, ImportExpression } from 'estree';

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
    }
  });

  return lines;
}

function getCommonJSImportLines(
  node: Node,
  dependency: string,
): number[] {
  const lines = [];
}

export function getDependantFiles(
  files: ProjectFile[],
  dependency: string,
  module: boolean,
): DependantFile[] {
  const baseOptions: Options = {
    ecmaVersion: 'latest',
    locations: true,
  };

  const validator = module ? getESModulesImportLines : getCommonJSImportLines;
  const dependant: DependantFile[] = [];

  for (const file of files) {
    const isModule = file.name.endsWith('mjs');

    const node: Node = parse(file.content, {
      ...baseOptions,
      sourceType: module || isModule ? 'module' : 'script',
    });

    const isDependant = isModule ?
      getESModulesImportLines(node, dependency) :
      validator(node, dependency);

    if (isDependant) {
      dependant.push(
        { name: file.name, path: file.path, lineNumbers: isDependant }
      );
    }
  }

  return dependant;
}
