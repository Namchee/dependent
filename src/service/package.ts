import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { spawn } from 'child_process';

import { ProjectDefinition } from '../constant/types';

/**
 * Get all information of the project from `package.json`
 *
 * @returns {ProjectDefinition} Project definition. Refer to the type.
 */
export function resolvePackageJSON(): ProjectDefinition {
  const path = resolve(process.cwd(), 'package.json');

  // Check package.json existence
  if (!existsSync(path)) {
    throw new Error(
      'The current project directory is not a NodeJS-based project',
    );
  }

  try {
    const projectDef = JSON.parse(readFileSync(path, 'utf-8'));

    return {
      name: projectDef.name,
      dependencies: projectDef.dependencies,
      devDependencies: projectDef.devDependencies,
      peerDependencies: projectDef.peerDependencies,
    };
  } catch (err) {
    const { message } = err as Error;

    throw new Error(`Failed to read package.json: ${message}`);
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
