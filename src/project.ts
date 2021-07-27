import { parse, Options, Node } from 'acorn';
import type { Program, Directive, Statement, ModuleDeclaration } from 'estree';

import { DependantFile, ProjectFile } from './types';

function isModuleImport(
  body: (Statement | ModuleDeclaration | Directive)[],
  dependency: string,
): boolean {
  return body.some((bod: Statement | ModuleDeclaration | Directive) => {
    return bod.type === 'ImportDeclaration' &&
      (bod.source.value as string).startsWith(dependency);
  });
}

function isCommonJSImport(
  body: (Statement | ModuleDeclaration | Directive)[],
  dependency: string,
): boolean {
  return body.some((bod: Statement | ModuleDeclaration | Directive) => {
    return bod.type === 'VariableDeclaration' &&
      bod.declarations[0].init?.type === 'CallExpression' &&
      bod.declarations[0].init?.callee.type === 'Identifier' &&
      bod.declarations[0].init?.callee.name === 'require' &&
      bod.declarations[0].init.arguments[0].type === 'Literal' &&
      bod.declarations[0].init.arguments[0].value === dependency;
  });
}

export function getDependantFiles(
  files: ProjectFile[],
  dependency: string,
  module: boolean,
): DependantFile[] {
  const baseOptions: Options = { ecmaVersion: 'latest' };
  const validator = module ? isModuleImport : isCommonJSImport;
  const dependant: DependantFile[] = [];

  for (const file of files) {
    const isModule = file.name.endsWith('mjs');
    const node: Node = parse(file.content, {
      ...baseOptions,
      sourceType: module || isModule ? 'module' : 'script',
    });

    console.log(node);

    if (node.type === 'Program') {
      const { body } = (node as unknown as Program);

      const isDependant = isModule ?
        isModuleImport(body, dependency) :
        validator(body, dependency);

      if (isDependant) {
        dependant.push({ name: file.name, path: file.path });
      }
    }
  }

  return dependant;
}
