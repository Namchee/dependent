import { resolve } from 'path';
import { pathToFileURL } from 'url';

import { getTSImportLines } from '@/service/parser/ts';

let compiler: typeof import('@vue/compiler-sfc');

export async function loadVueCompiler(globs: string[]): Promise<void> {
  // Do not load the compiler twice
  if (compiler) {
    return;
  }

  const { dependencies } = resolveDependencyPackageJSON('vue');
  const compilerVersion = dependencies['@vue/compiler-sfc'];

  const manualCompilerPath = [
    '@vue',
    'compiler-sfc',
    'dist',
    'compiler-sfc.cjs.js',
  ];

  // For Vue 3, but older than 3.2
  const pnpmCompilerPath = [
    '.pnpm',

  ]

  // For Vue 3.2+
  const newCompilerPath = [
    'vue',
    'compiler-sfc',
    'index.js',
  ];

  const paths = [
    resolve(process.cwd(), 'node_modules', ...newCompilerPath),
    resolve(process.cwd(), 'node_modules', ...manualCompilerPath),
    ...globs.map(path => resolve(path, ...newCompilerPath)),
    ...globs.map(path => resolve(path, ...manualCompilerPath)),
  ];

  const imports = paths.map(path => import(pathToFileURL(path).toString()));
  const compilerImports = await Promise.allSettled(imports);

  for (let i = 0; i < compilerImports.length; i++) {
    const fileModule = compilerImports[i];

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
  globs: string[],
): Promise<number[]> {
  if (!compiler) {
    await loadVueCompiler(globs);
  }

  const node = compiler.parse(content);
  const script = node.descriptor.script ?? node.descriptor.scriptSetup;

  if (script) {
    const startingLine = script.loc.start.line;

    const lines = await getTSImportLines(script.content, dependency, globs);
    // -1, since the `<script>` block shouldn't count
    return lines.map(line => line + startingLine - 1);
  }

  return [];
}
