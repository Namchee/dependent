import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getDependantFiles } from '@/service/import';

import type { ProjectFile } from '@/types';

describe('Parser tolerance test', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  })

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
