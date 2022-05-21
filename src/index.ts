#!/usr/bin/env node

import ora from 'ora';
import chalk from 'chalk';

import { cli } from '@/cli';

import { isDefined, isInstalled, resolvePackageJSON } from '@/service/package';
import { getProjectFiles } from '@/service/file';

import { getDependantFiles } from './service/import';
import { showDependantFiles } from './service/log';

(async () => {
  const args = cli.parseSync();
  const spinner = ora().start();

  try {
    const dependency = args.package as string;

    spinner.text = chalk.greenBright('Scanning project directory...');

    const projectDef = resolvePackageJSON();
    const { silent } = args;
    const { table } = args;

    spinner.text = chalk.greenBright('Checking package installation...');

    isDefined(dependency, projectDef);
    await isInstalled(dependency);

    const files = getProjectFiles(args.files, silent);

    spinner.text = chalk.greenBright('Analyzing package dependency...');

    const dependant = await getDependantFiles(
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
