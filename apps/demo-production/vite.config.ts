import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point to the built packages instead of source
      '@form-builder/types': path.resolve(__dirname, '../../packages/types/dist/index.d.ts'),
      '@form-builder/core': path.resolve(__dirname, '../../packages/core/dist/index.es.js'),
      '@form-builder/renderer': path.resolve(__dirname, '../../packages/renderer/dist/index.es.js'),
      '@form-builder/editor': path.resolve(__dirname, '../../packages/editor/dist/index.es.js'),
      '@parama-ui/react': path.resolve(__dirname, '../../packages/parama-ui/dist/index.es.js'),
      '@parama-ui/dist/styles.css': path.resolve(__dirname, '../../packages/parama-ui/dist/parama-ui.min.css')
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
});
