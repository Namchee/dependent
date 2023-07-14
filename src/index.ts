#!/usr/bin/env node

import ora from 'ora';
import chalk from 'chalk';

import { cli } from '@/cli';

import { isDefined, isInstalled, resolvePackageJSON } from '@/service/package';
import { getProjectFiles } from '@/service/file';

import { getDependantFiles } from '@/service/import';
import { getDependantScript } from '@/service/script';
import { showDependantFiles, showDependantScripts } from './service/log';

(async () => {
  const args = cli.parseSync();
  const spinner = ora().start();

  try {
    const dependency = args.package as string;

    spinner.text = chalk.greenBright('Scanning project directory...');

    const { silent, table, precheck, include } = args;

    if (precheck) {
      spinner.text = chalk.greenBright('Checking package installation...');

      isDefined(dependency, resolvePackageJSON());
      await isInstalled(dependency);
    }

    const files = getProjectFiles(args.files, silent);

    if (include.includes('files')) {
      spinner.text = chalk.greenBright('Analyzing project files for dependency...');

      const dependantFiles = await getDependantFiles(
        files,
        dependency,
        {
          silent,
        },
      );

      showDependantFiles(dependantFiles, dependency, { format: table ? 'table' : 'lines' });
    }

    if (include.includes('scripts')) {
      spinner.text = chalk.greenBright('Analyzing project scripts for dependency...');

      const dependantScripts = getDependantScript(dependency);

      showDependantScripts(dependantScripts, dependency, { format: table ? 'table' : 'lines' });
    }

    spinner.succeed(chalk.greenBright('Analysis completed successfully'));
  } catch (err) {
    const error = err as Error;

    spinner.fail(chalk.redBright(error.message));
    console.log(chalk.cyanBright('Terminating...'));
  }
})();
