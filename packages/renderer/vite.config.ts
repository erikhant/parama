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
      external: ['react', 'react-dom', '@form-builder/core', '@form-builder/types'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@form-builder/core': 'FormBuilderCore',
          '@form-builder/types': 'FormBuilderTypes'
        }
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Link to other workspace packages
      '@form-builder/core': path.resolve(__dirname, '../core/src'),
      '@form-builder/types': path.resolve(__dirname, '../types/src'),
      '@form-builder/renderer': path.resolve(__dirname, '../renderer/src'),
      '@parama-ui/react': path.resolve(__dirname, '../parama-ui/dist/index.es.js'),
      '@parama-ui/react/parama-ui.min.css': path.resolve(
        __dirname,
        '../parama-ui/dist/parama-ui.min.css'
      )
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
