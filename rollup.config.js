import typescript from 'rollup-plugin-typescript2';
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
    // will drop this later
    { file: 'bin/index.js', format: 'es' },
  ],
}
