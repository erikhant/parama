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
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@form-builder/core',
        '@form-builder/types'
      ],
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
    alias: [
      // {
      //   find: 'react',
      //   replacement: path.resolve(__dirname, 'react/package.json')
      // },
      // {
      //   find: 'react-dom',
      //   replacement: path.resolve(__dirname, 'react-dom/package.json')
      // },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      {
        find: '@form-builder/core',
        replacement: path.resolve(__dirname, '../core/dist') // Point to DIST
      },
      {
        find: '@form-builder/types',
        replacement: path.resolve(__dirname, '../types/dist') // Point to DIST
      }
    ]
    // alias: {
    //   '@': path.resolve(__dirname, 'src'),
    //   // Add these to ensure workspace dependencies resolve correctly
    //   '@form-builder/core': path.resolve(__dirname, '../core/src'),
    //   '@form-builder/types': path.resolve(__dirname, '../types/src')
    // }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
