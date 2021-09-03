import chalk from 'chalk';

import { FILE_TYPES } from './constants/files';
import { DependantFile } from './constants/types';

/**
 * Sorter function when sorting dependant files by depth
 * and by their names in descending order.
 *
 * @param {DependantFile} a Source file
 * @param {DependantFile} b File to be compared with `a`
 * @returns `-1` if `a` should be prioritized, `1` otherwise.
 */
function sortFiles(a: DependantFile, b: DependantFile): number {
  const depthA = a.path.split('/').length;
  const depthB = b.path.split('/').length;

  if (depthA > depthB) {
    return 1;
  }

  if (depthA < depthB) {
    return -1;
  }

  return a.name > b.name ? 1 : -1;
}

/**
 * Categorize files to buckets based on their extension.
 *
 * @param {DependantFiles[]} files list of dependant files.
 * @returns {Record<string, DependantFile[]>} extension to file mapping,
 * sorted with the `sortFiles` function.
 */
function categorize(files: DependantFile[]): Record<string, DependantFile[]> {
  const result: Record<string, DependantFile[]> = {
    js: [],
    mjs: [],
    jsx: [],
    ts: [],
    tsx: [],
    vue: [],
    svelte: [],
  };

  for (const file of files) {
    const ext = file.name.split('.').pop() as keyof typeof result;

    result[ext].push(file);
  }

  for (const file of Object.values(result)) {
    file.sort(sortFiles);
  }

  return result;
}

/**
 * Outputs all dependant files to `stdout` in table
 * format.
 *
 * @param {DependantFile[]} files Dependant files
 */
function logTable(files: DependantFile[]): void {
  const tableFriendlyObjects = files.map((file) => {
    return {
      'File name': file.name,
      'File path': file.path,
      'Line number': file.lineNumbers.join(', '),
    };
  });

  console.table(tableFriendlyObjects);
}

/**
 * Outputs all dependant files to `stdout` in line-per-line
 * format.
 *
 * @param {DependantFile[]} files Dependant files
 */
function logLines(files: DependantFile[]): void {
  files.forEach(({ name, path, lineNumbers }) => {
    console.log(
      chalk.cyan(
        ` └── ${name}:${lineNumbers.join(', ')} → ${path}`,
      ),
    )
  });
}

/**
 * Outputs all dependant files to `stdout`
 *
 * @param {DependantFile[]} files Dependant files
 * @param {string} dependency Package name
 * @param {boolean} table `true` if the table output is desired,
 * `false` if line-per-line output is desired.
 */
export function showDependantFiles(
  files: DependantFile[],
  dependency: string,
  table: boolean,
): void {
  console.log('\n' +
    chalk.cyanBright(
      // eslint-disable-next-line max-len
      `📦 There are ${files.length} files in this project that depends on '${dependency}'`,
    ),
  );

  const fileMaps = categorize(files);

  if (files.length) {
    table ? logTable(files) : logLines(files);
  }
}
