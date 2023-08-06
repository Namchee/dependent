import { describe, it, expect } from 'vitest';

import { getSvelteImportLines } from '@/service/parser/svelte';

describe('Svelte parser test', () => {
  it('should be able to parse ES module import', async () => {
    const content = `<script>
      import _ from 'lodash';

      let name = 'john doe';

      $: formatted = _.capitalize(name);
    </script>

    <input bind:value={name} />

    <h1>Hello, {formatted}!</h1>`;

    const result = await getSvelteImportLines(content, 'lodash', []);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse named imports', async () => {
    const content = `<script>
    import { capitalize } from 'lodash';

    let name = 'john doe';

    $: formatted = capitalize(name);
    </script>

    <input bind:value={name} />

    <h1>Hello, {formatted}!</h1>`;

    const result = await getSvelteImportLines(content, 'lodash', []);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse all module import', async () => {
    const content = `<script>
    import * as _ from 'lodash';

    let name = 'john doe';

    $: formatted = _.capitalize(name);
    </script>

    <input bind:value={name} />

    <h1>Hello, {formatted}!</h1>`;

    const result = await getSvelteImportLines(content, 'lodash', []);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse aliased imports', async () => {
    const content = `<script>
    import { capitalize as cap } from 'lodash';

    let name = 'john doe';

    $: formatted = cap(name);
    </script>

    <input bind:value={name} />

    <h1>Hello, {formatted}!</h1>`;

    const result = await getSvelteImportLines(content, 'lodash', []);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse side-effect imports', async () => {
    const content = `<script>
    import _ from 'lodash';
    import 'foo/bar/baz.css'

    let name = 'john doe';

    $: formatted = _.capitalize(name);
    </script>

    <input bind:value={name} />

    <h1>Hello, {formatted}!</h1>`;

    const result = await getSvelteImportLines(content, 'foo', []);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(3);
  });

  it('should be able to parse dynamic imports', async () => {
    const content = `<script>
    import _ from 'lodash';

    async function fakeLoader() {
      await import('foo');
    }

    let name = 'john doe';

    $: formatted = _.capitalize(name);
    </script>

    <input bind:value={name} />

    <h1>Hello, {formatted}!</h1>`;

    const result = await getSvelteImportLines(content, 'foo', []);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(5);
  });

  it('should be able to distinguish false alarms', async () => {
    const content = `<script>
    import _ from 'lodash';
    const foo = "import bar from 'baz';";

    let name = 'john doe';

    $: formatted = _.capitalize(name);
    </script>

    <input bind:value={name} />

    <h1>Hello, {formatted}!</h1>`;

    const result = await getSvelteImportLines(content, 'baz', []);

    expect(result.length).toBe(0);
  });

  it('should be able to tolerate CommonJS import', async () => {
    const content = `<script>
    import _ from 'lodash';
    const foo = require('bar');

    let name = 'john doe';

    $: formatted = _.capitalize(name);
    </script>

    <input bind:value={name} />

    <h1>Hello, {formatted}!</h1>`;

    const result = await getSvelteImportLines(content, 'bar', []);

    expect(result.length).toBe(1);
    expect(result[0]).toBe(3);
  });
});
