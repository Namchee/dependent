import { getTypeScriptImportLines } from '../../src/parser/ts';

describe('TypeScript parser test', () => {
  it('should be able to parse ES modules import', () => {
    const content = `import express from 'express';`;

    const dependant = getTypeScriptImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse all modules import', () => {
    const content = `import * as express from 'express';`;

    const dependant = getTypeScriptImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse named imports', () => {
    const content = `import { json } from 'express';`;

    const dependant = getTypeScriptImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to aliased imports', () => {
    const content = `import { json as jeson } from 'express';`;

    const dependant = getTypeScriptImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse nameless imports', () => {
    const content = `import 'express';`;

    const dependant = getTypeScriptImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse type import', () => {
    const content = `import type { Application } from 'express';`;

    const dependant = getTypeScriptImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse dynamic imports', () => {
    const content = `const a = import('express');`;

    const dependant = getTypeScriptImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse CommonJS imports', () => {
    const content = `const a = require('express');`;

    const dependant = getTypeScriptImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse shebanged files', () => {
    const content = `#!/usr/bin/env node

    import express from 'express';`;

    const dependant = getTypeScriptImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(3);
  });

  it('should be able to parse module imports nested in code', () => {
    const content = `(async () => {
      if (somethingIsTrue) {
        await import('express');
      }
    })();`;

    const dependants = getTypeScriptImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(3);
  });

  it('should be able to parse actual TypeScript code', () => {
    const content = `import express from 'express';

    const app: express.Application = express();

    app.lister(3000, () => console.log('hello world'))`;

    const dependants = getTypeScriptImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });
});
