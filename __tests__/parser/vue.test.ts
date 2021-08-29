import { jest } from '@jest/globals';

import { getVueImportLines } from '../../src/parser/vue';

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllTimers();
});

describe('Vue parser test', () => {
  it('should be able to parse ES module import', () => {
    const content = `
    <script>
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

    const result = getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse named imports', () => {
    const content = `
    <script>
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

    const result = getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse all module import', () => {
    const content = `
    <script>
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

    const result = getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse aliased imports', () => {
    const content = `
    <script>
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

    const result = getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse side-effect imports', () => {
    const content = `
    <script>
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

    const result = getVueImportLines(content, 'foo');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(3);
  });

  it('should be able to parse dynamic imports', () => {
    const content = `
    <script>
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

    const result = getVueImportLines(content, 'baz');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(5);
  });

  it('should be able to distinguish false alarms', () => {
    const content = `
    <script>
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

    const result = getVueImportLines(content, 'baz');

    expect(result.length).toBe(0);
  });

  it('should be able to tolerate CommonJS import', () => {
    const content = `
    <script>
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

    const result = getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse TypeScript based script', () => {
    const content = `
    <script lang="ts">
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

    const result = getVueImportLines(content, 'vue');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });

  it('should be able to parse TypeScript type imports', () => {
    const content = `
    <script lang="ts">
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

    const result = getVueImportLines(content, 'vue');

    expect(result.length).toBe(2);
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(3);
  });

  it('should be able to parse `script setup`', () => {
    const content = `
    <script setup>
    import _ from 'lodash';

    const name = ref(_.capitalize('john doe'));
    </script>

    <template>
      Hello, {{ name }}
    </template>`;

    const result = getVueImportLines(content, 'lodash');

    expect(result.length).toBe(1);
    expect(result[0]).toBe(2);
  });
});
