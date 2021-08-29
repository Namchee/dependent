import { getJSImportLines } from '../../src/parser/js';

jest.useFakeTimers();

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

  it('should be able to detect nested modules', () => {
    const content = `import { defineConfig } from 'windicss/helpers';

    export default defineConfig({});`;

    const dependants = getJSImportLines(content, 'windicss');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });
});

describe('React JSX test', () => {
  it('should be able to parse default imports', () => {
    const content = `import react from 'react';

    function Home() {
      return <h1>Hello World</h1>;
    }

    export default Home;`

    const dependants = getJSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse default imports', () => {
    const content = `import { useState } from 'react';

    function Home() {
      const [ping, setPing] = useState(0);
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = getJSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse aliased imports', () => {
    const content = `import { useState as a } from 'react';

    function Home() {
      const [ping, setPing] = a(0);
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = getJSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse namespace imports', () => {
    const content = `import * as React from 'react';

    function Home() {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = getJSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse unnamed imports', () => {
    const content = `import 'react';

    function Home() {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = getJSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse dynamic imports', () => {
    const content = `const a = import('react');

    function Home() {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = getJSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse imports nested in code', () => {
    const content = `import * as React from 'react';

    function Home() {
      const isTest = () => {
        if (isDevelopment) {
          const a = require('b');
        }
      }

      return <h1>Hello world</h1>;
    }

    export default Home;`;

    const dependants = getJSImportLines(content, 'b');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(6);
  });

  it('should be able to distinguish false alarms', () => {
    const content = `const react = "import * as React from 'react';";

    function Home() {
      const isTest = () => {
        if (isDevelopment) {
          const a = require('b');
        }
      }

      return <h1>Hello world</h1>;
    }

    export default Home;`;

    const dependants = getJSImportLines(content, 'react');
    expect(dependants.length).toBe(0);
  });

  it('should be able to tolerate CommonJS imports', () => {
    const content = `import express from 'express';

    const react = require('react');

    function Home() {
      return <h1>Hello world</h1>;
    }

    export default Home;`;

    const dependants = getJSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(3);
  });

  it('should be able to parse class-based components', () => {
    const content = `import * as React from 'react';

    export class Welcome extends React.Component {
      render() {
        return <h1>Hello world</h1>;
      }
    }`;

    const dependants = getJSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to detect nested modules', () => {
    const content = `import { defineConfig } from 'windicss/helpers';

    export default defineConfig({});`;

    const dependants = getJSImportLines(content, 'windicss');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });
});
