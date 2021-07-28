import { cli } from './../src/cli';

describe('CLI test', () => {
  it('should be able to accomodate simple usage', () => {
    const args = cli.parseSync('express');

    expect(args.package).toBe('express');
  });

  it('should be able to parse module option', () => {
    const args = cli.parseSync('express --module');

    expect(args.package).toBe('express');
    expect(args.module).toBe(true);
  });

  it('should be able to parse script option', () => {
    const args = cli.parseSync('express --script');

    expect(args.package).toBe('express');
    expect(args.script).toBe(true);
  });

  it('should throw an error when `script` and `module` is `true`', () => {
    try {
      cli.parseSync('express --script --module');

      throw new Error(
        'Should throw an error since `script` and `module` are `true`',
      )
    } catch (err) {
      expect(1).toBe(1);
    }
  });

  it('should be able to parse file pattern option', () => {
    const args = cli.parseSync('express src/**/*.js');

    expect(args.package).toBe('express');
    expect(args.files).toContain('src/**/*.js');
  });

  it('should be able to parse multi file patterns option', () => {
    const args = cli.parseSync('express src/**/*.js bin/**/*.js');

    expect(args.package).toBe('express');
    expect(args.files).toContain('src/**/*.js');
    expect(args.files).toContain('bin/**/*.js');
  });

  it('should be able to accomodate complex usage', () => {
    const args = cli.parseSync('express src/**/*.js bin/**/*.js --module');

    expect(args.package).toBe('express');
    expect(args.files).toContain('src/**/*.js');
    expect(args.files).toContain('bin/**/*.js');
    expect(args.module).toBe(true);
  });
});
