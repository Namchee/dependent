import glob from 'glob';
import { readFileSync } from 'fs';
import { basename } from 'path';

import { ProjectFile } from './types';

export function getProjectFiles(): ProjectFile[] {
  const projectFiles = glob.sync(
    '**/*.+(js|mjs)',
    {
      silent: true,
    },
  );

  return projectFiles.map((path: string): ProjectFile => {
    const fileName = basename(path);
    const content = readFileSync(path, 'utf-8');

    return {
      name: fileName,
      path,
      content,
    };
  });
}
