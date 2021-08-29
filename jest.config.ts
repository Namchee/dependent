import type { Config } from '@jest/types';

/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
const config: Config.InitialOptions = {
  // https://jestjs.io/docs/ecmascript-modules
  transform: {},
  verbose: true,
  // https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/#use-esm-presets; 'manual configuration' didn't work
  preset: 'ts-jest/presets/js-with-ts-esm',
  extensionsToTreatAsEsm: ['.ts'],
  timers: 'fake',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  testEnvironment: 'node',
};

export default config;
