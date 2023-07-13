#!/usr/bin/env node

import ora from 'ora';
import chalk from 'chalk';

import { cli } from '@/cli';

import { isDefined, isInstalled, resolvePackageJSON } from '@/service/package';
import { getProjectFiles } from '@/service/file';

import { getDependantFiles } from '@/service/import';
import { showDependants } from '@/service/log';
import { getDependantScript } from '@/service/shell';

(async () => {
  const args = cli.parseSync();
  const spinner = ora().start();

  try {
    const dependency = args.package as string;

    spinner.text = chalk.greenBright('Scanning project directory...');

    const { silent, table, precheck } = args;

    if (precheck) {
      spinner.text = chalk.greenBright('Checking package installation...');

      isDefined(dependency, resolvePackageJSON());
      await isInstalled(dependency);
    }

    const files = getProjectFiles(args.files, silent);

    spinner.text = chalk.greenBright('Analyzing package dependency...');

    const dependant = await Promise.all([
      getDependantFiles(
        files,
        dependency,
        {
          silent,
        },
      ),
      getDependantScript(dependency),
    ]);

    spinner.succeed(chalk.greenBright('Analysis completed successfully'));

    showDependants({
      files: dependant[0],
      scripts: dependant[1],
    }, dependency, table);
  } catch (err) {
    const error = err as Error;

    spinner.fail(chalk.redBright(error.message));
    console.log(chalk.cyanBright('Terminating...'));
  }
})();
