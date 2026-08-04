import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Sheet, SheetContent } from '../components/ui/sheet';
import { PARAMA_SCOPE_ATTRIBUTE } from './scope';
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
 * Portalled overlays must be themed where they land.
 *
 * React context reaches a portal regardless of where it mounts, so `useTheme()`
 * keeps working and nothing looks broken in code review. CSS is what breaks: a
 * portal attached to `document.body` has no `.dark` ancestor, so every custom
 * property falls back to its light value and the overlay paints white over a
 * dark editor.
 *
 * The theme is carried by `ThemeScope`, a box-less wrapper inside the portal —
 * *not* by relocating the content into a shared host. That earlier approach
 * themed the content correctly but took it out of the host application's layer
 * stack, so a form opened inside someone else's modal had dropdowns that
 * rendered behind it and could not be clicked.
 *
 * `portalCoverage.test.ts` checks statically that each component wraps its
 * content. These assert the result once rendered.
 */
describe('portalled overlays are themed', () => {
  beforeEach(() => {
    installMatchMedia();
    window.localStorage.clear();
  });

  describe('Sheet', () => {
    const renderSheet = (theme: 'light' | 'dark' = 'dark') =>
      render(
        <ThemeProvider theme={theme}>
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

    // The editor's Preview opens in a Sheet. Without a themed ancestor it
    // rendered fully light over a dark editor.
    it('has the dark class on an ancestor, so tokens resolve dark', () => {
      renderSheet();

      expect(screen.getByText('preview body').closest('.dark')).not.toBeNull();
    });

    // The bundled stylesheet keys on this, so the overlay is unstyled without it.
    it('has a scope marker on an ancestor', () => {
      renderSheet();

      expect(screen.getByText('preview body').closest(`[${PARAMA_SCOPE_ATTRIBUTE}]`)).not.toBeNull();
    });

    /*
     * The regression guard. Relocating into the shared host themed the content
     * but stranded it outside a host application's modal — behind it in paint
     * order, and skipped by the pointer-events bookkeeping a modal does per
     * layer, so the content was visible but unclickable.
     */
    it('is not relocated into the shared portal host', () => {
      renderSheet();

      expect(portalHost()?.contains(screen.getByText('preview body'))).toBe(false);
    });

    it('carries no dark class in light mode', () => {
      renderSheet('light');

      const body = screen.getByText('preview body');
      expect(body.closest('.dark')).toBeNull();
      expect(body.closest(`[${PARAMA_SCOPE_ATTRIBUTE}]`)).not.toBeNull();
    });
  });

  describe('Dialog', () => {
    const renderDialog = () =>
      render(
        <ThemeProvider theme="dark">
          <Dialog open>
            <DialogContent>
              <p>dialog body</p>
            </DialogContent>
          </Dialog>
        </ThemeProvider>
      );

    it('has the dark class on an ancestor', () => {
      renderDialog();

      expect(screen.getByText('dialog body').closest('.dark')).not.toBeNull();
    });

    it('has a scope marker on an ancestor', () => {
      renderDialog();

      expect(screen.getByText('dialog body').closest(`[${PARAMA_SCOPE_ATTRIBUTE}]`)).not.toBeNull();
    });

    it('is not relocated into the shared portal host', () => {
      renderDialog();

      expect(portalHost()?.contains(screen.getByText('dialog body'))).toBe(false);
    });
  });
});
