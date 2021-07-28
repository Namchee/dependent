import { cyan, cyanBright } from 'chalk';

import { DependantFile } from './types';

export function showDependantFiles(
  files: DependantFile[],
  dependency: string,
): void {
  console.log();
  console.log(
    cyanBright(
      // eslint-disable-next-line max-len
      `📦 There are ${files.length} files in this project that depends on '${dependency}'`,
    ),
  );

  if (files.length) {
    files.forEach(({ name, path, lineNumbers }) => {
      console.log(
        cyan(
          `  ↳ ${name}:${lineNumbers[0]} →  ${path}`,
        ),
      )
    });
  }
}
