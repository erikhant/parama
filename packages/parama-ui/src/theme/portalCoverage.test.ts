import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const UI_DIR = resolve(process.cwd(), 'packages/parama-ui/src/components/ui');

interface Component {
  name: string;
  source: string;
}

const components: Component[] = readdirSync(UI_DIR)
  .filter((name) => name.endsWith('.tsx'))
  .map((name) => ({ name, source: readFileSync(resolve(UI_DIR, name), 'utf8') }));

/** Components that render through a Radix portal, escaping the provider subtree. */
const portalled = components.filter((c) => /Primitive\.Portal|\bPortal\b/.test(c.source));

/**
 * Theming reaches portalled content only if it is carried there.
 *
 * React context follows the React tree, so `useTheme()` works inside a portal
 * regardless. CSS does not: a portal attaches to `document.body`, outside the
 * provider's subtree, so the `.dark` class never reaches it and every custom
 * property resolves to its light value. The result is a fully light dialog or
 * sheet floating over a dark editor.
 *
 * The fix is `useThemeScope`, which marks the portalled element itself, and
 * deliberately not a shared container on the body. Relocating content into one
 * host was the original approach and it broke embedding: that host is created
 * when the provider mounts, so it precedes any dialog a host application opens
 * later, and with equal z-index the overlay paints behind. A modal also
 * disables pointer events on the body and re-enables them per layer, which
 * skips a layer rendered into a foreign container — leaving the content visible
 * but unclickable.
 *
 * This is easy to miss, because a new portalled component looks correct in
 * light mode and in isolation. Enumerating them here means the next one cannot
 * be added without the marker.
 */
describe('portal theming coverage', () => {
  it('found the portalled components to check', () => {
    expect(portalled.length).toBeGreaterThan(0);
  });

  it.each(portalled.map((c) => c.name))('%s marks its portalled content with the theme scope', (name) => {
    const component = portalled.find((c) => c.name === name)!;

    expect(
      component.source.includes('useThemeScope'),
      `${name} portals without useThemeScope, so it will render unthemed on document.body`
    ).toBe(true);
  });

  // Guards the regression directly: forcing a container is what took portalled
  // content out of the host application's layer stack.
  it.each(portalled.map((c) => c.name))('%s does not force a portal container', (name) => {
    const component = portalled.find((c) => c.name === name)!;

    expect(
      component.source.includes('usePortalContainer'),
      `${name} forces a portal container, which breaks stacking and pointer events inside a host modal`
    ).toBe(false);
  });
});
