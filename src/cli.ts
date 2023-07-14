import yargs from 'yargs';

/**
 * Command line interface definition.
 */
export const cli = yargs(process.argv.slice(2))
  .scriptName('dependent')
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
    description: 'Files to be analyzed in glob pattern relative to the current project directory.',
    default: [
      '!(node_modules)/**/*.js',
      '!(node_modules)/**/*.mjs',
      '!(node_modules)/**/*.ts',
      '!(node_modules)/**/*.jsx',
      '!(node_modules)/**/*.tsx',
      '!(node_modules)/**/*.vue',
      '!(node_modules)/**/*.svelte',
      '*.js',
      '*.mjs',
      '*.ts',
      '*.jsx',
      '*.tsx',
      '*.vue',
      '*.svelte',
    ],
  })
  .options({
    silent: {
      alias: 's',
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
    precheck: {
      alias: 'c',
      describe: 'Check if the package is installed',
      type: 'boolean',
      default: true,
      demandOption: false,
    },
    include: {
      describe: 'Type of possible dependant to be scanned for dependency. Defaults to files and scripts',
      type: 'array',
      default: ['script', 'file'],
      demandOption: false,
    },
  });
