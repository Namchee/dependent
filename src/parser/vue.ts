import globalDirectories from 'global-dirs';
import path from 'path';

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
    path.posix.resolve('node_modules', ...basePath),
    import.meta.url,
  );
  const npmPath = new URL(
    path.posix.resolve(globalDirectories.npm.packages, ...basePath),
    import.meta.url,
  );
  const yarnPath = new URL(
    path.posix.resolve(globalDirectories.yarn.packages, ...basePath),
    import.meta.url,
  );

  const imports = await Promise.allSettled([
    import(localPath.toString()),
    import(npmPath.toString()),
    import(yarnPath.toString()),
  ]);

  for (let i = 0; i < imports.length; i++) {
    const impor = imports[i];

    if (impor.status === 'fulfilled') {
      vue = impor.value.default as typeof import('@vue/compiler-sfc');
      break;
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
export async function getVueImportLines(
  content: string,
  dependency: string,
): Promise<number[]> {
  if (!vue) {
    throw new Error('No Vue parsers available');
  }

  const node = vue.parse(content);
  const script = node.descriptor.script ?? node.descriptor.scriptSetup;

  if (script) {
    const startingLine = script.loc.start.line;
    if (script.lang === 'vue') {
      throw new Error('Circular parser dependency');
    }

    const parser = getParser(script.lang || 'js');

    const lines = await parser(script.content, dependency);
    // -1, since the `<script>` block shouldn't count
    return lines.map(line => line + startingLine - 1);
  }

  return [];
}
