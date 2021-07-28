import yargs from 'yargs';

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
    description: 'Files to be analyzed in glob pattern.',
    // eslint-disable-next-line max-len
    default: `['!(node_modules)/**/*.js', '!(node_modules)/**/*.mjs', '*.js', '*.mjs']`,
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
    script: {
      alias: 's',
      describe: 'Parse all files as JS scripts',
      type: 'boolean',
      default: undefined,
      demandOption: false,
      conflicts: 'module',
    },
  });
