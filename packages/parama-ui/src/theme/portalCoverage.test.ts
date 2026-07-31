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
 * Theming reaches portalled content only if it is told where to render.
 *
 * React context follows the React tree, so `useTheme()` works inside a portal
 * regardless. CSS does not: a portal attaches to `document.body`, outside the
 * provider's subtree, so the `.dark` class never reaches it and every custom
 * property resolves to its light value. The result is a fully light dialog or
 * sheet floating over a dark editor.
 *
 * This is easy to miss, because a new portalled component looks correct in
 * light mode and in isolation. Enumerating them here means the next one cannot
 * be added without wiring the container.
 */
describe('portal theming coverage', () => {
  it('found the portalled components to check', () => {
    expect(portalled.length).toBeGreaterThan(0);
  });

  it.each(portalled.map((c) => c.name))('%s renders into the themed portal host', (name) => {
    const component = portalled.find((c) => c.name === name)!;

    expect(
      component.source.includes('usePortalContainer'),
      `${name} portals without usePortalContainer, so it will render unthemed on document.body`
    ).toBe(true);
  });

  it.each(portalled.map((c) => c.name))('%s passes the container to its Portal', (name) => {
    const component = portalled.find((c) => c.name === name)!;

    expect(component.source, `${name} resolves a container but never passes it to Portal`).toMatch(/container=\{/);
  });
});
