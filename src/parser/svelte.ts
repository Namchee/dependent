import globalDirectories from 'global-dirs';
import path from 'path';

let svelte: typeof import('svelte/compiler');

try {
  const basePath = [
    'svelte',
    'compiler.mjs',
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
      svelte = impor.value.default as typeof import('svelte/compiler');
      break;
    } else {
      console.log (impor.reason);
    }
  }
} catch (err) {
  /* ignore for now */
}
