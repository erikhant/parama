import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ThemeContext, type ThemeContextValue } from './ThemeContext';
import { DEFAULT_THEME_MODE, isThemeMode, resolveTheme, THEME_STORAGE_KEY, type ThemeMode } from './theme';
import { readThemeMode, writeThemeMode } from './themeStorage';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Marks the provider's portal host so it can be found and cleaned up. */
const PORTAL_ATTRIBUTE = 'data-parama-portal';

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Initial mode. Ignored if the user has already chosen one. Defaults to `system`. */
  theme?: ThemeMode;
  /** Called when the mode changes, but not for the initial value. */
  onThemeChange?: (mode: ThemeMode) => void;
  /** Extra classes for the provider's own wrapper element. */
  className?: string;
}

/** Reads `(prefers-color-scheme: dark)`, tolerating environments without matchMedia. */
function readSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(DARK_QUERY).matches;
}

/**
 * Resolves the mode to start in.
 *
 * A previously persisted choice outranks the `theme` prop: the prop is the
 * host's default for a first-time visitor, whereas storage records what this
 * particular user actually picked.
 */
function initialMode(theme: ThemeMode | undefined): ThemeMode {
  return readThemeMode() ?? theme ?? DEFAULT_THEME_MODE;
}

/**
 * Supplies the theme to everything beneath it.
 *
 * Deliberately scoped: the theme class goes on this provider's own wrapper, not
 * on `<html>`. The form builder is embedded inside host applications, and a
 * library that writes to the document element fights whatever theme system the
 * host already has.
 *
 * That scoping creates one problem, which the portal host solves. Radix renders
 * dialogs, dropdowns, selects and tooltips through a portal attached to
 * `document.body` — outside this subtree, and so outside the theme. The
 * provider therefore also maintains a themed element on the body and publishes
 * it through context for those components to portal into.
 *
 * Nesting is a no-op: a provider that finds an outer one renders its children
 * unchanged. The editor previews the renderer, which mounts its own provider
 * when standalone, and the two must not both claim the theme.
 */
export function ThemeProvider({ children, theme, onThemeChange, className }: ThemeProviderProps) {
  const outerTheme = useContext(ThemeContext);

  // Hooks must run unconditionally, so the inner provider still builds its
  // state; it simply does not publish it when an outer provider exists.
  const [mode, setModeState] = useState<ThemeMode>(() => initialMode(theme));
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(readSystemPrefersDark);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  const resolvedTheme = resolveTheme(mode, systemPrefersDark);
  const isNested = outerTheme !== null;

  const onThemeChangeRef = useRef(onThemeChange);
  onThemeChangeRef.current = onThemeChange;

  const setMode = useCallback((next: ThemeMode) => {
    setModeState((current) => {
      if (current === next) return current;

      writeThemeMode(next);
      onThemeChangeRef.current?.(next);
      return next;
    });
  }, []);

  // Track the OS preference for as long as we are mounted. The listener runs
  // even when the mode is explicit, because `resolveTheme` ignores the value in
  // that case and switching back to `system` should be immediately correct.
  useEffect(() => {
    if (isNested || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia(DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);

    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [isNested]);

  // Adopt a choice made in another tab, so two open editors agree.
  useEffect(() => {
    if (isNested || typeof window === 'undefined') return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      if (isThemeMode(event.newValue)) setModeState(event.newValue);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isNested]);

  // Own a themed element on the body for portalled content.
  useEffect(() => {
    if (isNested || typeof document === 'undefined') return;

    const host = document.createElement('div');
    host.setAttribute(PORTAL_ATTRIBUTE, '');
    document.body.appendChild(host);
    setPortalContainer(host);

    return () => {
      host.remove();
      setPortalContainer(null);
    };
  }, [isNested]);

  // Keep the host's class in step. Separate from creation so a theme change
  // restyles the host rather than tearing it down and remounting open dialogs.
  useEffect(() => {
    if (!portalContainer) return;

    portalContainer.classList.toggle('dark', resolvedTheme === 'dark');
    portalContainer.setAttribute('data-parama-theme', resolvedTheme);
  }, [portalContainer, resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, setMode, portalContainer }),
    [mode, resolvedTheme, setMode, portalContainer]
  );

  if (isNested) return <>{children}</>;

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={[resolvedTheme === 'dark' ? 'dark' : '', className].filter(Boolean).join(' ') || undefined}
        data-parama-theme={resolvedTheme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
