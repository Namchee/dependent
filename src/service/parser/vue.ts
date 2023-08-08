import { resolve } from 'path';
import { pathToFileURL } from 'url';

import { getTSImportLines } from '@/service/parser/ts';

import { getActualVersion } from '@/utils/package';
import { getGlobs } from '@/utils/global';

import { resolveDependencyPackageJSON } from '@/service/package';

let compiler: typeof import('@vue/compiler-sfc');

function getPnpmCompilerPath(): string[] {
  try {
    const { dependencies } = resolveDependencyPackageJSON('vue');
    const compilerVersion = dependencies['@vue/compiler-sfc'];

    return [
      '.pnpm',
      `@vue+compiler-sfc@${getActualVersion(compilerVersion)}`,
      'node_modules',
    ]
  } catch (err) {
    return [];
  }
}

async function loadVueCompiler(): Promise<void> {
  // Do not load the compiler twice
  if (compiler) {
    return;
  }

  const globs = await getGlobs();

  const flatCompilerPath = [
    '@vue',
    'compiler-sfc',
    'dist',
    'compiler-sfc.cjs.js',
  ];

  // For Vue 3.2+
  const newCompilerPath = [
    'vue',
    'compiler-sfc',
    'index.js',
  ];

  const pnpmCompilerPath = getPnpmCompilerPath();

  const nonGlobs = [resolve(process.cwd(), 'node_modules', ...newCompilerPath)];
  if (pnpmCompilerPath.length) {
    nonGlobs.push(
      resolve(process.cwd(), 'node_modules', ...pnpmCompilerPath, ...flatCompilerPath)
    )
  }

  const paths = [
    ...nonGlobs,
    resolve(process.cwd(), 'node_modules', ...flatCompilerPath),
    ...globs.map(path => resolve(path, ...newCompilerPath)),
    ...globs.map(path => resolve(path, ...flatCompilerPath)),
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
): Promise<number[]> {
  if (!compiler) {
    await loadVueCompiler();
  }

  const node = compiler.parse(content);
  const script = node.descriptor.script ?? node.descriptor.scriptSetup;

  if (script) {
    const startingLine = script.loc.start.line;

    const lines = await getTSImportLines(script.content, dependency);

    return lines.map(line => line + startingLine - 1);
  }

  return [];
}
