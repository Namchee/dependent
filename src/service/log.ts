import chalk from 'chalk';

import { FILE_TYPES } from '@/constant/files';

import type { DependantFile, LoggerConfig } from '@/types';

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
    files: '📁',
    scripts: '📜',
  }

  console.log(
    chalk.cyanBright(
      `${emojiMap[type]} There are ${count} ${type} in this project that depends on '${dependency}'`,
    ) +
    '\n'
  );
}

function showDependantFilesInTables(
  fileMap: Record<string, DependantFile[]>,
): void {
  for (const [ext, extFiles] of Object.entries(fileMap)) {
    const alias = FILE_TYPES[ext as keyof typeof FILE_TYPES];

    if (extFiles.length) {
      console.log(`📜 ${alias}`);
      const tableDef = extFiles.map(file => ({
        'File name': file.name,
        'File path': file.path,
        'Line number': file.lineNumbers.join(', '),
      }));

      console.table(tableDef);
      console.log(); // Empty lines
    }
  }
}

function showDependantFilesInLines(
  fileMap: Record<string, DependantFile[]>,
): void {
  for (const [ext, extFiles] of Object.entries(fileMap)) {
    const alias = FILE_TYPES[ext as keyof typeof FILE_TYPES];

    if (extFiles.length) {
      console.log(`📜 ${alias}`);
      extFiles.forEach(({ name, path, lineNumbers }) => {
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

function showDependantScriptsInLines(
  scripts: string[],
): void {
  scripts.forEach((script) => {
    console.log(
      chalk.cyan(
        `└── ${script}`,
      ),
    )
  });
}

function showDependantScriptsInTables(scripts: string[],): void {
  const tableDef = scripts.map(script => ({
    'Script': script,
  }));

  console.table(tableDef);
}

export function showDependantFiles(
  files: DependantFile[],
  dependency: string,
  { format }: LoggerConfig,
): void {
  writeHeader('files', dependency, files.length);

  const method = {
    lines: showDependantFilesInLines,
    table: showDependantFilesInTables
  };

  const fileMaps = categorize(files);

  if (files.length) {
    method[format](fileMaps);
  }
}

export function showDependantScripts(
  scripts: string[],
  dependency: string,
  { format }: LoggerConfig,
): void {
  writeHeader('scripts', dependency, scripts.length);

  const method = {
    lines: showDependantScriptsInLines,
    table: showDependantScriptsInTables,
  };

  if (scripts.length) {
    method[format](scripts);
  }
}
