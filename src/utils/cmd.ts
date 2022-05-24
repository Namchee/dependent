import { spawn } from 'child_process';

/**
 * Execute a command line command and return the result
 *
 * @param {string} cmd command line command
 * @param {string[]} args command line arguments
 * @returns {Promise<Buffer>} output
 */
export function executeCommand(cmd: string, args: string[]): Promise<Buffer> | nul {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(cmd, args);

    childProcess.stdout.on('data', (data: Buffer) => resolve(data));
    childProcess.on('error', () => resolve(null));
  });
}
