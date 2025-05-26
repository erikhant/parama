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
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    minify: true,
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ParamaUI',
      fileName: () => 'parama-ui',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // Dev only
      external: ['react', 'react-dom'],
      // Production mode
      //input: path.resolve(__dirname, 'index.html'),
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'parama-ui.min.css';
          }
          return assetInfo.name!;
        }
      }
    }
  },
  server: {
    port: 8000,
    open: true
  }
});
