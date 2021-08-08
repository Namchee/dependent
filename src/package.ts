import { existsSync } from 'fs';
import { resolve } from 'path';
import { spawn } from 'child_process';

import { ProjectDefinition } from './types';

/**
 * Get all information of the project from `package.json`
 *
 * @returns {ProjectDefinition} Project definition. Refer to the type.
 */
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
    };
  } catch (err) {
    throw new Error('Invalid package.json schema');
  }
}

/**
 * Check if `dependency` is defined in `package.json`
 *
 * @param {string} dependency Package name
 * @param {ProjectDefinition} def Project defintion. Refer to the type
 * @throws {Error} `Error` if `dependency` is not
 * defined.
 */
export function isDefined(
  dependency: string,
  def: ProjectDefinition,
): void {
  const isDefined = Object.keys(def.dependencies || {}).includes(dependency) ||
    Object.keys(def.devDependencies || {}).includes(dependency) ||
    Object.keys(def.peerDependencies || {}).includes(dependency);

  if (!isDefined) {
    throw new Error(`Package ${dependency} is not defined in this project`);
  }
}

/**
 * Check if `dependency` is installed in the project (not globally)
 *
 * @param {string} dependency Package name
 * @returns {Promise<void>} Resolves if `dependency` is installed.
 * Rejects otherwise.
 */
export function isInstalled(
  dependency: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const lsCheck = spawn(
      /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
      ['ls', dependency],
    )

    lsCheck.stdout.on('data', (data) => {
      const isInstalled = data.includes(dependency) &&
        data.lastIndexOf(dependency) !== 0;

      isInstalled ?
        resolve() :
        reject(
          new Error(`Package ${dependency} is not installed in this project`),
        );
    });
  });
}
