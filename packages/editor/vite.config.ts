import path from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/__tests__/**'],
      rollupTypes: true
    })
  ],
  build: {
    // Library mode not needed - editor is dev-only
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Dev only
      external: [
        'react',
        'react-dom',
        '@form-builder/core',
        '@form-builder/types',
        '@form-builder/renderer'
      ],
      // Production mode
      input: path.resolve(__dirname, 'index.html')
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Link to other workspace packages
      '@form-builder/core': path.resolve(__dirname, '../core/dist/index.es.js'),
      '@form-builder/types': path.resolve(__dirname, '../types/dist'),
      '@form-builder/renderer': path.resolve(
        __dirname,
        '../renderer/dist/index.es.js'
      ),
      '@parama-ui/react': path.resolve(
        __dirname,
        '../parama-ui/dist/index.es.js'
      )
    }
  },
  server: {
    port: 3000, // Avoid conflict with demo app (usually 3000)
    open: true
  }
});
