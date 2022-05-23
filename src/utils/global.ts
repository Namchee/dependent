import { resolve } from 'path';

import { executeCommand } from '@/utils/cmd';

let npmPath: string;
let yarnPath: string;
let pnpmPath: string;

/**
 * Get the current npm global installation path
 *
 * @returns {Promise<string>} global NPM path
 */
export async function getGlobalNPMPath(): Promise<string> {
  if (npmPath) {
    return npmPath;
  }

  console.log(`path: ${npmPath}`);

  const path = await executeCommand(
    /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
    ['root', '--global'],
  );
  npmPath = path.toString().trim();

  return npmPath;
}

/**
 * Get the current yarn global installation path
 *
 * @returns {Promise<string>} global Yarn path
 */
export async function getGlobalYarnPath(): Promise<string> {
  if (yarnPath) {
    return yarnPath;
  }

  const path = await executeCommand(
    /^win/.test(process.platform) ? 'yarn.cmd' : 'yarn',
    ['global', 'dir'],
  );
  yarnPath = resolve(path.toString().trim(), 'node_modules');

  return yarnPath;
}

/**
 * Get the current pnpm global installation path
 *
 * @returns {Promise<string>} global pnpm path
 */
export async function getGlobalPnpmPath(): Promise<string> {
  if (pnpmPath) {
    return pnpmPath;
  }

  const path = await executeCommand(
    /^win/.test(process.platform) ? 'pnpm.cmd' : 'pnpm',
    ['root', '--global'],
  );
  pnpmPath = path.toString().trim();

  return pnpmPath;
}
