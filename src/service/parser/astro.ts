import { resolve } from 'path';
import { pathToFileURL } from 'url';

import { resolveDependencyPackageJSON } from '@/service/package';
import { getTSImportLines } from '@/service/parser/ts';

import { getActualVersion } from '@/utils/package';
import { getGlobs } from '@/utils/global';

import type { RootNode } from '@astrojs/compiler';

let compiler: typeof import('@astrojs/compiler');
let utils: typeof import('@astrojs/compiler/utils');

export async function loadAstroCompiler(): Promise<void> {
  const globs = await getGlobs();

  await Promise.allSettled([
    loadAstroCoreCompiler(globs),
    loadAstroUtils(globs),
  ]);
}

function getPnpmCompilerPath(): string[] {
  try {
    const { dependencies } = resolveDependencyPackageJSON('astro');
    const compilerVersion = dependencies['@astrojs/compiler'];

    return [
      '.pnpm',
      `@astrojs+compiler@${getActualVersion(compilerVersion)}`,
      'node_modules',
    ]
  } catch (err) {
    return [];
  }
}

async function loadAstroCoreCompiler(globs: string[]): Promise<void> {
  // Do not load the compiler twice
  if (compiler) {
    return;
  }

  const compilerPath = [
    '@astrojs',
    'compiler',
    'node',
    'index.js',
  ];
  const newCompilerPath = [
    '@astrojs',
    'compiler',
    'dist',
    'node',
    'index.js',
  ];

  const pnpmCompilerPath = getPnpmCompilerPath();

  const nonGlobs = [
    resolve(process.cwd(), 'node_modules', ...compilerPath),
    resolve(process.cwd(), 'node_modules', ...newCompilerPath),
  ];
  if (pnpmCompilerPath.length) {
    nonGlobs.push(
      resolve(process.cwd(), 'node_modules', ...pnpmCompilerPath, ...compilerPath),
      resolve(process.cwd(), 'node_modules', ...pnpmCompilerPath, ...newCompilerPath),
    )
  }

  const paths = [
    ...nonGlobs,
    ...globs.map(path => resolve(path, ...compilerPath)),
  ];

  const imports = paths.map(path => import(pathToFileURL(path).toString()));
  const compilerImports = await Promise.allSettled(imports);

  for (let i = 0; i < compilerImports.length; i++) {
    const fileModule = compilerImports[i];

    if (fileModule.status === 'fulfilled') {
      compiler = fileModule.value as typeof import('@astrojs/compiler');
      return;
    }
  }

  throw new Error('No Astro parser available');
}

async function loadAstroUtils(globs: string[]): Promise<void> {
  // Do not load the compiler twice
  if (utils) {
    return;
  }

  const compilerPath = [
    '@astrojs',
    'compiler',
    'node',
    'utils.js',
  ];
  const newCompilerPath = [
    '@astrojs',
    'compiler',
    'dist',
    'node',
    'utils.js',
  ];

  const pnpmCompilerPath = getPnpmCompilerPath();

  const nonGlobs = [
    resolve(process.cwd(), 'node_modules', ...compilerPath),
    resolve(process.cwd(), 'node_modules', ...newCompilerPath),
  ];
  if (pnpmCompilerPath.length) {
    nonGlobs.push(
      resolve(process.cwd(), 'node_modules', ...pnpmCompilerPath, ...compilerPath),
      resolve(process.cwd(), 'node_modules', ...pnpmCompilerPath, ...newCompilerPath),
    )
  }

  const paths = [
    ...nonGlobs,
    ...globs.map(path => resolve(path, ...compilerPath)),
  ];

  const imports = paths.map(path => import(pathToFileURL(path).toString()));
  const compilerImports = await Promise.allSettled(imports);

  for (let i = 0; i < compilerImports.length; i++) {
    const fileModule = compilerImports[i];

    if (fileModule.status === 'fulfilled') {
      utils = fileModule.value as typeof import('@astrojs/compiler/utils');
      return;
    }
  }

  throw new Error('Failed to load Astro utility');
}

async function getFrontmatter(node: RootNode): Promise<string> {
  return new Promise((resolve) => {
    utils.walk(node, (node) => {
      if (node.type === 'frontmatter') {
        resolve(node.value);
      }
    });
  });
}

export async function parseNode(
  sourceNode: RootNode,
  dependency: string,
): Promise<number[]> {
  const frontmatter = await getFrontmatter(sourceNode);

  return getTSImportLines(frontmatter, dependency);
}

export async function getAstroImportLines(
  content: string,
  dependency: string,
): Promise<number[]> {
  if (!compiler || !utils) {
    throw new Error('Astro compiler has not been loaded yet');
  }

  const nodeTree = await compiler.parse(content);
  return parseNode(nodeTree.ast, dependency);
}
