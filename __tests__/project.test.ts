import { jest } from '@jest/globals';

import { getDependantFiles } from '../src/import';
import { ProjectFile } from './../src/types';

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllTimers();
});

describe('Parser tolerance test', () => {
  it('should throw an error when silent is false', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'src/a.js',
        content: 'const a =',
      },
    ];

    expect(getDependantFiles(files, 'express', {
      silent: false,
    })).rejects.toBeTruthy();
  });

  it('should not throw an error when silent is true', async () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'src/a.js',
        content: 'const a =',
      },
    ];

    const dependants = await getDependantFiles(files, 'express', {
      silent: true,
    });

    expect(dependants.length).toBe(0);
  });
});
