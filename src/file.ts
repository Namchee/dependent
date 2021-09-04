import glob from 'glob';

import { readFileSync } from 'fs';
import { basename } from 'path';

import { ProjectFile } from './constants/types';

/**
 * Get all files in the project directory that matches
 * path criteria.
 *
 * @param {string[]} path Path criteria in glob patterns.
 * @param {boolean} silent Set to `true` to ignore file read
 * errors.
 * @returns {ProjectFile[]} List of files that matches the `path`
 * criteria.
 */
export function getProjectFiles(
  path: string[],
  silent: boolean,
): ProjectFile[] {
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
      if (silent) {
        continue;
      } else {
        throw new Error(`Failed to read ${path}`);
      }
    }
  }

  return projectFiles;
}
