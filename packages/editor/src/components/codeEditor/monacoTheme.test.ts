import { describe, expect, it, vi } from 'vitest';
import { defineParamaThemes, monacoThemeFor, PARAMA_DARK_THEME } from './monacoTheme';

// Monaco paints to its own canvas and keeps a private theme registry, so it is
// the one surface in the editor a `.dark` class cannot reach. Every embedded
// instance has to be handed a theme name explicitly — exactly the wiring that
// gets forgotten at a new call site.
describe('monacoThemeFor', () => {
  it('uses the Mist-matched theme when the app is dark', () => {
    expect(monacoThemeFor('dark')).toBe(PARAMA_DARK_THEME);
  });

  it('uses Monaco’s built-in light theme when the app is light', () => {
    expect(monacoThemeFor('light')).toBe('light');
  });

  it('never returns the same theme for both app themes', () => {
    expect(monacoThemeFor('dark')).not.toBe(monacoThemeFor('light'));
  });
});

describe('defineParamaThemes', () => {
  const fakeMonaco = () => {
    const defineTheme = vi.fn();
    return { monaco: { editor: { defineTheme } } as any, defineTheme };
  };

  it('registers under the name monacoThemeFor returns', () => {
    const { monaco, defineTheme } = fakeMonaco();

    defineParamaThemes(monaco);

    expect(defineTheme).toHaveBeenCalledWith(PARAMA_DARK_THEME, expect.anything());
  });

  it('builds on vs-dark rather than starting from nothing', () => {
    const { monaco, defineTheme } = fakeMonaco();

    defineParamaThemes(monaco);

    expect(defineTheme.mock.calls[0][1]).toMatchObject({ base: 'vs-dark', inherit: true });
  });

  // Monaco's stock vs-dark background is #1e1e1e, a warm neutral that reads as
  // a different panel against the Mist surfaces around it.
  it('overrides the background so it matches the Mist surface', () => {
    const { monaco, defineTheme } = fakeMonaco();

    defineParamaThemes(monaco);
    const { colors } = defineTheme.mock.calls[0][1];

    expect(colors['editor.background']).toBe('#161b1d');
    expect(colors['editor.background']).not.toBe('#1e1e1e');
  });

  it('states every colour as a hex value Monaco can parse', () => {
    const { monaco, defineTheme } = fakeMonaco();

    defineParamaThemes(monaco);
    const { colors } = defineTheme.mock.calls[0][1];

    for (const [key, value] of Object.entries(colors as Record<string, string>)) {
      expect(value, key).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/i);
    }
  });

  // Each editor registers before it mounts rather than assuming another has
  // gone first, so this runs many times per session.
  it('is safe to call repeatedly', () => {
    const { monaco, defineTheme } = fakeMonaco();

    defineParamaThemes(monaco);
    defineParamaThemes(monaco);

    expect(defineTheme).toHaveBeenCalledTimes(2);
  });
});
