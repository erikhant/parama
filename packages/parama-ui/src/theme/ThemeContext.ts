import { createContext } from 'react';
import type { ResolvedTheme, ThemeMode } from './theme';

export interface ThemeContextValue {
  /** What was asked for, including the unresolved `system`. */
  mode: ThemeMode;
  /** What is actually painted. */
  resolvedTheme: ResolvedTheme;
  /** Changes the mode and persists it. */
  setMode: (mode: ThemeMode) => void;
  /**
   * Themed element on `document.body` that Radix portals render into.
   *
   * `null` until the provider has mounted it, and when no provider is present.
   * Passing `null` to a Radix `Portal` container falls back to `document.body`,
   * which is the correct unthemed default.
   */
  portalContainer: HTMLElement | null;
}

/**
 * `null` marks the absence of a provider, which lets a nested provider detect
 * an outer one and defer to it.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null);
