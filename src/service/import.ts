import chalk from 'chalk';

import { getParser, loadCompiler } from '@/service/parser';

import type {
  DependantFile,
  ParserOptions,
  ProjectFile,
} from '@/types';

import { getFileExtension } from '@/utils/file';
import { FILE_TYPES } from '@/constant/files';

export async function getDependantFiles(
  files: ProjectFile[],
  dependency: string,
  { silent }: ParserOptions,
): Promise<DependantFile[]> {
  // Quickfix, please remove when glob pattern is found
  files = files.filter(file => !file.name.endsWith('.d.ts'));

  await loadCompilers(files);

  const dependants: Promise<DependantFile | null>[] = files.map(
    async (file) => {
      try {
        const ext = getFileExtension(file);

        const parse = getParser(ext);
        const dependants = await parse(file.content, dependency);

        if (dependants.length) {
          return {
            name: file.name,
            path: file.path,
            lineNumbers: dependants,
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

async function loadCompilers(files: ProjectFile[]) {
  const compilers = [
    ...new Set(
      files.map(file => getFileExtension(file))
    ),
  ].map((ext: string) => {
    try {
      return loadCompiler(ext);
    } catch (err) {
      const error = err as Error;
      throw new Error(
        `Failed to load compiler for ${FILE_TYPES[ext as keyof typeof FILE_TYPES]}: ${error.message}`,
      );
    }
  });

  await Promise.all(compilers);
}
