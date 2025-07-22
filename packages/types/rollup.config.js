import dts from 'rollup-plugin-dts';

export default [
  // Generate only TypeScript declaration files (types-only package)
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];
