#!/usr/bin/env node

import ora from 'ora';
import chalk from 'chalk';
import yargs from 'yargs';

import { isDefined, isInstalled, resolvePackageJSON } from './package';
import { getProjectFiles } from './file';
import { getDependantFiles } from './project';

const args = yargs.command(
  '$0 <package_name>',
  'Analyze package usage in your project directory',
).parseSync();

const spinner = ora().start();

try {
  const dependency = args.package_name as string;

  spinner.text = chalk.greenBright('Scanning project directory...');

  const projectDef = resolvePackageJSON();
  spinner.text = chalk.greenBright('Checking package status...');

  isDefined(dependency, projectDef);
  isInstalled(dependency);

  spinner.text = chalk.greenBright('Analyzing package dependency...');

  const files = getProjectFiles();
  const dependant = getDependantFiles(files, dependency, false);

  console.log(dependant);
} catch (err) {
  const error = err as Error;

  spinner.fail(chalk.redBright(error.message));
  console.log(chalk.cyanBright('Terminating...'));
}
