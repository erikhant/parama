import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));
const pkg = (name: string) => path.resolve(root, 'packages', name, 'src');

/**
 * Workspace test runner.
 *
 * Tests resolve the `@parama-dev/*` and `@parama-ui/*` specifiers to package
 * **sources**, not built `dist` output, so a run never depends on build order
 * and always exercises the code being edited.
 *
 * Two projects: `core` runs the pure engine logic in Node, `ui` runs anything
 * that renders React in jsdom.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Longest key first: Vite aliases are prefix matches, resolved in order.
      // Test-only helpers are reachable from other packages' tests but are not
      // part of any package's published entry point.
      '@parama-dev/form-builder-core/testing': path.resolve(pkg('core'), 'testing/storeHarness'),
      '@parama-dev/form-builder-types': pkg('types'),
      '@parama-dev/form-builder-core': pkg('core'),
      '@parama-dev/form-builder-renderer': pkg('renderer'),
      '@parama-dev/form-builder-editor': pkg('editor'),
      '@parama-ui/react': pkg('parama-ui'),
      // `parama-ui` is the only package using the bare `@/` alias internally,
      // and its components are pulled in transitively by renderer/editor tests.
      '@/': `${pkg('parama-ui')}/`
    }
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['packages/core/src/**', 'packages/renderer/src/**', 'packages/editor/src/**'],
      exclude: ['**/*.test.*', '**/*.spec.*', '**/dist/**', '**/debug/**', '**/debug-field.ts']
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'core',
          environment: 'node',
          include: ['packages/core/src/**/*.{test,spec}.ts'],
          setupFiles: [path.resolve(root, 'vitest.setup.ts')]
        }
      },
      {
        extends: true,
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['packages/{renderer,editor,parama-ui}/src/**/*.{test,spec}.{ts,tsx}'],
          setupFiles: [path.resolve(root, 'vitest.setup.ts')]
        }
      }
    ]
  }
});
