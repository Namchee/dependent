import glob from 'glob';
import { readFileSync } from 'fs';
import { basename } from 'path';

import { ProjectFile } from './types';

export function getProjectFiles(path: string[]): ProjectFile[] {
  const filePaths = glob.sync(
    `{${path.join(',')}}`,
    {
      silent: true,
    },
  );

  const projectFiles: ProjectFile[] = [];

  for (const path of filePaths) {
    try {
      const fileName = basename(path);
      const content = readFileSync(path, 'utf-8');

      projectFiles.push({
        name: fileName,
        path,
        content,
      });
    } catch {
      continue;
    }
  }

  return projectFiles;
}
