import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getDependantFiles } from '@/service/import';

import type { ProjectFile } from '@/types';

import * as parsingUtils from '@/service/parser';

describe('Parsing tolerance test', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw an error when silent is false', async () => {
    vi.spyOn(parsingUtils, 'getParser').mockImplementationOnce(() => {
      throw new Error('error when parsing');
    })

    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'src/a.js',
        content: 'const a =',
      },
    ];

    expect(getDependantFiles(files, 'express', {
      silent: false,
    })).rejects.toThrowError();
  });

  it('should not throw an error when silent is true', async () => {
    vi.spyOn(parsingUtils, 'getParser').mockImplementationOnce(() => async () => []);

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
