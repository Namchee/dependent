import { resolve } from 'path';

import globalDirs from 'global-dirs';

import { getParser } from '.';

let vue: typeof import('@vue/compiler-sfc');

try {
  const basePath = [
    '@vue',
    'compiler-sfc',
    'dist',
    'compiler-sfc.cjs.js',
  ];
  const localPath = resolve(process.cwd(), 'node_modules', ...basePath);
  const npmPath = resolve(globalDirs.npm.packages, ...basePath);
  const yarnPath = resolve(globalDirs.yarn.packages, ...basePath);

  const imports = await Promise.allSettled([
    import(localPath),
    import(npmPath),
    import(yarnPath),
  ]);

  for (let i = 0; i < imports.length; i++) {
    const impor = imports[i];

    if (impor.status === 'fulfilled') {
      vue = impor.value.default as typeof import('@vue/compiler-sfc');
      break;
    }
  }
} catch (_) {
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
