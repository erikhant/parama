import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Resolved from the workspace root, which is where vitest runs.
const css = readFileSync(resolve(process.cwd(), 'packages/parama-ui/src/components/styles/variables.css'), 'utf8');

/**
 * Extracts the custom-property declarations inside a top-level selector block.
 *
 * Parsed by scanning rather than by regex: the stylesheet is the source of
 * truth for the design tokens, and a brittle pattern that silently matched
 * nothing would make these assertions pass for the wrong reason.
 */
function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Selector not found: ${selector}`);

  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  if (open === -1 || close === -1) throw new Error(`Malformed block for: ${selector}`);

  const declarations: Record<string, string> = {};

  for (const raw of css.slice(open + 1, close).split(';')) {
    const line = raw.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!line.startsWith('--')) continue;

    const colon = line.indexOf(':');
    declarations[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }

  return declarations;
}

const light = block(':root');
const dark = block('.dark {');

/** Every token that must exist in, and differ between, both themes. */
const SEMANTIC_TOKENS = [
  '--surface',
  '--surface-raised',
  '--surface-muted',
  '--surface-sunken',
  '--stroke',
  '--stroke-subtle',
  '--stroke-strong',
  '--content',
  '--content-muted',
  '--content-subtle',
  '--content-faint'
];

describe('theme tokens', () => {
  it('parsed both theme blocks', () => {
    expect(Object.keys(light).length).toBeGreaterThan(10);
    expect(Object.keys(dark).length).toBeGreaterThan(10);
  });

  it.each(SEMANTIC_TOKENS)('defines %s in the light theme', (name) => {
    expect(light[name]).toBeDefined();
  });

  // A semantic token the dark scope forgets silently keeps its light value.
  // That is exactly how a light panel ends up sitting in a dark editor.
  it.each(SEMANTIC_TOKENS)('overrides %s in the dark theme', (name) => {
    expect(dark[name]).toBeDefined();
    expect(dark[name]).not.toBe(light[name]);
  });

  it('states every token as an RGB triplet so Tailwind can apply its own alpha', () => {
    const triplet = /^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/;

    for (const name of SEMANTIC_TOKENS) {
      expect(light[name], `${name} (light)`).toMatch(triplet);
      expect(dark[name], `${name} (dark)`).toMatch(triplet);
    }
  });

  describe('elevation', () => {
    const luminance = (triplet: string) => {
      const [r, g, b] = triplet.split(',').map((part) => Number(part.trim()));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    // A dark surface cannot cast a visible shadow, so a raised element has to
    // read as lighter than the base it sits on.
    it('makes raised surfaces lighter than the base in dark mode', () => {
      expect(luminance(dark['--surface-raised'])).toBeGreaterThan(luminance(dark['--surface']));
    });

    it('keeps raised level with the base in light mode, where shadow carries depth', () => {
      expect(light['--surface-raised']).toBe(light['--surface']);
    });
  });

  // Dialogs and sheets set no colour of their own and inherit from `<body>`,
  // which rendered black text on a dark surface until both themed roots
  // anchored a default. Portalled content is affected worst, since it inherits
  // from the body rather than from the provider's subtree.
  describe('inherited text colour', () => {
    it('anchors a default on the provider root', () => {
      expect(css).toContain('[data-parama-theme]');
    });

    it('anchors the same default on the portal host', () => {
      expect(css).toContain('[data-parama-portal]');
    });

    it('resolves that default from the content token', () => {
      const anchor = css.indexOf('[data-parama-portal]');
      expect(css.slice(anchor, anchor + 120)).toContain('color: rgb(var(--content))');
    });
  });
});
