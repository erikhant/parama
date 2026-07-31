import { isThemeMode, THEME_STORAGE_KEY, type ThemeMode } from './theme';

/**
 * Persistence for the user's theme choice.
 *
 * Every access is guarded. `localStorage` is not merely absent during SSR — it
 * also throws on read in some embedded webviews and on write in Safari's
 * private mode. Losing persistence is acceptable; taking the host application
 * down with an uncaught `SecurityError` is not.
 */

/** Reads the persisted mode, or `null` if there is no usable value. */
export function readThemeMode(): ThemeMode | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Persists the mode, silently doing nothing when storage is unavailable. */
export function writeThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage is full or blocked; the in-memory value still drives this session.
  }
}
