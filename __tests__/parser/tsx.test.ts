import { getTSImportLines as getTSXImportLines } from './../../src/parser/ts';

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

    const dependants = getTSXImportLines(content, 'react');
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

    const dependants = getTSXImportLines(content, 'react');
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

    const dependants = getTSXImportLines(content, 'react');
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

    const dependants = getTSXImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse unnamed imports', () => {
    const content = `import 'react';

    function Home(): JSX.Element {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = getTSXImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to parse dynamic imports', () => {
    const content = `const a = import('react');

    function Home(): JSX.Element {
      return <h1>{ping}</h1>;
    }

    export default Home;`

    const dependants = getTSXImportLines(content, 'react');
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

    const dependants = getTSXImportLines(content, 'b');
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

    const dependants = getTSXImportLines(content, 'react');
    expect(dependants.length).toBe(0);
  });

  it('should be able to tolerate CommonJS imports', () => {
    const content = `import express from 'express';

    const react = require('react');

    function Home(): JSX.Element {
      return <h1>Hello world</h1>;
    }

    export default Home;`;

    const dependants = getTSXImportLines(content, 'react');
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

    const dependants = getTSXImportLines(content, 'react');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });

  it('should be able to detect nested modules', () => {
    const content = `import { defineConfig } from 'windicss/helpers';

    export default defineConfig({});`;

    const dependants = getTSXImportLines(content, 'windicss');
    expect(dependants.length).toBe(1);
    expect(dependants[0]).toBe(1);
  });
})
