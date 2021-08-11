import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { spawn } from 'child_process';

import { InstallationStatus, ProjectDefinition, ProjectFile } from './types';
import { getParserPackage } from './parser';

/**
 * Get all information of the project from `package.json`
 *
 * @returns {ProjectDefinition} Project definition. Refer to the type.
 */
export function resolvePackageJSON(): ProjectDefinition {
  const path = resolve(process.cwd(), 'package.json');

  // check the existence of package.json or in layman terms,
  // is the current workdir a NodeJS project directory?
  if (!existsSync(path)) {
    // eslint-disable-next-line max-len
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

/**
 * Check if `dependency` is installed globally
 *
 * @param {string} dependency Package name
 * @returns {Promise<void>} Resolves if `dependency` is installed.
 * Rejects otherwise.
 */
function isInstalledGlobally(
  dependency: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const lsCheck = spawn(
      /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
      ['ls', dependency, '-g'],
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

export async function checkParserInstallation(
  files: ProjectFile[],
): Promise<InstallationStatus> {
  const parsers: InstallationStatus = {};

  const fileExts = files.map(file => file.name.split('.').pop());
  const exts = [...new Set(fileExts as string[])];

  for (const ext of exts) {
    try {
      const pak = getParserPackage(ext);
      const promises = await Promise.allSettled(
        [isInstalled(pak), isInstalledGlobally(pak)],
      );

      if (promises[0].status === 'fulfilled') {
        parsers[ext] = 'local';
      } else if (promises[1].status === 'fulfilled') {
        parsers[ext] = 'global';
      } else {
        parsers[ext] = 'none';
      }
    } catch (err) {
      continue;
    }
  }

  return parsers;
}
