import { resolve } from 'path';
import { pathToFileURL } from 'url';

import { getGlobalNPMPath, getGlobalYarnPath, getGlobalPnpmPath } from '@/utils/global';
import { getTSImportLines } from '@/service/parser/ts';
import { getJSImportLines } from '@/service/parser/js';

let compiler: typeof import('@vue/compiler-sfc');

/**
 * Get available Vue 3 compiler. Will prioritize locally-installed
 * compiler instead of the global one.
 *
 * @returns {Promise<void>}
 */
export async function loadVueCompiler(): Promise<void> {
  // Do not load the compiler twice
  if (compiler) {
    return;
  }

  const compilerPath = [
    '@vue',
    'compiler-sfc',
    'dist',
    'compiler-sfc.cjs.js',
  ];;
  const globalManagerPath = await Promise.all([
    getGlobalNPMPath(),
    getGlobalYarnPath(),
    getGlobalPnpmPath(),
  ]);

  const localPath = resolve(process.cwd(), 'node_modules', ...compilerPath);
  const npmPath = resolve(globalManagerPath[0], ...compilerPath);
  const yarnPath = resolve(globalManagerPath[1], ...compilerPath);
  const pnpmPath = resolve(globalManagerPath[2], ...compilerPath);

  const imports = await Promise.allSettled([
    import(pathToFileURL(localPath).toString()),
    import(pathToFileURL(npmPath).toString()),
    import(pathToFileURL(yarnPath).toString()),
    import(pathToFileURL(pnpmPath).toString()),
  ]);

  for (let i = 0; i < imports.length; i++) {
    const fileModule = imports[i];

    if (fileModule.status === 'fulfilled') {
      compiler = fileModule.value.default as typeof import('@vue/compiler-sfc');
      return;
    }
  }

  throw new Error('No Vue 3 parser available');
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
  if (!compiler) {
    throw new Error('Vue 3 compiler has not been loaded yet');
  }

  const node = compiler.parse(content);
  const script = node.descriptor.script ?? node.descriptor.scriptSetup;

  if (script) {
    const startingLine = script.loc.start.line;

    const parser = script.lang === 'ts' ? getTSImportLines : getJSImportLines;

    const lines = await parser(script.content, dependency);
    // -1, since the `<script>` block shouldn't count
    return lines.map(line => line + startingLine - 1);
  }

  return [];
}
