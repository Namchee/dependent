#!/usr/bin/env node


import ora from 'ora';
import chalk from 'chalk';
import { resolvePackageJSON } from './project';

const spinner = ora('Scanning project directory').start();

try {
  const projectDef = resolvePackageJSON();

  spinner.stop();
  console.log(chalk.cyan(JSON.stringify(projectDef, null, 2)));
} catch (err) {
  spinner.stop();

  const error = err as Error;
  console.error(chalk.redBright(error.message));
}
