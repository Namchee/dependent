import yargs from 'yargs';

/**
 * Command line interface definition.
 */
export const cli = yargs
  .command(
    '$0 <package> [files...]',
    'Analyze package usage in your project directory.',
  )
  .usage('Usage: $0 <package> [files...]')
  .positional('package', {
    alias: 'p',
    type: 'string',
    description: 'Package name to be analyzed.',
  })
  .positional('files', {
    alias: 'f',
    type: 'string',
    // eslint-disable-next-line max-len
    description: 'Files to be analyzed in glob pattern relative to the current project directory.',
    // eslint-disable-next-line max-len
    default: ['!(node_modules)/**/*.js', '!(node_modules)/**/*.mjs', '*.js', '*.mjs'],
  })
  .options({
    module: {
      alias: 'm',
      describe: 'Parse all files as ES module files',
      type: 'boolean',
      default: undefined,
      demandOption: false,
      conflicts: 'script',
    },
    require: {
      alias: 'r',
      describe: 'Parse all files as JS scripts',
      type: 'boolean',
      default: undefined,
      demandOption: false,
      conflicts: 'module',
    },
    silent: {
      alias: 's',
      // eslint-disable-next-line max-len
      describe: 'Skip all unreadable and unparseable files instead of throwing errors',
      type: 'boolean',
      default: false,
      demandOption: false,
    },
    table: {
      alias: 't',
      describe: 'Print the output in table format',
      type: 'boolean',
      default: false,
      demandOption: false,
    },
  });
