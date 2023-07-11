import { describe, it, expect, vi } from "vitest";

import * as service from '@/service/package';

import { getDependantScript } from "./shell";

describe("getDependantScript", () => {
  it("should return an empty array", () => {
    vi.spyOn(service, "resolveDependantPackageJSON").mockImplementationOnce(() => ({
      name: 'eslint',
      executables: {
        'eslint': 'foo-bar',
      },
      scripts: {},
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
    }));

    vi.spyOn(service, "resolvePackageJSON").mockImplementationOnce(() => ({
      name: 'sample-package',
      executables: {},
      scripts: {
        "test": "vitest"
      },
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
    }));

    const result = getDependantScript("eslint");

    expect(result).toStrictEqual([]);
  });

  it("should return array of test scripts", () => {
    vi.spyOn(service, "resolveDependantPackageJSON").mockImplementationOnce(() => ({
      name: 'vitest',
      executables: {
        'vitest': './src/index.js',
      },
      scripts: {},
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
    }));

    vi.spyOn(service, "resolvePackageJSON").mockImplementationOnce(() => ({
      name: 'sample-package',
      executables: {},
      scripts: {
        "test": "vitest",
        "test:coverage": "vitest --coverage",
        "lint": "eslint src/**/*.ts",
      },
      dependencies: {},
      devDependencies: {},
      peerDependencies: {},
    }));

    const result = getDependantScript("vitest");

    expect(result).toStrictEqual(["test", "test:coverage"]);
  });
});
