import { describe, it, expect, beforeAll } from 'vitest';

import { getVueImportLines, loadVueCompiler } from '@/service/parser/vue';
import { loadTSCompiler } from './ts';

describe('Vue parser test', () => {
  beforeAll(async () => {
    await loadTSCompiler([]);
    await loadVueCompiler([]);
  });

  it('should be able to parse ES module import', async () => {
    const content = `<script>
    import Vue from 'vue';

    export default {
      setup() {
        const name = Vue.ref('John Doe');

        return {
          name,
        };
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse named imports', async () => {
    const content = `<script>
    import { ref } from 'vue';

    export default {
      setup() {
        const name = ref('John Doe');

        return {
          name,
        };
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse all module import', async () => {
    const content = `<script>
    import * as Vue from 'vue';

    export default {
      setup() {
        const name = Vue.ref('John Doe');

        return {
          name,
        };
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse aliased imports', async () => {
    const content = `<script>
    import { ref as foo } from 'vue';

    export default {
      setup() {
        const name = foo('John Doe');

        return {
          name,
        };
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse side-effect imports', async () => {
    const content = `<script>
    import { ref } from 'vue';
    import 'foo/dist/bar.css';

    export default {
      setup() {
        const name = ref('John Doe');

        return {
          name,
        };
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'foo');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(3);
  });

  it('should be able to parse dynamic imports', async () => {
    const content = `<script>
    import { ref } from 'vue';

    async function foo() {
      const bar = await import('baz');
    }

    export default {
      setup() {
        const name = ref('John Doe');

        return {
          name,
        };
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'baz');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(5);
  });

  it('should be able to distinguish false alarms', async () => {
    const content = `<script>
    import { ref } from 'vue';
    const foo = 'import bar from "baz";';

    export default {
      setup() {
        const name = ref('John Doe');

        return {
          name,
        };
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'baz');

    expect(result.length).toBe(0);
  });

  it('should be able to tolerate CommonJS import', async () => {
    const content = `<script>
    const vue = require('vue');

    export default {
      setup() {
        const name = vue.ref('John Doe');

        return {
          name,
        };
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse TypeScript based script', async () => {
    const content = `<script lang="ts">
    import { ref, Ref } from 'vue';

    export default {
      setup() {
        const name: Ref<string> = ref('John Doe');

        return {
          name,
        };
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse TypeScript type imports', async () => {
    const content = `<script lang="ts">
    import { ref } from 'vue';
    import type { Ref } from 'vue';

    export default {
      setup() {
        const name: Ref<string> = ref('John Doe');

        return {
          name,
        };
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'vue');

    expect(result.length).toBe(2);
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(3);
  });

  it('should be able to parse `script setup`', async () => {
    const content = `<script setup>
    import _ from 'lodash';

    const name = ref(_.capitalize('john doe'));
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'lodash');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse Options API', async () => {
    const content = `<script>
    import _ from 'lodash';

    export default {
      data() {
        return {
          name: 'john doe',
        };
      },
      computed: {
        formattedName: async () => {
          return _.capitalize(this.name);
        },
      },
      mounted() {
        this.doIt();
      },
    };
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = await getVueImportLines(content, 'lodash');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse class components', async () => {
    // Straightly copy pasted from class component example
    const content = `<template>
      <div>
        <button v-on:click="decrement">-</button>
        {{ count }}
        <button v-on:click="increment">+</button>
      </div>
    </template>

    <script>
    import Vue from 'vue';
    import Component from 'vue-class-component';

    export default class Counter extends Vue {
      // Class properties will be component data
      count = 0

      // Methods will be component methods
      increment() {
        this.count++
      }

      decrement() {
        this.count--
      }
    }
    </script>`;

    const result = await getVueImportLines(content, 'vue-class-component');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(11);
  });
});
