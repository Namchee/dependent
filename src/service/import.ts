import chalk from 'chalk';

import { getParser } from '@/service/parser';

import type {
  DependantFile,
  ParserOptions,
  ProjectFile,
} from '@/types';

import { getFileExtension } from '@/utils/file';

export async function getDependantFiles(
  files: ProjectFile[],
  dependency: string,
  { silent }: ParserOptions,
): Promise<DependantFile[]> {
  // Quickfix, please remove when glob pattern is found
  files = files.filter(file => !file.name.endsWith('.d.ts'));

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
