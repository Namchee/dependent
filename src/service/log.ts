import chalk from 'chalk';

import { FILE_TYPES } from '@/constant/files';

import type { DependantFile, Dependants } from '@/types';

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

function writeHeader(
  type: 'files' | 'scripts',
  dependency: string,
  count: number,
): void {
  const emojiMap: Record<typeof type, string> = {
    files: '📦',
    scripts: '📜',
  }

  console.log('\n' +
    chalk.cyanBright(
      `${emojiMap[type]} There are ${count} ${type} in this project that depends on '${dependency}'`,
    ),
  );
}

function showDependantFilesInTables(
  files: DependantFile[],
): void {
  if (files.length) {
    console.log(); // New line
    const fileMaps = categorize(files);

    for (const [ext, files] of Object.entries(fileMaps)) {
      const alias = FILE_TYPES[ext as keyof typeof FILE_TYPES];

      if (files.length) {
        console.log(`📁 ${alias}`);
        const tableDef = files.map(file => ({
          'File name': file.name,
          'File path': file.path,
          'Line number': file.lineNumbers.join(', '),
        }));

        console.table(tableDef);
        console.log(); // Empty lines
      }
    }
  }
}

function showDependantFilesInLines(
  files: DependantFile[],
): void {
  if (files.length) {
    console.log(); // New line
    const fileMaps = categorize(files);

    for (const [ext, files] of Object.entries(fileMaps)) {
      const alias = FILE_TYPES[ext as keyof typeof FILE_TYPES];

      if (files.length) {
        console.log(`📁 ${alias}`);
        files.forEach(({ name, path, lineNumbers }) => {
          console.log(
            chalk.cyan(
              `└── ${name}:${lineNumbers.join(', ')} → ${path}`,
            ),
          )
        });
        console.log(); // Empty lines
      }
    }
  }
}

function showDependantScriptsInLines(
  scripts: string[],
): void {
  if (scripts.length) {
    console.log(); // New line

    scripts.forEach((script) => {
      console.log(
        chalk.cyan(
          `─ ${script}`,
        ),
      )
    });
  }
}

function showDependantScriptsInTables(scripts: string[],): void {
  if (scripts.length) {
    console.log(); // New line

    const tableDef = scripts.map(script => ({
      'Script': script,
    }));

    console.table(tableDef);
  }
}

export function showDependants(
  { scripts, files }: Dependants,
  dependency: string,
  table: boolean,
): void {
  writeHeader('files', dependency, files.length);

  if (table) {
    showDependantFilesInTables(files);
  } else {
    showDependantFilesInLines(files);
  }

  writeHeader('scripts', dependency, scripts.length);

  if (table) {
    showDependantScriptsInTables(scripts);
  } else {
    showDependantScriptsInLines(scripts);
  }
}
