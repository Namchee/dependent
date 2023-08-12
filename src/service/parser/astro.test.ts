import { describe, it, expect, beforeAll } from 'vitest';

import { getAstroImportLines, loadAstroCompiler } from '@/service/parser/astro';

describe('Astro parser test', () => {
  beforeAll(async () => {
    await loadAstroCompiler();
  });

  it('should be able to parse empty file', async () =>{
    const content = ``;

    const dependant = await getAstroImportLines(content, 'astro-iconify');

    expect(dependant.length).toBe(0);
  });

  it('should be able to parse ES modules import', async () =>{
    const content = `---
    import Icon from 'astro-iconify';
    ---

    <p>Hello World!</p>

    <Icon name="heroicons:arrow-right" />
    `;

    const dependant = await getAstroImportLines(content, 'astro-iconify');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });

  it('should be able to parse all modules import', async () =>{
    const content = `---
    import * as iconify from 'astro-iconify';
    ---

    <p>Hello World!</p>

    <iconify.Icon name="heroicons:arrow-right" />
    `;

    const dependant = await getAstroImportLines(content, 'astro-iconify');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });

  it('should be able to parse named imports', async () =>{
    const content = `---
    import { Icon } from 'astro-iconify';
    ---

    <p>Hello World!</p>

    <Icon name="heroicons:arrow-right" />
    `;

    const dependant = await getAstroImportLines(content, 'astro-iconify');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });

  it('should be able to parse aliased imports', async () =>{
    const content = `---
    import { Icon as icon } from 'astro-iconify';
    ---

    <p>Hello World!</p>

    <icon name="heroicons:arrow-right" />
    `;

    const dependant = await getAstroImportLines(content, 'astro-iconify');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });

  it('should be able to parse default aliased imports', async () =>{
    const content = `---
    import { default as Icon } from 'astro-iconify';
    ---

    <p>Hello World!</p>

    <Icon name="heroicons:arrow-right" />
    `;

    const dependant = await getAstroImportLines(content, 'astro-iconify');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });

  it('should be able to parse multiple named imports', async () =>{
    const content = `---
    import { foo, bar } from 'something/like/this';
    ---

    <p>Hello World!</p>
    `;

    const dependant = await getAstroImportLines(content, 'something');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });

  it('should be able to parse combined default and named imports', async () =>{
    const content = `---
    import Something, { foo, bar } from 'something/like/this';
    ---

    <p>Hello World!</p>
    `;

    const dependant = await getAstroImportLines(content, 'something');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });

  it('should be able to parse combined default and named imports in separated imports', async () =>{
    const content = `---
    import { foo, bar } from 'something/like/this';
    import Something from 'something';
    ---

    <p>Hello World!</p>

    <Something />
    `;

    const dependant = await getAstroImportLines(content, 'something');

    expect(dependant.length).toBe(2);
    expect(dependant).toStrictEqual([2, 3]);
  });

  it('should be able to parse side-effect imports', async () =>{
    const content = `---
    import 'astro';
    ---

    <p>test</p>
    `;

    const dependant = await getAstroImportLines(content, 'astro');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });

  it('should be able to parse type import', async () =>{
    const content = `---
    import type { HTMLDivAttributes } from 'astro/types';
    ---

    <p>test</p>
    `;

    const dependant = await getAstroImportLines(content, 'astro');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });

  it('should be able to parse dynamic imports', async () =>{
    const content = `---
    const a = import('astro');
    ---

    <p>test</p>
    `;

    const dependant = await getAstroImportLines(content, 'astro');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });

  it('should be able to parse CommonJS imports', async () =>{
    const content = `---
    const a = require('astro');
    ---

    <p>test</p>
    `;

    const dependant = await getAstroImportLines(content, 'astro');

    expect(dependant.length).toBe(1);
    expect(dependant[0]).toBe(2);
  });
});
