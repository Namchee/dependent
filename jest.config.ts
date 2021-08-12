import type { Config } from '@jest/types';

/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  verbose: true,
  transform: {},
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};

export default config;
