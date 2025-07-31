import path from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }),
    dts({
      insertTypesEntry: true,
      exclude: ['**/__tests__/**'],
      rollupTypes: true
    })
  ],
  css: {
    postcss: './postcss.config.mjs'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false, // Bundle all CSS into a single file
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'FormBuilderEditor',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@parama-dev/form-builder-core',
        '@parama-dev/form-builder-types',
        '@parama-dev/form-builder-renderer',
        '@parama-ui/react',
        '@dnd-kit/core',
        '@dnd-kit/modifiers',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities',
        '@monaco-editor/react',
        'framer-motion',
        'lodash-es',
        'lucide-react',
        'react-error-boundary',
        'uuid',
        'zustand',
        'sonner'
      ],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'editor.css';
          }
          return '[name].[ext]';
        },
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'React',
          'react/jsx-dev-runtime': 'React',
          '@parama-dev/form-builder-core': 'FormBuilderCore',
          '@parama-dev/form-builder-types': 'FormBuilderTypes',
          '@parama-dev/form-builder-renderer': 'FormBuilderRenderer',
          '@parama-ui/react': 'ParamaUI',
          '@dnd-kit/core': 'DndKitCore',
          '@dnd-kit/modifiers': 'DndKitModifiers',
          '@dnd-kit/sortable': 'DndKitSortable',
          '@dnd-kit/utilities': 'DndKitUtilities',
          '@monaco-editor/react': 'MonacoEditor',
          'framer-motion': 'FramerMotion',
          'lodash-es': 'lodash',
          'lucide-react': 'LucideReact',
          'react-error-boundary': 'ReactErrorBoundary',
          sonner: 'sonner',
          uuid: 'uuid',
          zustand: 'zustand'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5000, // Avoid conflict with demo app (usually 3000)
    open: true
  }
});
