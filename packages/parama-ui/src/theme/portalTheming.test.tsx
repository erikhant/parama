import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Sheet, SheetContent } from '../components/ui/sheet';
import { ThemeProvider } from './ThemeProvider';

/** jsdom has no matchMedia; the provider only needs it to resolve `system`. */
function installMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as unknown as typeof window.matchMedia;
}

const portalHost = () => document.body.querySelector('[data-parama-portal]');

/**
 * Portalled overlays must render inside the themed host.
 *
 * React context reaches a portal regardless of where it mounts, so `useTheme()`
 * keeps working and nothing looks broken in code review. CSS is what breaks: a
 * portal attached to `document.body` has no `.dark` ancestor, so every custom
 * property falls back to its light value and the overlay paints white over a
 * dark editor.
 *
 * `portalCoverage.test.ts` checks statically that each component wires the
 * container. These assert it actually lands there once rendered.
 */
describe('portalled overlays are themed', () => {
  beforeEach(() => {
    installMatchMedia();
    window.localStorage.clear();
  });

  describe('Sheet', () => {
    const renderSheet = () =>
      render(
        <ThemeProvider theme="dark">
          <Sheet open>
            <SheetContent>
              <p>preview body</p>
            </SheetContent>
          </Sheet>
        </ThemeProvider>
      );

    it('renders its content', () => {
      renderSheet();

      expect(screen.getByText('preview body')).toBeInTheDocument();
    });

    // The editor's Preview opens in a Sheet. Before the container was wired it
    // mounted on the bare body and rendered fully light over a dark editor.
    it('mounts inside the themed portal host', () => {
      renderSheet();

      expect(portalHost()?.contains(screen.getByText('preview body'))).toBe(true);
    });

    it('has the dark class on an ancestor, so tokens resolve dark', () => {
      renderSheet();

      expect(screen.getByText('preview body').closest('.dark')).not.toBeNull();
    });

    it('does not mount directly on the body', () => {
      renderSheet();

      const content = screen.getByText('preview body').closest('[role="dialog"]');
      expect(content?.parentElement).not.toBe(document.body);
    });
  });

  describe('Dialog', () => {
    it('mounts inside the themed portal host', () => {
      render(
        <ThemeProvider theme="dark">
          <Dialog open>
            <DialogContent>
              <p>dialog body</p>
            </DialogContent>
          </Dialog>
        </ThemeProvider>
      );

      expect(portalHost()?.contains(screen.getByText('dialog body'))).toBe(true);
    });
  });

  describe('in light mode', () => {
    it('still uses the host, without the dark class', () => {
      render(
        <ThemeProvider theme="light">
          <Sheet open>
            <SheetContent>
              <p>light body</p>
            </SheetContent>
          </Sheet>
        </ThemeProvider>
      );

      const body = screen.getByText('light body');
      expect(portalHost()?.contains(body)).toBe(true);
      expect(body.closest('.dark')).toBeNull();
    });
  });
});
