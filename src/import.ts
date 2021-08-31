import chalk from 'chalk';

import { getParser } from './parser';

import type { DependantFile, ParserOptions, ProjectFile } from './types';

/**
 * Analyze all relevant files for imports to `dependency`
 *
 * @param {ProjectFile[]} files Relevant files
 * @param {string} dependency Package name
 * @param {ParserOptions} options Parsing options
 * @param {boolean} options.silent `true` if the parser
 * should ignore invalid files, `false` otherwise.
 * @returns {DependantFile[]} List of files which imports `dependency`.
 */
export async function getDependantFiles(
  files: ProjectFile[],
  dependency: string,
  { silent }: ParserOptions,
): Promise<DependantFile[]> {
  const dependants: Promise<DependantFile | null>[] = files.map(
    async (file) => {
      try {
        let ext = file.name.split('.').pop() as string;

        if (ext === 'mjs') {
          ext = 'js';
        }

        const parse = getParser(ext);
        const isDependant = await parse(file.content, dependency);

        if (isDependant.length) {
          return {
            name: file.name,
            path: file.path,
            lineNumbers: isDependant,
          } as DependantFile;
        }

        return null;
      } catch (err) {
        const error = err as Error;
        console.error(error);
        throw new Error(`Failed to parse ${file.path}: ${error.message}`);
      }
    },
  );

  if (!silent) {
    const results = await Promise.all(dependants);
    return results.filter(val => val !== null) as DependantFile[];
  } else {
    const rawResults = await Promise.allSettled(dependants);
    const results = [];

    for (const result of rawResults) {
      if (result.status === 'rejected') {
        console.log(
          chalk.yellow(result.reason),
        );
      } else if (result.value) {
        results.push(result.value);
      }
    }

    return results;
  }
}
