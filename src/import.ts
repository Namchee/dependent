import { getParser } from './parser';

import { DependantFile, ParserOptions, ProjectFile } from './types';

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
  const dependant: DependantFile[] = [];

  for (const file of files) {
    const ext = file.name.endsWith('js') ?
      module ? 'mjs' : 'cjs' :
      (file.name.split('.').pop() as string);

    try {
      const parse = getParser(ext);

      const isDependant = parse(file.content, dependency);

      if (isDependant.length) {
        dependant.push(
          { name: file.name, path: file.path, lineNumbers: isDependant }
        );
      }
    } catch (err) {
      console.log(err.message);
      if (silent) {
        continue;
      } else {
        throw new Error(`Failed to parse ${file.path}`);
      }
    }
  }

  return dependant;
}
