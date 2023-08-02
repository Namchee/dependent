import { resolve } from 'path';
import { pathToFileURL } from 'url';

import { resolveDependencyPackageJSON } from '@/service/package';

import { getActualVersion } from '@/utils/package';

import type { RootNode } from '@astrojs/compiler';

let compiler: typeof import('@astrojs/compiler');
let utils: typeof import('@astrojs/compiler/utils');

export async function loadAstroCompiler(globs: string[]): Promise<void> {
  const result = await Promise.allSettled([
    loadAstroCoreCompiler(globs),
    loadAstroUtils(globs),
  ])

  console.log('called');

  console.log(result);
}

async function loadAstroCoreCompiler(globs: string[]): Promise<void> {
  // Do not load the compiler twice
  if (compiler) {
    return;
  }

  const { dependencies } = resolveDependencyPackageJSON('astro');
  const compilerVersion = dependencies['@astrojs/compiler'];

  const compilerPath = [
    '@astrojs',
    'compiler',
    'dist',
    'node',
    'index.js',
  ];

  // For Vue 3, but older than 3.2 on pnpm
  const pnpmCompilerPath = [
    '.pnpm',
    `@astrojs+compiler@${getActualVersion(compilerVersion)}`,
    'node_modules',
    ...compilerPath,
  ]

  const paths = [
    resolve(process.cwd(), 'node_modules', ...compilerPath),
    resolve(process.cwd(), 'node_modules', ...pnpmCompilerPath),
    ...globs.map(path => resolve(path, ...compilerPath)),
    ...globs.map(path => resolve(path, ...pnpmCompilerPath)),
  ];

  const imports = paths.map(path => import(pathToFileURL(path).toString()));
  const compilerImports = await Promise.allSettled(imports);

  for (let i = 0; i < compilerImports.length; i++) {
    const fileModule = compilerImports[i];

    console.log(fileModule);

    if (fileModule.status === 'fulfilled') {
      compiler = fileModule.value as typeof import('@astrojs/compiler');
      return;
    }
  }

  throw new Error('No Astro parser available');
}

async function loadAstroUtils(globs: string[]): Promise<void> {
  // Do not load the compiler twice
  if (compiler) {
    return;
  }

  const { dependencies } = resolveDependencyPackageJSON('astro');
  const compilerVersion = dependencies['@astrojs/compiler'];

  const compilerPath = [
    '@astrojs',
    'compiler',
    'dist',
    'node',
    'utils.js',
  ];

  // For Vue 3, but older than 3.2 on pnpm
  const pnpmCompilerPath = [
    '.pnpm',
    `@astrojs+compiler@${getActualVersion(compilerVersion)}`,
    'node_modules',
    ...compilerPath,
  ]

  const paths = [
    resolve(process.cwd(), 'node_modules', ...compilerPath),
    resolve(process.cwd(), 'node_modules', ...pnpmCompilerPath),
    ...globs.map(path => resolve(path, ...compilerPath)),
    ...globs.map(path => resolve(path, ...pnpmCompilerPath)),
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

export function parseNode(
  sourceNode: RootNode,
  dependency: string,
): number[] {
  const lines: number[] = [];
  const scriptNodes: string[] = [];

  utils.walk(sourceNode, (node) => {
    if (node.type === 'frontmatter') {
      scriptNodes.push(node.value);
      console.log(node.value);
    }
  });

  return lines;
}


export async function getAstroImportLines(
  content: string,
  dependency: string,
): Promise<number[]> {
  console.log(compiler, utils);
  if (!compiler || !utils) {
    throw new Error('Astro compiler has not been loaded yet');
  }

  const nodeTree = await compiler.parse(content);
  return parseNode(nodeTree.ast, dependency);
}
