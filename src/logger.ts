import { cyan, cyanBright } from 'chalk';

import { DependantFile } from './types';

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

function logLines(files: DependantFile[]): void {
  files.forEach(({ name, path, lineNumbers }) => {
    console.log(
      cyan(
        ` └── ${name}:${lineNumbers.join(', ')} → ${path}`,
      ),
    )
  });
}

export function showDependantFiles(
  files: DependantFile[],
  dependency: string,
  table: boolean,
): void {
  console.log();
  console.log(
    cyanBright(
      // eslint-disable-next-line max-len
      `📦 There are ${files.length} files in this project that depends on '${dependency}'`,
    ),
  );

  if (files.length) {
    table ? logTable(files) : logLines(files);
  }
}
