import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      exclude: ['**/__tests__/**'],
      rollupTypes: true
    })
  ],
  build: {
    outDir: 'dist',
    minify: true,
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'FormBuilderCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'zustand',
        '@parama-dev/form-builder-types',
        'ajv',
        'lodash',
        'lodash-es',
        'uuid',
        'validator'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          zustand: 'Zustand',
          '@parama-dev/form-builder-types': 'FormBuilderTypes'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
