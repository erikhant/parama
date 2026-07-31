/**
 * What the host asks for. `system` defers to the OS preference and keeps
 * following it, so a form left open overnight tracks a scheduled switch.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/** What actually gets painted, once `system` has been resolved. */
export type ResolvedTheme = 'light' | 'dark';

/** localStorage key the theme choice is persisted under. */
export const THEME_STORAGE_KEY = 'theme';

/** The mode used when the host supplies none. */
export const DEFAULT_THEME_MODE: ThemeMode = 'system';

/** The order the toolbar toggle cycles through. */
export const THEME_MODE_CYCLE: ThemeMode[] = ['light', 'dark', 'system'];

const THEME_MODES: ReadonlySet<string> = new Set(THEME_MODE_CYCLE);

/**
 * Narrows an unknown value to a {@link ThemeMode}.
 *
 * `theme` is a generic localStorage key that a neighbouring application may
 * also own, so stored values are validated rather than trusted.
 */
export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && THEME_MODES.has(value);
}

/**
 * Resolves the requested mode against the current system preference.
 *
 * @param mode - What the host or the user asked for
 * @param systemPrefersDark - Current value of `(prefers-color-scheme: dark)`
 */
export function resolveTheme(mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme {
  if (mode === 'system') return systemPrefersDark ? 'dark' : 'light';
  return mode;
}

/** The next mode in the toggle's cycle, wrapping at the end. */
export function nextThemeMode(mode: ThemeMode): ThemeMode {
  const index = THEME_MODE_CYCLE.indexOf(mode);
  return THEME_MODE_CYCLE[(index + 1) % THEME_MODE_CYCLE.length];
}
