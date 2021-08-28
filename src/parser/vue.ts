import globalDirectories from 'global-dirs';
import { resolve } from 'path/posix';
import { getParser } from '.';

let vue: typeof import('@vue/compiler-sfc');

try {
  const basePath = [
    '@vue',
    'compiler-sfc',
    'dist',
    'compiler-sfc.cjs.js',
  ];
  const localPath = new URL(
    resolve('node_modules', ...basePath),
    import.meta.url,
  );
  const npmPath = new URL(
    resolve(globalDirectories.npm.packages, ...basePath),
    import.meta.url,
  );
  const yarnPath = new URL(
    resolve(globalDirectories.yarn.packages, ...basePath),
    import.meta.url,
  );

  const imports = await Promise.allSettled([
    import(localPath.toString()),
    import(npmPath.toString()),
    import(yarnPath.toString()),
  ]);

  for (const impor of imports) {
    if (impor.status === 'fulfilled') {
      vue = impor.value.default as typeof import('@vue/compiler-sfc');
      break;
    } else {
      console.log (impor.reason);
    }
  }
} catch (err) {
  /* ignore for now */
}

/**
 * Analyze Vue file for all imports to `dependency`
 *
 * @param {string} content File content
 * @param {string} dependency Package name
 * @returns {number[]} List of line numbers where `dependency`
 * is imported.
 */
export function getVueImportLines(
  content: string,
  dependency: string,
): number[] {
  if (!vue) {
    throw new Error('No Vue parsers available');
  }

  const node = vue.parse(content);
  const script = node.descriptor.script ?? node.descriptor.scriptSetup;

  if (script) {
    const parser = getParser(script.lang || 'js');

    return parser(script.content, dependency);
  }

  return [];
}
