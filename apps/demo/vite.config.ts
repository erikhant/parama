import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@form-builder': path.resolve(__dirname, '../../packages')
    }
  },
  css: {
    postcss: './postcss.config.js' // Explicit path
  }
});
