import { describe, it, expect, beforeAll } from 'vitest';

import { getTSImportLines, loadTSCompiler } from '@/service/parser/ts';

describe('TypeScript parser test', () => {
  beforeAll(async () => {
    await loadTSCompiler([]);
  });

  it('should be able to parse ES modules import', async () =>{
    const content = `import express from 'express';`;

    const dependant = await getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse all modules import', async () =>{
    const content = `import * as express from 'express';`;

    const dependant = await getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse named imports', async () =>{
    const content = `import { json } from 'express';`;

    const dependant = await getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to aliased imports', async () =>{
    const content = `import { json as jeson } from 'express';`;

    const dependant = await getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse side-effect imports', async () =>{
    const content = `import 'express';`;

    const dependant = await getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse type import', async () =>{
    const content = `import type { Application } from 'express';`;

    const dependant = await getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse dynamic imports', async () =>{
    const content = `const a = import('express');`;

    const dependant = await getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse CommonJS imports', async () =>{
    const content = `const a = require('express');`;

    const dependant = await getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(1);
  });

  it('should be able to parse shebanged files', async () =>{
    const content = `#!/usr/bin/env node

    import express from 'express';`;

    const dependant = await getTSImportLines(content, 'express');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(3);
  });

  it('should be able to parse module imports nested in code', async () =>{
    const content = `(async () =>{
      if (somethingIsTrue) {
        await import('express');
      }
    })();`;

    const dependants = await getTSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(3);
  });

  it('should be able to parse actual TypeScript code', async () =>{
    const content = `import express from 'express';

    const app: express.Application = express();

    app.lister(3000, async () =>console.log('hello world'))`;

    const dependants = await getTSImportLines(content, 'express');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to detect nested modules', async () =>{
    const content = `import { defineConfig } from 'windicss/helpers';

    export default defineConfig({});`;

    const dependants = await getTSImportLines(content, 'windicss');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to distinguish dash separated modules', async () =>{
    const content = `import { defineConfig } from 'windicss-helpers';

    export default defineConfig({});`;

    const dependants = await getTSImportLines(content, 'windicss');
    expect(dependants.length).toBe(0);
  });
});

describe('React TSX test', () =>{
  it('should be able to parse default imports', async () =>{
    const content = `import React from 'react';

    export type HomeProps = {
      foo: string;
      bar: 'foo';
    };

    function Home({ foo }: React.PropsWithoutRef<HomeProps>): JSX.Element {
      return <h1>{foo}</h1>;
    }

    export default Home;`;

    const dependants = await getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse default imports', async () =>{
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

    const dependants = await getTSImportLines(content, 'react');
    expect(dependants.length).toBe(2);
    expect(dependants[0]).toBe(1);
    expect(dependants[1]).toBe(2);
  });

  it('should be able to parse aliased imports', async () =>{
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

    const dependants = await getTSImportLines(content, 'react');
    expect(dependants.length).toBe(2);
    expect(dependants[0]).toBe(1);
    expect(dependants[1]).toBe(2);
  });

  it('should be able to parse namespace imports', async () =>{
    const content = `import * as React from 'react';

    function Home(): JSX.Element {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = await getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse side-effect imports', async () =>{
    const content = `import 'react';

    function Home(): JSX.Element {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = await getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse dynamic imports', async () =>{
    const content = `const a = import('react');

    function Home(): JSX.Element {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = await getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse imports nested in code', async () =>{
    const content = `import * as React from 'react';

    function Home(): JSX.Element {
      const isTest = () =>{
        if (isDevelopment) {
          const a = require('b');
        }
      }

      return <h1>Hello world</h1>;
    }

    export default Home;`;

    const dependants = await getTSImportLines(content, 'b');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(6);
  });

  it('should be able to distinguish false alarms', async () =>{
    const content = `const react = "import * as React from 'react';";

    function Home(): JSX.Element {
      const isTest = async () =>{
        if (isDevelopment) {
          const a = require('b');
        }
      }

      return <h1>Hello world</h1>;
    }

    export default Home;`;

    const dependants = await getTSImportLines(content, 'react');
    expect(dependants.length).toBe(0);
  });

  it('should be able to tolerate CommonJS imports', async () =>{
    const content = `import express from 'express';

    const react = require('react');

    function Home(): JSX.Element {
      return <h1>Hello world</h1>;
    }

    export default Home;`;

    const dependants = await getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(3);
  });

  it('should be able to parse class-based components', async () =>{
    const content = `import * as React from 'react';

    export class Welcome extends React.Component {
      render() {
        return <h1>Hello world</h1>;
      }
    }`;

    const dependants = await getTSImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to detect nested modules', async () =>{
    const content = `import { defineConfig } from 'windicss/helpers';

    export default defineConfig({});`;

    const dependants = await getTSImportLines(content, 'windicss');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });
});
