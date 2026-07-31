import type { Monaco } from '@monaco-editor/react';
import type { ResolvedTheme } from '@parama-ui/react';

/**
 * Monaco theming.
 *
 * Monaco paints to its own canvas and keeps a private theme registry, so it is
 * the one surface in the editor a `.dark` class cannot reach — every embedded
 * instance has to be handed a theme name explicitly.
 *
 * Its stock `vs-dark` is a warm neutral (#1e1e1e) that clashes with the Mist
 * scale the rest of the UI is built from, so the dark theme is redefined with
 * Mist's own surface colour. Light mode uses Monaco's built-in `light`, whose
 * white background already matches.
 */

/** Name registered with Monaco for the Mist-matched dark theme. */
export const PARAMA_DARK_THEME = 'parama-dark';

export type MonacoTheme = 'light' | typeof PARAMA_DARK_THEME;

/**
 * Mist surface colours, mirroring the `--surface` tokens.
 *
 * Duplicated as hex because Monaco's theme API takes literal colours and cannot
 * read CSS variables. Keep in step with `variables.css`.
 */
const MIST = {
  /** `--surface` — the code well sits a step below the panel around it. */
  background: '#161b1d',
  /** `--content` */
  foreground: '#e2e9ec',
  /** `--surface-sunken`, for the current-line highlight. */
  lineHighlight: '#2e3335',
  /** `--content-faint`, for the gutter. */
  lineNumber: '#7b8184'
} as const;

/** Maps the resolved app theme onto the Monaco theme that matches it. */
export function monacoThemeFor(resolvedTheme: ResolvedTheme): MonacoTheme {
  return resolvedTheme === 'dark' ? PARAMA_DARK_THEME : 'light';
}

/**
 * Registers the Mist dark theme with a Monaco instance.
 *
 * Safe to call repeatedly — `defineTheme` overwrites by name, and each editor
 * runs this before it mounts rather than relying on some other editor having
 * gone first.
 */
export function defineParamaThemes(monaco: Monaco): void {
  monaco.editor.defineTheme(PARAMA_DARK_THEME, {
    base: 'vs-dark',
    // Inherit vs-dark's token colours; only the chrome is restated.
    inherit: true,
    rules: [],
    colors: {
      'editor.background': MIST.background,
      'editor.foreground': MIST.foreground,
      'editorLineNumber.foreground': MIST.lineNumber,
      'editor.lineHighlightBackground': MIST.lineHighlight,
      'editorGutter.background': MIST.background,
      'editorWidget.background': MIST.background,
      'minimap.background': MIST.background,
      'scrollbarSlider.background': `${MIST.lineHighlight}aa`
    }
  });
}
