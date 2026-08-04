import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PARAMA_SCOPE_ATTRIBUTE, paramaScope } from './scope';
import { ThemeProvider } from './ThemeProvider';

/*
 * The bundled stylesheet keys its reset and its utilities to
 * `[data-parama-scope]`. These guard the invariant that makes that safe: the
 * marker appears only on subtrees the library draws, never on the theme
 * wrapper — which a host is told to wrap its entire application in.
 *
 * Anchoring on the theme wrapper shipped once, and it flattened the host's own
 * buttons, borders and padding, because `[data-parama-theme] *` matches host
 * markup at the same specificity as the host's own class selectors.
 */
describe('parama scope marker', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    })) as unknown as typeof window.matchMedia;
  });

  it('is a different attribute from the theme marker', () => {
    expect(PARAMA_SCOPE_ATTRIBUTE).toBe('data-parama-scope');
    expect(PARAMA_SCOPE_ATTRIBUTE).not.toBe('data-parama-theme');
  });

  it('spreads onto an element as a bare attribute', () => {
    const { container } = render(<div {...paramaScope} data-testid="root" />);

    expect(container.querySelector('[data-parama-scope]')).not.toBeNull();
  });

  // The load-bearing one: host content sits inside the provider by design, so
  // the provider's wrapper must not claim to be library chrome.
  it('is absent from the theme wrapper, so host children stay unscoped', () => {
    const { container } = render(
      <ThemeProvider>
        <button className="host-button">host markup</button>
      </ThemeProvider>
    );

    const wrapper = container.querySelector('[data-parama-theme]');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.hasAttribute(PARAMA_SCOPE_ATTRIBUTE)).toBe(false);

    const hostButton = container.querySelector('.host-button');
    expect(hostButton!.closest(`[${PARAMA_SCOPE_ATTRIBUTE}]`)).toBeNull();
  });

  // Portalled overlays live on the body, outside every other scoped root, so
  // the host element has to carry the marker or they lose all styling.
  it('is present on the portal host', () => {
    render(
      <ThemeProvider>
        <span>child</span>
      </ThemeProvider>
    );

    const portalHost = document.querySelector('[data-parama-portal]');
    expect(portalHost).not.toBeNull();
    expect(portalHost!.hasAttribute(PARAMA_SCOPE_ATTRIBUTE)).toBe(true);
  });
});
