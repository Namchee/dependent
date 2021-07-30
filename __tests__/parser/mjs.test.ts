import { getESModulesImportLines } from './../../src/parser/mjs';

describe('ESModule import test', () => {
  it('should be able to distinguish default imports', () => {
    const content = 'import express from \'express\'; const app = express();';

    const dependants = getESModulesImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to distinguish named imports', () => {
    const content = 'import { json } from \'express\'; app.use(json());';

    const dependants = getESModulesImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to distinguish unnamed imports', () => {
    const content = 'import \'express\';';

    const dependants = getESModulesImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to distinguish all-module import', () => {
    const content = 'import * as express from \'express\';';

    const dependants = getESModulesImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to distinguish dynamic imports', () => {
    const content = 'const a = import(\'express\');';

    const dependants = getESModulesImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to distinguish module imports nested in code', () => {
    const content = `(async () => {
      if (somethingIsTrue) {
        await import('express');
      }
    })();`;

    const dependants = getESModulesImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(3);
  });

  it('should be able to distinguish false alarms', () => {
    const content = `const a = "import express from 'express'";`;

    const dependants = getESModulesImportLines(content, 'express');
    expect(dependants.length).toBe(0);
  });

  it('should be able to parse shebanged files', () => {
    const content = `#!/usr/bin/env node

    import express from 'express';

    const app = express();`;

    const dependants = getESModulesImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(3);
  });

  it('should be able to tolerate CommonJS imports', () => {
    const content = `const express = require('express');

    const app = express();`;

    const dependants = getESModulesImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });
});
