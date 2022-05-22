import { describe, it, expect } from 'vitest';

import { cli } from '@/cli';

describe('CLI test', () => {
  it('should be able to accomodate simple usage', () => {
    const args = cli.parseSync('express');

    expect(args.package).toBe('express');
    expect(args.precheck).toBe(true);
  });

  it('should be able to parse file pattern option', () => {
    const args = cli.parseSync('express src/**/*.js');

    expect(args.package).toBe('express');
    expect(args.files).toContain('src/**/*.js');
    expect(args.precheck).toBe(true);
  });

  it('should be able to parse multi file patterns option', () => {
    const args = cli.parseSync('express src/**/*.js bin/**/*.js');

    expect(args.package).toBe('express');
    expect(args.files).toContain('src/**/*.js');
    expect(args.files).toContain('bin/**/*.js');
  });

  it('should be able to parse silent option', () => {
    const args = cli.parseSync('express --silent');

    expect(args.package).toBe('express');
    expect(args.silent).toBe(true);
  });

  it('should be able to parse silent option in alias', () => {
    const args = cli.parseSync('express -s');

    expect(args.package).toBe('express');
    expect(args.silent).toBe(true);
  });

  it('should be able to parse table option', () => {
    const args = cli.parseSync('express --table');

    expect(args.package).toBe('express');
    expect(args.table).toBe(true);
  });

  it('should be able to parse table option in alias', () => {
    const args = cli.parseSync('express -t');

    expect(args.package).toBe('express');
    expect(args.table).toBe(true);
  });

  it('should be able to parse precheck option', () => {
    const args = cli.parseSync('express --precheck=false');

    expect(args.package).toBe('express');
    expect(args.precheck).toBe(false);
  });

  it('should be able to parse precheck option', () => {
    const args = cli.parseSync('express -c=false');

    expect(args.package).toBe('express');
    expect(args.precheck).toBe(false);
  });

  it('should be able to accomodate complex usage', () => {
    const args = cli.parseSync('express src/**/*.js bin/**/*.js');

    expect(args.package).toBe('express');
    expect(args.files).toContain('src/**/*.js');
    expect(args.files).toContain('bin/**/*.js');
  });
});
