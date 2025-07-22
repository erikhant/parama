import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/__tests__/**'],
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'FormBuilderRenderer',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@form-builder/core',
        '@form-builder/types',
        '@parama-ui/react',
        'lodash-es',
        'lucide-react',
        'react-dropzone',
        'react-select',
        'use-debounce'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@form-builder/core': 'FormBuilderCore',
          '@form-builder/types': 'FormBuilderTypes',
          '@parama-ui/react': 'ParamaUI',
          'lodash-es': 'lodash',
          'lucide-react': 'LucideReact',
          'react-dropzone': 'ReactDropzone',
          'react-select': 'ReactSelect',
          'use-debounce': 'useDebounce'
        }
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
