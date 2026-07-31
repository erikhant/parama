import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './ThemeContext';
import { DEFAULT_THEME_MODE } from './theme';

/**
 * Read-only fallback used when no provider is mounted.
 *
 * `useTheme` deliberately does not throw: the UI components call it, and a
 * consumer rendering a lone `<Button>` without a `ThemeProvider` should get a
 * light button, not a crash.
 */
const UNTHEMED: ThemeContextValue = {
  mode: DEFAULT_THEME_MODE,
  resolvedTheme: 'light',
  setMode: () => {},
  portalContainer: null
};

/** Reads the current theme. Safe to call outside a provider. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) ?? UNTHEMED;
}

/**
 * The element Radix portals should render into.
 *
 * Returns `null` outside a provider, which Radix treats as "use the body".
 */
export function usePortalContainer(): HTMLElement | null {
  return useTheme().portalContainer;
}
