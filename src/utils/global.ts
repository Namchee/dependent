import { resolve } from 'path';

import { executeCommand } from '@/utils/cmd';

let globs: string[] = [];

/**
 * Get the current npm global installation path
 *
 * @returns {Promise<string>} global NPM path
 */
async function getGlobalNPMPath(): Promise<string> {
  try {
    const path = await executeCommand(
      /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
      ['root', '--global'],
    );

    return path.toString().trim();
  } catch (err) {
    const error = err as Error;

    if (error.message === 'Command not found') {
      return '';
    }

    throw err;
  }
}

/**
 * Get the current yarn global installation path
 *
 * @returns {Promise<string>} global Yarn path
 */
async function getGlobalYarnPath(): Promise<string> {
  try {
    const path = await executeCommand(
      /^win/.test(process.platform) ? 'yarn.cmd' : 'yarn',
      ['global', 'dir'],
    );

    return resolve(path.toString().trim(), 'node_modules');
  } catch (err) {
    const error = err as Error;

    if (error.message === 'Command not found') {
      return '';
    }

    throw err;
  }
}

/**
 * Get the current pnpm global installation path
 *
 * @returns {Promise<string>} global pnpm path
 */
async function getGlobalPnpmPath(): Promise<string> {
  try {
    const path = await executeCommand(
      /^win/.test(process.platform) ? 'pnpm.cmd' : 'pnpm',
      ['root', '--global'],
    );

    return path.toString().trim();
  } catch (err) {
    const error = err as Error;

    if (error.message === 'Command not found') {
      return '';
    }

    throw err;
  }
}

export async function getGlobs(): Promise<string[]> {
  if (globs.length) {
    return globs;
  }

  const managerPaths = await Promise.allSettled([
    getGlobalNPMPath(),
    getGlobalYarnPath(),
    getGlobalPnpmPath(),
  ]);

  globs = managerPaths
    .map(result => result.status === 'fulfilled' ? result.value : '')
    .filter(Boolean);

  return globs;
}
