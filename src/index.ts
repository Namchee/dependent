#!/usr/bin/env node

import ora from 'ora';
import chalk from 'chalk';

import { cli } from './cli';

import { isDefined, isInstalled, resolvePackageJSON } from './package';
import { getProjectFiles } from './file';
import { getDependantFiles } from './import';
import { showDependantFiles } from './logger';

const args = cli.parseSync();

const spinner = ora().start();

try {
  const dependency = args.package as string;

  spinner.text = chalk.greenBright('Scanning project directory...');

  const projectDef = resolvePackageJSON();
  const module = args.module || args.script || projectDef.isModule;

  spinner.text = chalk.greenBright('Checking package status...');

  isDefined(dependency, projectDef);
  isInstalled(dependency);

  spinner.text = chalk.greenBright('Analyzing package dependency...');

  const files = getProjectFiles();
  const dependant = getDependantFiles(
    files,
    dependency,
    module,
  );

  spinner.succeed(chalk.greenBright('Analysis completed successfully'));

  showDependantFiles(dependant, dependency);
} catch (err) {
  const error = err as Error;

  spinner.fail(chalk.redBright(error.message));
  console.log(chalk.cyanBright('Terminating...'));
}
