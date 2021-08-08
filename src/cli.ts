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
    default: [
      '!(node_modules|__tests__|test)/**/*!(.spec|test).js',
      '!(node_modules|__tests__|test)/**/*!(.spec|test).mjs',
      '!(node_modules|__tests__|test)/**/*!(.spec|test).ts',
      '!(node_modules|__tests__|test)/**/*!(.spec|test).jsx',
      '!(node_modules|__tests__|test)/**/*!(.spec|test).tsx',
      '*!(.spec|test).js',
      '*!(.spec|test).mjs',
      '*!(.spec|test).ts',
      '*!(.spec|test).jsx',
      '*!(.spec|test).tsx',
    ],
  })
  .options({
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
