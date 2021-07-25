import { existsSync } from 'fs';
import { resolve } from 'path';

import { ProjectDefinition } from './types';

export function resolvePackageJSON(): ProjectDefinition {
  const workdir = process.cwd();
  const path = resolve(workdir, 'package.json');

  // check the existence of package.json or in layman terms,
  // is the current workdir a NodeJS project directory?
  if (!existsSync(path)) {
    // eslint-disable-next-line max-len
    throw new Error('The current project directory is not a NodeJS-based project. Dep dive can only analyze dependencies in NodeJS-based project.');
  }

  try {
    const projectDef = require(path);

    return {
      name: projectDef.name,
      dependencies: projectDef.dependencies,
      devDependencies: projectDef.devDependencies,
      peerDependencies: projectDef.peerDependencies,
    };
  } catch (err) {
    throw new Error('Invalid package.json schema.');
  }
}
