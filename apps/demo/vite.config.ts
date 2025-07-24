import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@parama-dev/form-builder-*': path.resolve(__dirname, '../../packages'),
      '@parama-ui/react/styles': path.resolve(__dirname, '../../packages/parama-ui/dist/parama-ui.min.css')
    }
  },
  css: {
    postcss: './postcss.config.js' // Explicit path
  }
});
