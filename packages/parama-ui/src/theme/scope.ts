/**
 * Marks a subtree as library-rendered chrome.
 *
 * This is deliberately *not* `data-parama-theme`. That attribute answers "which
 * colour scheme applies here", and the documented way to theme an application
 * is to wrap the whole of it in `ThemeProvider` — so it legitimately encloses
 * the host's own markup. Anchoring the bundled reset and utilities to it made
 * the library restyle its host.
 *
 * This attribute answers a narrower question: "did this library draw this?" It
 * appears only on roots the library owns — the editor shell, a rendered form,
 * and the portal host that carries overlays — so the CSS keyed to it can never
 * reach markup the host wrote.
 */
export const PARAMA_SCOPE_ATTRIBUTE = 'data-parama-scope';

/**
 * Spread onto a library-owned root element.
 *
 * @example
 * <div {...paramaScope}>…</div>
 */
export const paramaScope: Readonly<Record<string, string>> = Object.freeze({
  [PARAMA_SCOPE_ATTRIBUTE]: ''
});
