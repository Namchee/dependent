import { afterEach, beforeEach, describe, vi, it, expect } from 'vitest';

import { getGlobs } from '@/utils/global';

import * as cmd from '@/utils/cmd';

describe('getGlobs', () => {
  beforeEach(() => {
    vi.spyOn(cmd, 'executeCommand')
      .mockImplementation(() => Promise.resolve(Buffer.from('foo-bar')))
      .mockImplementationOnce(() => Promise.resolve(Buffer.from('bar-baz')))
      .mockImplementationOnce(() => Promise.reject(new Error('Command not found')));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set and return globs', async () => {
    const globs = await getGlobs();

    expect(globs).toStrictEqual([
      'bar-baz',
      'foo-bar',
    ]);
  });
});
