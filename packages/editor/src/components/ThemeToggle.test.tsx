import { ThemeProvider } from '@parama-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

/** jsdom has no matchMedia; the toggle only needs it to resolve `system`. */
function installMatchMedia(prefersDark = false) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('dark') && prefersDark,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as unknown as typeof window.matchMedia;
}

const renderToggle = (theme: 'light' | 'dark' | 'system' = 'light') =>
  render(
    <ThemeProvider theme={theme}>
      <ThemeToggle />
    </ThemeProvider>
  );

const toggle = () => screen.getByRole('button', { name: /theme/i });

describe('ThemeToggle', () => {
  beforeEach(() => {
    installMatchMedia();
    window.localStorage.clear();
  });

  describe('labelling', () => {
    it.each([
      ['light', /light/i],
      ['dark', /dark/i],
      ['system', /system/i]
    ] as const)('names the current %s mode for assistive tech', (mode, expected) => {
      renderToggle(mode);

      expect(toggle()).toHaveAccessibleName(expected);
    });
  });

  describe('cycling', () => {
    // Light -> dark -> system -> light. A three-state control needs the
    // current state announced, since the icon alone cannot distinguish
    // "explicitly light" from "system, which happens to be light".
    it('advances light to dark', async () => {
      const user = userEvent.setup();
      renderToggle('light');

      await user.click(toggle());

      expect(toggle()).toHaveAccessibleName(/dark/i);
    });

    it('advances dark to system', async () => {
      const user = userEvent.setup();
      renderToggle('dark');

      await user.click(toggle());

      expect(toggle()).toHaveAccessibleName(/system/i);
    });

    it('wraps system back to light', async () => {
      const user = userEvent.setup();
      renderToggle('system');

      await user.click(toggle());

      expect(toggle()).toHaveAccessibleName(/light/i);
    });

    it('returns to the starting mode after a full cycle', async () => {
      const user = userEvent.setup();
      renderToggle('light');

      await user.click(toggle());
      await user.click(toggle());
      await user.click(toggle());

      expect(toggle()).toHaveAccessibleName(/light/i);
    });
  });

  it('persists the chosen mode', async () => {
    const user = userEvent.setup();
    renderToggle('light');

    await user.click(toggle());

    expect(window.localStorage.getItem('theme')).toBe('dark');
  });
});
