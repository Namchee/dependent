import { getJSImportLines } from '../../src/parser/js';

describe('ESModule import test', () => {
  it('should be able to parse default imports', () => {
    const content = 'import express from \'express\'; const app = express();';

    const dependants = getJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse named imports', () => {
    const content = 'import { json } from \'express\'; app.use(json());';

    const dependants = getJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse aliased imports', () => {
    const content = 'import { json as jeson } from \'express\';';

    const dependants = getJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse unnamed imports', () => {
    const content = 'import \'express\';';

    const dependants = getJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse all-module import', () => {
    const content = 'import * as express from \'express\';';

    const dependants = getJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse dynamic imports', () => {
    const content = 'const a = import(\'express\');';

    const dependants = getJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse module imports nested in code', () => {
    const content = `(async () => {
      if (somethingIsTrue) {
        await import('express');
      }
    })();`;

    const dependants = getJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(3);
  });

  it('should be able to parse false alarms', () => {
    const content = `const a = "import express from 'express'";`;

    const dependants = getJSImportLines(content, 'express');
    expect(dependants.length).toBe(0);
  });

  it('should be able to parse shebanged files', () => {
    const content = `#!/usr/bin/env node

    import express from 'express';

    const app = express();`;

    const dependants = getJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(3);
  });

  it('should be able to tolerate CommonJS imports', () => {
    const content = `const express = require('express');

    const app = express();`;

    const dependants = getJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });
});
