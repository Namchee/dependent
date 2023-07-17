import chalk from 'chalk';
import { table } from 'table';

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
    cjs: [],
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
): string {
  const emojiMap: Record<typeof type, string> = {
    files: '📁',
    scripts: '📜',
  }

  return chalk.cyanBright(
    `${emojiMap[type]} There are ${count} ${type} in this project that depends on '${dependency}'`,
  );
}

function showDependantFilesInTables(
  fileMap: Record<string, DependantFile[]>,
): string {
  const output = [];

  for (const [ext, extFiles] of Object.entries(fileMap)) {
    const alias = FILE_TYPES[ext as keyof typeof FILE_TYPES];

    if (extFiles.length) {
      const header = `📜 ${alias}`;

      const entries = extFiles.map(file => ([
        file.name,
        file.path,
        file.lineNumbers.join(', '),
      ]));

      const fileTable = table(
        [
          [
            'Filename',
            'Path',
            'Line Number',
          ],
          ...entries,
        ],
      );

      output.push(
        header + '\n' + fileTable,
      );
    }
  }

  return output.join('\n').slice(0, -1);
}

function showDependantFilesInLines(
  fileMap: Record<string, DependantFile[]>,
): string {
  const output = [];

  for (const [ext, extFiles] of Object.entries(fileMap)) {
    const alias = FILE_TYPES[ext as keyof typeof FILE_TYPES];

    if (extFiles.length) {
      const header = `📜 ${alias}`;

      const entries = extFiles.map(({ name, path, lineNumbers }) => chalk.cyan(
        ` └── ${name}:${lineNumbers.join(', ')} → ${path}`,
      ));

      output.push(header + '\n' + entries.join('\n'));
    }
  }

  return output.join('\n\n');
}

function showDependantScriptsInLines(
  scripts: string[],
): string {
  return scripts.map(script => chalk.cyan(
    ` └── ${script}`,
  )).join('\n');
}

function showDependantScriptsInTables(scripts: string[]): string {
  return table(
    [
      ['Script'],
      scripts.map(script => [script]),
    ]
  ).slice(0, -1);
}

export function showDependantFiles(
  files: DependantFile[],
  dependency: string,
  { format }: LoggerConfig,
): string {
  const lines = [writeHeader('files', dependency, files.length)];

  const method = {
    lines: showDependantFilesInLines,
    table: showDependantFilesInTables
  };

  const fileMaps = categorize(files);

  if (files.length) {
    lines.push(method[format](fileMaps));
  }

  return lines.join('\n\n');
}

export function showDependantScripts(
  scripts: string[],
  dependency: string,
  { format }: LoggerConfig,
): string {
  const lines = [writeHeader('scripts', dependency, scripts.length)];

  const method = {
    lines: showDependantScriptsInLines,
    table: showDependantScriptsInTables,
  };

  if (scripts.length) {
    lines.push(method[format](scripts));
  }

  return lines.join('\n');
}
