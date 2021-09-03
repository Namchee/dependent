import chalk from 'chalk';

import { DependantFile } from './constants/types';

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

  if (files.length) {
    table ? logTable(files) : logLines(files);
  }
}
