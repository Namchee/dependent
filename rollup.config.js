import typescript from '@rollup/plugin-typescript';
import shebang from 'rollup-plugin-preserve-shebang';

import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/index.ts',
  plugins: [
    shebang(),
    typescript(),
    terser({ format: { comments: false } }),
  ],
  output: [
    { file: 'bin/index.js', format: 'es' },
  ],
  external: [
    'fs',
    'path',
    'child_process',
    'url',
    'ora',
    'chalk',
    'glob',
    'yargs',
    'acorn',
    'acorn-walk',
    'acorn-jsx',
  ]
}
