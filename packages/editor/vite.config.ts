import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      // Add this to share React instance
      // 'react': path.resolve(__dirname, 'react/package.json'),
      // 'react-dom': path.resolve(__dirname, 'react-dom/package.json'),
      '@': path.resolve(__dirname, 'src'),
      // Link to other workspace packages
      '@form-builder/core': path.resolve(__dirname, '../core/src'),
      '@form-builder/types': path.resolve(__dirname, '../types/src'),
      '@form-builder/renderer': path.resolve(__dirname, '../renderer/src')
    }
  },
  build: {
    // Library mode not needed - editor is dev-only
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Dev only
      // external: ['react', 'react-dom'],
      // Production mode
      input: path.resolve(__dirname, 'index.html')
    }
  },
  server: {
    port: 3000, // Avoid conflict with demo app (usually 3000)
    open: true
  }
});
