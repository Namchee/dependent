import { describe, expect, it } from 'vitest';
import { getActualVersion, getRootPackage } from './package';

describe('getRootPackage', () => {
  it('should be able to get package name', () => {
    const pack = 'foo-bar';
    const root = getRootPackage(pack);

    expect(root).toBe('foo-bar');
  });

  it('should be able to get root package name', () => {
    const pack = 'foo/bar/baz';
    const root = getRootPackage(pack);

    expect(root).toBe('foo');
  });

  it('should be able to get root package name for scoped packages', () => {
    const pack = '@namchee/decora';
    const root = getRootPackage(pack);

    expect(root).toBe('@namchee/decora');
  });

  it('should be able to get root package name for nested scoped packages', () => {
    const pack = '@namchee/decora/dist/index.js';
    const root = getRootPackage(pack);

    expect(root).toBe('@namchee/decora');
  });
});

describe('getInstalledVersion', () => {
  it('should replace nothing', () => {
    const version = '1.6.3';
    const result = getActualVersion(version);

    expect(result).toBe('1.6.3');
  });

  it('should replace ^', () => {
    const version = '^1.6.3';
    const result = getActualVersion(version);

    expect(result).toBe('1.6.3');
  });

  it('should replace ~', () => {
    const version = '~1.6.3';
    const result = getActualVersion(version);

    expect(result).toBe('1.6.3');
  });

  it('should replace <', () => {
    const version = '<1.6.3';
    const result = getActualVersion(version);

    expect(result).toBe('1.6.3');
  });

  it('should replace <> with =', () => {
    const version = '>=1.6.3';
    const result = getActualVersion(version);

    expect(result).toBe('1.6.3');
  });
})
