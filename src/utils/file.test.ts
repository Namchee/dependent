import { ProjectFile } from '@/types';
import { describe, expect, it } from 'vitest';
import { getFileExtension } from './file';

describe('getFileExtension', () => {
  it('should get file extension from a file', () => {
    const file: ProjectFile = {
      name: 'foo.ts',
      path: '',
      content: '',
    };

    const type = getFileExtension(file);

    expect(type).toBe('ts');
  });

  it('should strip extended extension files', () => {
    const file: ProjectFile = {
      name: 'foo.tsx',
      path: '',
      content: '',
    };

    const type = getFileExtension(file);

    expect(type).toBe('ts');
  });
})
