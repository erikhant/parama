import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from './theme';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

/** Listeners registered against the prefers-color-scheme query. */
let mediaListeners: Array<(event: MediaQueryListEvent) => void> = [];
let systemPrefersDark = false;

/** Installs a controllable `matchMedia`, which jsdom does not provide. */
function installMatchMedia() {
  mediaListeners = [];
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('dark') && systemPrefersDark,
    media: query,
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
      mediaListeners.push(listener);
    },
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
      mediaListeners = mediaListeners.filter((entry) => entry !== listener);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as unknown as typeof window.matchMedia;
}

/** Simulates the OS flipping its colour scheme. */
function setSystemPrefersDark(value: boolean) {
  systemPrefersDark = value;
  act(() => {
    mediaListeners.forEach((listener) => listener({ matches: value } as MediaQueryListEvent));
  });
}

const portalHost = () => document.body.querySelector('[data-parama-portal]');

/** Surfaces the context so assertions can read what consumers would see. */
function ThemeProbe() {
  const { mode, resolvedTheme, setMode } = useTheme();

  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setMode('dark')}>go dark</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    systemPrefersDark = false;
    installMatchMedia();
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe('initial mode', () => {
    it('defaults to system when given nothing', () => {
      render(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('system');
    });

    it('uses the theme prop when storage is empty', () => {
      render(
        <ThemeProvider theme="dark">
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });

    // The prop seeds the first ever visit; once the user has expressed a
    // preference through the toggle, that preference wins on later mounts.
    it('prefers a stored mode over the theme prop', () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'light');

      render(
        <ThemeProvider theme="dark">
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });

    it('ignores a corrupt stored value and falls back to the prop', () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse');

      render(
        <ThemeProvider theme="dark">
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });
  });

  describe('resolution', () => {
    it('resolves system to dark when the OS prefers dark', () => {
      systemPrefersDark = true;
      installMatchMedia();

      render(
        <ThemeProvider theme="system">
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    });

    it('resolves system to light when the OS prefers light', () => {
      render(
        <ThemeProvider theme="system">
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    });

    it('ignores the OS preference when the mode is explicit', () => {
      systemPrefersDark = true;
      installMatchMedia();

      render(
        <ThemeProvider theme="light">
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    });

    it('follows the OS preference changing while mounted', () => {
      render(
        <ThemeProvider theme="system">
          <ThemeProbe />
        </ThemeProvider>
      );
      expect(screen.getByTestId('resolved')).toHaveTextContent('light');

      setSystemPrefersDark(true);

      expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    });

    it('does not follow the OS preference when the mode is explicit', () => {
      render(
        <ThemeProvider theme="light">
          <ThemeProbe />
        </ThemeProvider>
      );

      setSystemPrefersDark(true);

      expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    });
  });

  describe('DOM application', () => {
    it('marks its own root rather than the document element', () => {
      const { container } = render(
        <ThemeProvider theme="dark">
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(container.querySelector('.dark')).not.toBeNull();
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('leaves the root unmarked in light mode', () => {
      const { container } = render(
        <ThemeProvider theme="light">
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(container.querySelector('.dark')).toBeNull();
    });

    it('exposes the resolved theme as a data attribute', () => {
      const { container } = render(
        <ThemeProvider theme="dark">
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(container.querySelector('[data-parama-theme="dark"]')).not.toBeNull();
    });
  });

  describe('portal host', () => {
    // Radix renders dialogs, dropdowns and select menus outside the provider's
    // subtree, so they need a themed container of their own.
    it('creates a themed host on the body', () => {
      render(
        <ThemeProvider theme="dark">
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(portalHost()?.classList.contains('dark')).toBe(true);
    });

    it('keeps the host in step with the theme', async () => {
      const user = userEvent.setup();
      render(
        <ThemeProvider theme="light">
          <ThemeProbe />
        </ThemeProvider>
      );
      expect(portalHost()?.classList.contains('dark')).toBe(false);

      await user.click(screen.getByRole('button', { name: 'go dark' }));

      expect(portalHost()?.classList.contains('dark')).toBe(true);
    });

    it('removes the host on unmount', () => {
      const { unmount } = render(
        <ThemeProvider theme="dark">
          <ThemeProbe />
        </ThemeProvider>
      );
      expect(portalHost()).not.toBeNull();

      unmount();

      expect(portalHost()).toBeNull();
    });
  });

  describe('persistence', () => {
    it('writes the chosen mode to storage', async () => {
      const user = userEvent.setup();
      render(
        <ThemeProvider theme="light">
          <ThemeProbe />
        </ThemeProvider>
      );

      await user.click(screen.getByRole('button', { name: 'go dark' }));

      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });

    it('reports the change to the host', async () => {
      const onThemeChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ThemeProvider theme="light" onThemeChange={onThemeChange}>
          <ThemeProbe />
        </ThemeProvider>
      );

      await user.click(screen.getByRole('button', { name: 'go dark' }));

      expect(onThemeChange).toHaveBeenCalledWith('dark');
    });

    it('does not report on the initial render', () => {
      const onThemeChange = vi.fn();

      render(
        <ThemeProvider theme="dark" onThemeChange={onThemeChange}>
          <ThemeProbe />
        </ThemeProvider>
      );

      expect(onThemeChange).not.toHaveBeenCalled();
    });

    // Two editor tabs open at once should not disagree about the theme.
    it('adopts a mode written by another tab', () => {
      render(
        <ThemeProvider theme="light">
          <ThemeProbe />
        </ThemeProvider>
      );

      act(() => {
        window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
        window.dispatchEvent(
          new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'dark', storageArea: localStorage })
        );
      });

      expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    });

    it('ignores storage events for unrelated keys', () => {
      render(
        <ThemeProvider theme="light">
          <ThemeProbe />
        </ThemeProvider>
      );

      act(() => {
        window.dispatchEvent(new StorageEvent('storage', { key: 'sidebar-width', newValue: '320' }));
      });

      expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    });
  });

  describe('nesting', () => {
    // The editor previews the renderer, which mounts its own provider when
    // standalone. Inside the editor it must defer rather than fight.
    it('inherits from an outer provider instead of creating a second host', () => {
      render(
        <ThemeProvider theme="dark">
          <ThemeProvider theme="light">
            <ThemeProbe />
          </ThemeProvider>
        </ThemeProvider>
      );

      expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
      expect(document.body.querySelectorAll('[data-parama-portal]')).toHaveLength(1);
    });
  });
});

describe('useTheme outside a provider', () => {
  it('falls back to light rather than throwing', () => {
    render(<ThemeProbe />);

    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });
});
