import { afterEach, describe, expect, it, vi } from 'vitest';
import { isThemeMode, resolveTheme, THEME_STORAGE_KEY } from './theme';
import { readThemeMode, writeThemeMode } from './themeStorage';

describe('resolveTheme', () => {
  it.each([
    ['light', true, 'light'],
    ['light', false, 'light'],
    ['dark', true, 'dark'],
    ['dark', false, 'dark']
  ] as const)('maps an explicit %s mode to %s regardless of system preference', (mode, prefersDark, expected) => {
    expect(resolveTheme(mode, prefersDark)).toBe(expected);
  });

  it('follows the system preference when the mode is system', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});

describe('isThemeMode', () => {
  it.each(['light', 'dark', 'system'])('accepts %s', (value) => {
    expect(isThemeMode(value)).toBe(true);
  });

  it.each([
    ['a capitalised value', 'Dark'],
    ['an unknown word', 'blue'],
    ['an empty string', ''],
    ['null', null],
    ['undefined', undefined],
    ['a number', 1],
    ['an object', {}]
  ])('rejects %s', (_label, value) => {
    expect(isThemeMode(value)).toBe(false);
  });
});

describe('theme storage', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  describe('readThemeMode', () => {
    it('returns null when nothing is stored', () => {
      expect(readThemeMode()).toBeNull();
    });

    it('returns a stored mode', () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

      expect(readThemeMode()).toBe('dark');
    });

    // A neighbouring app may own the same generic `theme` key, so anything
    // unrecognised is ignored rather than trusted.
    it('returns null for a value outside the union', () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'solarized');

      expect(readThemeMode()).toBeNull();
    });

    it('returns null instead of throwing when storage is unavailable', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('denied', 'SecurityError');
      });

      expect(readThemeMode()).toBeNull();
    });
  });

  describe('writeThemeMode', () => {
    it('persists the mode under the theme key', () => {
      writeThemeMode('dark');

      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });

    it('overwrites a previous value', () => {
      writeThemeMode('dark');
      writeThemeMode('light');

      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });

    // Safari in private mode throws on write; losing persistence is acceptable,
    // crashing the host application is not.
    it('does not throw when storage rejects the write', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('quota', 'QuotaExceededError');
      });

      expect(() => writeThemeMode('dark')).not.toThrow();
    });

    it('round-trips through readThemeMode', () => {
      writeThemeMode('system');

      expect(readThemeMode()).toBe('system');
    });
  });
});
