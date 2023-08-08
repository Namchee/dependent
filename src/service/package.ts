import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import { executeCommand } from '@/utils/cmd';

import type { ProjectDefinition } from '@/types';

type PackageManager = 'npm' | 'yarn' | 'pnpm';
const pmCommands: Record<PackageManager, string> = {
  npm: 'ls',
  pnpm: 'ls',
  yarn: 'why',
}

/**
 * Get the current package manager used in the current project
 *
 * @returns {PackageManager} package manager
 */
function getPackageManager(): PackageManager {
  const npmPath = resolve(process.cwd(), 'package-lock.json');
  if (existsSync(npmPath)) {
    return 'npm';
  }

  const yarnPath = resolve(process.cwd(), 'yarn.lock');
  if (existsSync(yarnPath)) {
    return 'yarn';
  }

  return 'pnpm';
}

/**
 * Get all information of the current project from `package.json`
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
      name: projectDef.name ?? '',
      executables: projectDef.bin ?? {},
      scripts: projectDef.scripts ?? {},
      dependencies: projectDef.dependencies ?? {},
      devDependencies: projectDef.devDependencies ?? {},
      peerDependencies: projectDef.peerDependencies ?? {},
    };
  } catch (err) {
    const { message } = err as Error;

    throw new Error(`Failed to read package.json: ${message}`);
  }
}

/**
 * Get all information of a dependency from its `package.json`
 *
 * @param {string} dependency dependency name
 * @returns {ProjectDefinition} Project definition. Refer to the type.
 */
export function resolveDependencyPackageJSON(
  dependency: string,
): ProjectDefinition {
  const path = resolve(process.cwd(), 'node_modules', dependency, 'package.json');

  // Check package.json existence
  if (!existsSync(path)) {
    throw new Error(
      `Cannot find metadata for dependency ${dependency}`,
    );
  }

  try {
    const projectDef = JSON.parse(readFileSync(path, 'utf-8'));

    return {
      name: projectDef.name ?? '',
      executables: projectDef.bin ?? {},
      scripts: projectDef.scripts ?? {},
      dependencies: projectDef.dependencies ?? {},
      devDependencies: projectDef.devDependencies ?? {},
      peerDependencies: projectDef.peerDependencies ?? {},
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
export async function isInstalled(
  dependency: string,
): Promise<void> {
  let baseCommand = getPackageManager();
  const command = pmCommands[baseCommand];

  if (/^win/.test(process.platform)) {
    // Resolve windows quirks
    baseCommand = `${baseCommand}.cmd` as PackageManager;
  }

  const lsCheck = await executeCommand(
    baseCommand,
    [command, dependency],
  );

  const status = lsCheck.includes(dependency) &&
    lsCheck.lastIndexOf(dependency) !== 0;

  if (!status) {
    throw new Error(`Package ${dependency} has not been installed in this project`)
  }
}
