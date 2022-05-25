import chalk from 'chalk';

import { getCompiler, getParser } from '@/service/parser';

import type {
  DependantFile,
  ParserOptions,
  ProjectFile,
} from '@/types';
import { FILE_TYPES } from '@/constant/files';

import { getFileExtension } from '@/utils/file';
import { getGlobalNPMPath, getGlobalYarnPath } from '@/utils/global';

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
  await loadCompilers(files);

  const dependants: Promise<DependantFile | null>[] = files.map(
    async (file) => {
      try {
        const ext = getFileExtension(file);

        const parse = getParser(ext);
        const isDependant = await parse(file.content, dependency);

        if (isDependant.length) {
          return {
            name: file.name,
            path: file.path,
            lineNumbers: isDependant,
          };
        }

        return null;
      } catch (err) {
        const error = err as Error;
        throw new Error(`Failed to parse ${file.path}: ${error.message}`);
      }
    },
  );

  if (!silent) {
    const results = await Promise.all(dependants);
    return results.filter(val => val !== null) as DependantFile[];
  }

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

/**
 * Preload all required compilers based on file types
 *
 * @param {ProjectFile[]} files list of file types
 * @returns {Promise<void>}
 */
async function loadCompilers(files: ProjectFile[]) {
  const managerPaths = await Promise.allSettled([
    getGlobalNPMPath(),
    getGlobalYarnPath(),
    getGlobalYarnPath(),
  ]);

  const globals = managerPaths.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    return '';
  }).filter(Boolean);

  const compilers = [
    ...new Set(
      files.map(file => getFileExtension(file))
        .filter(ext => ext !== 'js')
    ),
  ].map((ext: string) => {
    try {
      return getCompiler(ext)(globals);
    } catch (err) {
      const error = err as Error;
      throw new Error(
        `Failed to load compiler for ${FILE_TYPES[ext as keyof typeof FILE_TYPES]}: ${error.message}`,
      );
    }
  });

  await Promise.all(compilers);
}
