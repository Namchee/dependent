import { existsSync } from 'fs';
import { resolve } from 'path';
import { spawn } from 'child_process';

import { ProjectDefinition } from './types';

export function resolvePackageJSON(): ProjectDefinition {
  const workdir = process.cwd();
  const path = resolve(workdir, 'package.json');

  // check the existence of package.json or in layman terms,
  // is the current workdir a NodeJS project directory?
  if (!existsSync(path)) {
    // eslint-disable-next-line max-len
    throw new Error(
      'The current project directory is not a NodeJS-based project',
    );
  }

  try {
    const projectDef = require(path);

    return {
      name: projectDef.name,
      dependencies: projectDef.dependencies,
      devDependencies: projectDef.devDependencies,
      peerDependencies: projectDef.peerDependencies,
      isModule: projectDef.type && projectDef.type === 'module',
    };
  } catch (err) {
    throw new Error('Invalid package.json schema');
  }
}

export function isDefined(
  dependency: string,
  def: ProjectDefinition,
): void {
  const isDefined = Object.keys(def.dependencies || {}).includes(dependency) ||
    Object.keys(def.devDependencies || {}).includes(dependency) ||
    Object.keys(def.peerDependencies || {}).includes(dependency);

  if (!isDefined) {
    throw new Error('The specified package is not defined for this project');
  }
}

export function isInstalled(
  dependency: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const lsCheck = spawn('npm', ['ls', dependency])

    lsCheck.stdout.on('data', (data) => {
      const isInstalled = data.includes(dependency) &&
        data.lastIndexOf(dependency) !== 0;

      isInstalled ?
        resolve() :
        reject(
          new Error('The specified package is not installed in this project'),
        );
    });
  });
}
