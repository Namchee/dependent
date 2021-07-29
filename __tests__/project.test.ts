import { getDependantFiles } from '../src/import';
import { ProjectFile } from './../src/types';

describe('Parser tolerance test', () => {
  it('should throw an error when silent is false', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'src/a.js',
        content: 'const a =',
      },
    ];

    expect(() => getDependantFiles(files, 'express', {
      module: true,
      silent: false,
    })).toThrowError('Failed to parse src/a.js');
  });

  it('should not throw an error when silent is true', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'src/a.js',
        content: 'const a =',
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: true,
      silent: true,
    });

    expect(dependants.length).toBe(0);
  });
});

describe('CommonJS import test', () => {
  it('should be able to distinguish CommonJS imports', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'const express = require(\'express\'); const app = express();',
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: false,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish imports nested in code', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: `function test() {
          let a;
          if (process.env.NODE_ENV === 'development') {
            const b = require('express');
            a = b.json();
          } else {
            a = () => {};
          }

          return a;
        }`,
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: false,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish actually dependant files', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: `function test() {
          let a;
          if (process.env.NODE_ENV === 'development') {
            const b = require('express');
            a = b.json();
          } else {
            a = () => {};
          }

          return a;
        }`,
      },
      {
        name: 'c.js',
        path: 'b/c.js',
        content: `exports.a = 'b'`,
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: false,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish false alarms', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: `function test() {
          let a;
          if (process.env.NODE_ENV === 'development') {
            const b = require('express');
            a = b.json();
          } else {
            a = () => {};
          }

          return a;
        }`,
      },
      {
        name: 'c.js',
        path: 'b/c.js',
        content: `const a = "require('express')";`,
      },
      {
        name: 'd.js',
        path: 'b/d.js',
        content: `const a = require('babel');`,
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: false,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to parse .mjs correctly', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: `function test() {
          let a;
          if (process.env.NODE_ENV === 'development') {
            const b = require('express');
            a = b.json();
          } else {
            a = () => {};
          }

          return a;
        }`,
      },
      {
        name: 'c.mjs',
        path: 'b/c.mjs',
        content: `import express from 'express';`,
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: false,
      silent: false,
    });
    expect(dependants.length).toBe(2);
    expect(dependants[0].name).toBe('a.js');
    expect(dependants[1].name).toBe('c.mjs');
  });

  it('should be able to parse shebanged files', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: `#!/usr/bin/env node

        const express = require('express');

        const app = express();`,
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: false,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });
});

describe('ESModule import test', () => {
  it('should be able to distinguish default imports', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'import express from \'express\'; const app = express();',
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: true,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish named imports', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'import { json } from \'express\'; app.use(json())',
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: true,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish unnamed imports', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'import \'express\';',
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: true,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish all-module import', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'import * as express from \'express\';',
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: true,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish dynamic imports', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: 'const a = import(\'express\');',
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: true,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to distinguish module imports nested in code', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: `(async () => {
          if (somethingIsTrue) {
            await import('express');
          }
        })();`,
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: true,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
    expect(dependants[0].lineNumbers[0]).toBe(3);
  });

  it('should be able to distinguish false alarms', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: `import express from 'express';
        function test() {
          let a;
          if (process.env.NODE_ENV === 'development') {
            a = express.json();
          } else {
            a = () => {};
          }

          return a;
        }`,
      },
      {
        name: 'c.js',
        path: 'b/c.js',
        content: `const a = "import express from 'express'";`,
      },
      {
        name: 'd.js',
        path: 'b/d.js',
        content: `import babel from 'babel'`,
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: true,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to parse shebanged files', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: `#!/usr/bin/env node

        import express from 'express';

        const app = express();`,
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: true,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });

  it('should be able to tolerate CommonJS imports', () => {
    const files: ProjectFile[] = [
      {
        name: 'a.js',
        path: 'b/a.js',
        content: `const express = require('express');

        const app = express();`,
      },
    ];

    const dependants = getDependantFiles(files, 'express', {
      module: true,
      silent: false,
    });
    expect(dependants.length).toBe(1);
    expect(dependants[0].name).toBe('a.js');
  });
});
