import chalk from 'chalk';

import { FILE_TYPES } from '@/constant/files';

import type { DependantFile } from '@/types';

/**
 * Sorter function when sorting dependant files by depth
 * and by their names in descending order.
 *
 * @param {DependantFile} a Source file
 * @param {DependantFile} b File to be compared with `a`
 * @returns {number} `-1` if `a` should be prioritized, `1` otherwise.
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
 * @param {DependantFile[]} files list of dependant files.
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
  const tableFriendlyFiles = files.map(file => ({
    'File name': file.name,
    'File path': file.path,
    'Line number': file.lineNumbers.join(', '),
  }));

  console.table(tableFriendlyFiles);
}

/**
 * Outputs all dependant files to `stdout` in line-per-line
 * format.
 *
 * @param {DependantFile[]} files Dependant files.
 */
function logLines(files: DependantFile[]): void {
  files.forEach(({ name, path, lineNumbers }) => {
    console.log(
      chalk.cyan(
        `└── ${name}:${lineNumbers.join(', ')} → ${path}`,
      ),
    )
  });
}

/**
 * Outputs all dependant files to `stdout` with `console`
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
      `📦 There are ${files.length} files in this project that depends on '${dependency}'`,
    ),
  );

  if (files.length) {
    console.log(); // New line
    const fileMaps = categorize(files);

    for (const [ext, files] of Object.entries(fileMaps)) {
      const alias = FILE_TYPES[ext as keyof typeof FILE_TYPES];

      let logger = logTable;
      if (!table) {
        logger = logLines;
      }

      if (files.length) {
        console.log(`📁 ${alias}`);
        logger(files);
        console.log(); // Empty lines
      }
    }
  }
}

/**
 *
 * @param scripts
 * @param dependency
 * @param table
 */
export function showDependantScript(
  scripts: string[],
  dependency: string,
  table: boolean,
): void {
  console.log('\n' +
    chalk.cyanBright(
      `📜 There are ${scripts.length} scripts in this project that depends on '${dependency}'`,
    ),
  );

  if (scripts.length) {
    console.log(); // New line

    let logger = logTable;
    if (!table) {
      logger = logLines;
    }

    if (files.length) {
      console.log(`📁 ${alias}`);
      logger(files);
      console.log(); // Empty lines
    }
  }
}
