#!/usr/bin/env node

import ora from 'ora';
import chalk from 'chalk';

import { cli } from './cli';

import { isDefined, isInstalled, resolvePackageJSON } from './package';
import { getProjectFiles } from './file';
import { getDependantFiles } from './import';
import { showDependantFiles } from './logger';

(async () => {
  const args = cli.parseSync();

  const spinner = ora().start();

  try {
    const dependency = args.package as string;

    spinner.text = chalk.greenBright('Scanning project directory...');

    const projectDef = resolvePackageJSON();
    const silent = args.silent;
    const table = args.table;

    spinner.text = chalk.greenBright('Checking package installation...');

    isDefined(dependency, projectDef);
    await isInstalled(dependency);

    spinner.text = chalk.greenBright('Analyzing package dependency...');

    const files = getProjectFiles(args.files, silent);
    const dependant = getDependantFiles(
      files,
      dependency,
      {
        silent,
      },
    );

    spinner.succeed(chalk.greenBright('Analysis completed successfully'));

    showDependantFiles(dependant, dependency, table);
  } catch (err) {
    const error = err as Error;

    spinner.fail(chalk.redBright(error.message));
    console.log(chalk.cyanBright('Terminating...'));
  }
})();
