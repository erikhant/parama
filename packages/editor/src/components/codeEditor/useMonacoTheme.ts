import type { BeforeMount } from '@monaco-editor/react';
import { useTheme } from '@parama-ui/react';
import { useCallback } from 'react';
import { defineParamaThemes, monacoThemeFor, type MonacoTheme } from './monacoTheme';

export interface MonacoThemeBinding {
  /** Pass to the editor's `theme` prop. */
  theme: MonacoTheme;
  /** Pass to the editor's `beforeMount` prop so the theme exists first. */
  beforeMount: BeforeMount;
}

/**
 * Binds an embedded Monaco editor to the app theme.
 *
 * Returns both halves because they are useless apart: naming a theme Monaco has
 * not been given yet silently falls back to its default, which is how a code
 * pane ends up light inside a dark dialog.
 */
export function useMonacoTheme(): MonacoThemeBinding {
  const { resolvedTheme } = useTheme();

  const beforeMount = useCallback<BeforeMount>((monaco) => defineParamaThemes(monaco), []);

  return { theme: monacoThemeFor(resolvedTheme), beforeMount };
}
