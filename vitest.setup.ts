import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';

// The form builder store is a module singleton, so state leaks between tests
// unless each one starts from a clean slate. Suites that touch the store call
// `resetFormBuilder()` from `packages/core/src/testing/storeHarness.ts`.
beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});
