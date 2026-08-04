import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import scopeTailwindDefaults from './scopeTailwindDefaults.mjs';

const run = (css: string) => postcss([scopeTailwindDefaults()]).process(css, { from: undefined }).css;

/*
 * These two rewrites are what make the bundled stylesheet safe to drop into an
 * application that already uses Tailwind. Both were found the hard way.
 */
describe('scopeTailwindDefaults', () => {
  describe('the global --tw-* defaults block', () => {
    /*
     * Tailwind emits it from the base layer, so `important` never scopes it and
     * it ships unlayered and document-wide. A v4 host puts its own utilities in
     * `@layer utilities`, and unlayered CSS beats layered CSS regardless of
     * specificity — so this one rule silently overrode every v4 utility reading
     * those variables. `-translate-x-1/2` stopped centring dialogs.
     */
    it('is confined to the scope', () => {
      const out = run('*, ::before, ::after { --tw-translate-x: 0; --tw-rotate: 0; }');

      expect(out).toContain(':where([data-parama-scope])');
      expect(out).not.toMatch(/^\*, ::before/m);
    });

    it('drops the ::backdrop copy, which nothing here renders', () => {
      const out = run('::backdrop { --tw-translate-x: 0; }');

      expect(out.trim()).toBe('');
    });

    // A universal rule that sets real styles is not Tailwind's defaults block.
    it('leaves an unrelated universal rule alone', () => {
      const out = run('*, ::before, ::after { box-sizing: border-box; }');

      expect(out).toContain('*, ::before, ::after');
      expect(out).not.toContain('data-parama-scope');
    });
  });

  describe('scoped utilities', () => {
    /*
     * `important: '<selector>'` emits a descendant combinator, and an element is
     * not its own descendant — so a component that marks itself as a scope root
     * lost every utility class it carried. The preview sheet kept `!max-w-4xl`
     * and `!px-0` in its class attribute and rendered at neither.
     */
    it('match the scope root as well as its descendants', () => {
      const out = run('[data-parama-scope] .\\!max-w-4xl { max-width: 56rem }');

      expect(out).toContain(':is([data-parama-scope],[data-parama-scope] *).\\!max-w-4xl');
    });

    it('keep the rest of a compound selector intact', () => {
      const out = run('[data-parama-scope] .group:hover .flex { display: flex }');

      expect(out).toContain(':is([data-parama-scope],[data-parama-scope] *).group:hover .flex');
    });

    it('rewrite every selector in a rule list', () => {
      const out = run('[data-parama-scope] .a, [data-parama-scope] .b { color: red }');

      expect(out.match(/:is\(\[data-parama-scope\]/g)).toHaveLength(2);
    });

    // The reset is authored with `:where()` for zero specificity; widening it
    // would give it weight and let it beat component classes.
    it('leave the :where() reset untouched', () => {
      const css = ':where([data-parama-scope]) h1 { font-size: inherit }';

      expect(run(css)).toContain(':where([data-parama-scope]) h1');
    });

    it('leave host-facing selectors untouched', () => {
      const out = run('.column-span-6 { grid-column: span 6 / span 6 }');

      expect(out).not.toContain('data-parama-scope');
    });
  });
});
