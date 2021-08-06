import { getCJSImportLines } from './../../src/parser/cjs';

describe('CommonJS import test', () => {
  it('should be able to distinguish CommonJS imports', () => {
    const content = `const express = require('express');

    const app = express()`;

    const dependants = getCJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to distinguish imports nested in code', () => {
    const content = `function test() {
      let a;
      if (process.env.NODE_ENV === 'development') {
        const b = require('express');
        a = b.json();
      } else {
        a = () => {};
      }

      return a;
    }`;

    const dependants = getCJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(4);
  });

  it('should be able to distinguish actually dependant files', () => {
    const content = `function test() {
      let a;
      if (process.env.NODE_ENV === 'development') {
        const b = require('express');
        a = b.json();
      } else {
        a = () => {};
      }

      return a;
    }`;

    const dependants = getCJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(4);
  });

  it('should be able to distinguish false alarms', () => {
    const content = `function test() {
      let a;
      if (process.env.NODE_ENV === 'development') {
        const b = "require('express')";
        a = b.json();
      } else {
        a = () => {};
      }

      return a;
    }`;

    const dependants = getCJSImportLines(content, 'express');
    expect(dependants.length).toBe(0);
  });

  it('should be able to parse shebanged files', () => {
    const content = `#!/usr/bin/env node

    const express = require('express');

    const app = express();`;

    const dependants = getCJSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(3);
  });
});
