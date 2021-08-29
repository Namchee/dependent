import { getDependantFiles } from '../src/import';
import { ProjectFile } from './../src/types';

describe('Parser tolerance test', () => {
  it('should throw an error when silent is false', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'src/a.js',
        content: 'const a =',
      },
    ];

    expect(() => getDependantFiles(files, 'express', {
      silent: false,
    })).toThrowError('Failed to parse src/a.js');
  });

  it('should not throw an error when silent is true', async () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'src/a.js',
        content: 'const a =',
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      silent: true,
    });

    expect(dependants.length).toBe(0);
  });
});
