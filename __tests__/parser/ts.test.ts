import { jest } from '@jest/globals';

jest.useFakeTimers();

import { getTSImportLines } from '../../src/parser/ts';

describe('TypeScript parser test', () => {
  it('should be able to parse ES modules import', () => {
    const content = `import express from 'express';`;

    const dependant = getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse all modules import', () => {
    const content = `import * as express from 'express';`;

    const dependant = getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse named imports', () => {
    const content = `import { json } from 'express';`;

    const dependant = getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to aliased imports', () => {
    const content = `import { json as jeson } from 'express';`;

    const dependant = getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse nameless imports', () => {
    const content = `import 'express';`;

    const dependant = getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse type import', () => {
    const content = `import type { Application } from 'express';`;

    const dependant = getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse dynamic imports', () => {
    const content = `const a = import('express');`;

    const dependant = getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse CommonJS imports', () => {
    const content = `const a = require('express');`;

    const dependant = getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse shebanged files', () => {
    const content = `#!/usr/bin/env node

    import express from 'express';`;

    const dependant = getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(3);
  });

  it('should be able to parse module imports nested in code', () => {
    const content = `(async () => {
      if (somethingIsTrue) {
        await import('express');
      }
    })();`;

    const dependants = getTSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(3);
  });

  it('should be able to parse actual TypeScript code', () => {
    const content = `import express from 'express';

    const app: express.Application = express();

    app.lister(3000, () => console.log('hello world'))`;

    const dependants = getTSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to detect nested modules', () => {
    const content = `import { defineConfig } from 'windicss/helpers';

    export default defineConfig({});`;

    const dependants = getTSImportLines(content, 'windicss');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });
});

describe('React TSX test', () => {
  it('should be able to parse default imports', () => {
    const content = `import React from 'react';

    export type HomeProps = {
      foo: string;
      bar: 'foo';
    };

    function Home({ foo }: React.PropsWithoutRef<HomeProps>): JSX.Element {
      return <h1>{foo}</h1>;
    }

    export default Home;`;

    const dependants = getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse default imports', () => {
    const content = `import * as React from 'react';
    import { useState } from 'react';

    export type HomeProps = {
      foo: string;
      bar: 'foo';
    };

    function Home({ foo }: React.PropsWithoutRef<HomeProps>): JSX.Element {
      const [baz, setBaz] = useState(foo);
      return <h1>{foo}</h1>;
    }

    export default Home;`;

    const dependants = getTSImportLines(content, 'react');
    expect(dependants.length).toBe(2);
    expect(dependants[0]).toBe(1);
    expect(dependants[1]).toBe(2);
  });

  it('should be able to parse aliased imports', () => {
    const content = `import * as React from 'react';
    import { useState as a } from 'react';

    export type HomeProps = {
      foo: string;
      bar: 'foo';
    };

    function Home({ foo }: React.PropsWithoutRef<HomeProps>): JSX.Element {
      const [baz, setBaz] = a(foo);
      return <h1>{foo}</h1>;
    }

    export default Home;`

    const dependants = getTSImportLines(content, 'react');
    expect(dependants.length).toBe(2);
    expect(dependants[0]).toBe(1);
    expect(dependants[1]).toBe(2);
  });

  it('should be able to parse namespace imports', () => {
    const content = `import * as React from 'react';

    function Home(): JSX.Element {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse unnamed imports', () => {
    const content = `import 'react';

    function Home(): JSX.Element {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse dynamic imports', () => {
    const content = `const a = import('react');

    function Home(): JSX.Element {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse imports nested in code', () => {
    const content = `import * as React from 'react';

    function Home(): JSX.Element {
      const isTest = () => {
        if (isDevelopment) {
          const a = require('b');
        }
      }

      return <h1>Hello world</h1>;
    }

    export default Home;`;

    const dependants = getTSImportLines(content, 'b');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(6);
  });

  it('should be able to distinguish false alarms', () => {
    const content = `const react = "import * as React from 'react';";

    function Home(): JSX.Element {
      const isTest = () => {
        if (isDevelopment) {
          const a = require('b');
        }
      }

      return <h1>Hello world</h1>;
    }

    export default Home;`;

    const dependants = getTSImportLines(content, 'react');
    expect(dependants.length).toBe(0);
  });

  it('should be able to tolerate CommonJS imports', () => {
    const content = `import express from 'express';

    const react = require('react');

    function Home(): JSX.Element {
      return <h1>Hello world</h1>;
    }

    export default Home;`;

    const dependants = getTSImportLines(content, 'react');
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

    const dependants = getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to detect nested modules', () => {
    const content = `import { defineConfig } from 'windicss/helpers';

    export default defineConfig({});`;

    const dependants = getTSImportLines(content, 'windicss');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });
});
