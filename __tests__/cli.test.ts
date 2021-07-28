import { cli } from './../src/cli';

describe('CLI test', () => {
  it('should be able to accomodate simple usage', () => {
    const args = cli.parseSync('express');

    expect(args.package).toBe('express');
  });

  it('should be able to parse module option', () => {
    const args = cli.parseSync('express --module=false');

    expect(args.package).toBe('express');
    expect(args.module).toBe(false);
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
    const args = cli.parseSync('express src/**/*.js bin/**/*.js --module=true');

    expect(args.package).toBe('express');
    expect(args.files).toContain('src/**/*.js');
    expect(args.files).toContain('bin/**/*.js');
    expect(args.module).toBe(true);
  });
});
