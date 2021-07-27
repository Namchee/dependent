import { getDependantFiles } from './../src/project';
import { ProjectFile } from './../src/types';

describe('ES Module import test', () => {
  it('should be able to distinguish default exports', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'import express from \'express\'; const app = express();',
      },
    ];

    const dependants = getDependantFiles(files, 'express', true);
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish named exports', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'import { json } from \'express\'; app.use(json())',
      },
    ];

    const dependants = getDependantFiles(files, 'express', true);
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish unnamed modules', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'import \'express\';',
      },
    ];

    const dependants = getDependantFiles(files, 'express', true);
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish all-module import', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'import * as express from \'express\';',
      },
    ];

    const dependants = getDependantFiles(files, 'express', true);
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish dynamic imports', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'const a = import(\'express\');',
      },
    ];

    const dependants = getDependantFiles(files, 'express', true);
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish module imports nested in code', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: `(async () => {
          if (somethingIsTrue) {
            await import('express');
          }
        })();`,
      },
    ];

    const dependants = getDependantFiles(files, 'express', true);
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
    expect(dependants[0].lineNumbers[0]).toBe(3);
  });
});
