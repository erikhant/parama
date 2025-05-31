import dts from 'rollup-plugin-dts';

export default {
  input: './src/index.ts',
  output: {
    file: './dist/index.d.ts',
    format: 'es'
  },
  plugins: [dts()]
};
// This Rollup configuration is used to bundle TypeScript declaration files (.d.ts).
// It specifies the input file and the output format as ES modules.
