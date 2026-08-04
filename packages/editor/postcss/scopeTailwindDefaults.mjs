/**
 * Confines Tailwind's `--tw-*` defaults block to the library's own subtrees.
 *
 * Tailwind emits one global rule seeding every `--tw-*` variable it might need:
 *
 *   *, ::before, ::after { --tw-translate-x: 0; --tw-ring-color: …; … }
 *
 * `important` does not touch it — it is a base-layer rule, not a utility — so
 * it survives the scoping applied to everything else and ships unlayered and
 * document-wide.
 *
 * That is harmless until the host also uses Tailwind. v4 emits its utilities
 * into a real `@layer utilities` and its own defaults into `@layer properties`,
 * and **unlayered CSS beats layered CSS regardless of specificity**. So this
 * one rule silently overrides every v4 utility that reads those variables:
 * `-translate-x-1/2` stops centring dialogs, rings and shadows lose their
 * colour, gradients and filters flatten. The host's own components break, and
 * the cause is a stylesheet they only imported for the form builder.
 *
 * Scoping it keeps the fallbacks where the library's utilities need them and
 * nowhere else. `:where()` contributes no specificity, so the library's own
 * utilities still override the fallback inside the scope.
 */
const SCOPE = '[data-parama-scope]';

const DEFAULTS_SELECTORS = new Set(['*,::before,::after', '*,:before,:after']);

/**
 * Tailwind's `important: '<selector>'` emits a *descendant* selector —
 * `[data-parama-scope] .max-w-4xl` — and an element is not its own descendant.
 * So any component that marks itself as a scope root silently loses every
 * utility class it carries: the preview sheet kept `!max-w-4xl` and `!px-0` in
 * its `class` attribute and rendered at neither.
 *
 * Rewriting the leading combinator to `:is(root, root *)` lets the rule match
 * the root as well, which is what "scoped to this subtree" should have meant
 * all along. `:is()` takes the highest specificity among its arguments, both
 * (0,1,0) here, so the utility's weight is unchanged.
 */
const SCOPE_DESCENDANT_PREFIX = `${SCOPE} `;
const SCOPE_SELF_OR_DESCENDANT = `:is(${SCOPE},${SCOPE} *)`;

/** `[data-parama-scope] .foo` -> `:is(…,… *).foo`, leaving anything else alone. */
function matchScopeRootToo(selector) {
  if (!selector.startsWith(SCOPE_DESCENDANT_PREFIX)) return selector;

  // No separator: the compound must land on the same element as the scope test.
  return SCOPE_SELF_OR_DESCENDANT + selector.slice(SCOPE_DESCENDANT_PREFIX.length);
}

/** True for the generated defaults rule: a bare universal selector that only seeds `--tw-*`. */
function isTailwindDefaultsRule(rule) {
  if (rule.parent?.type !== 'root') return false;

  const normalised = rule.selector.replace(/\s+/g, '');
  if (!DEFAULTS_SELECTORS.has(normalised)) return false;

  let onlyTailwindVars = true;
  rule.walkDecls((decl) => {
    if (!decl.prop.startsWith('--tw-')) onlyTailwindVars = false;
  });

  return onlyTailwindVars;
}

/** The same rule as emitted for `::backdrop`, which nothing here renders. */
function isBackdropDefaultsRule(rule) {
  if (rule.parent?.type !== 'root') return false;
  if (rule.selector.replace(/\s+/g, '') !== '::backdrop') return false;

  let onlyTailwindVars = true;
  rule.walkDecls((decl) => {
    if (!decl.prop.startsWith('--tw-')) onlyTailwindVars = false;
  });

  return onlyTailwindVars;
}

/**
 * @param {{ strict?: boolean }} [options]
 *   `strict` warns when an expected rewrite finds nothing. On for the real
 *   build, where silence means the stylesheet shipped wrong; off by default so
 *   unit fixtures, which contain one rule kind at a time, stay quiet.
 */
const plugin = ({ strict = false } = {}) => ({
  postcssPlugin: 'parama-scope-tailwind-defaults',

  // After Tailwind has generated everything, so the rule exists to rewrite.
  OnceExit(root) {
    let scoped = 0;
    let removed = 0;
    let widened = 0;

    root.walkRules((rule) => {
      if (isBackdropDefaultsRule(rule)) {
        // The library draws no native <dialog>, so this only ever leaked.
        rule.remove();
        removed += 1;
        return;
      }

      if (isTailwindDefaultsRule(rule)) {
        rule.selectors = [
          `:where(${SCOPE})`,
          `:where(${SCOPE}) *`,
          `:where(${SCOPE}) *::before`,
          `:where(${SCOPE}) *::after`
        ];
        scoped += 1;
        return;
      }

      // Every other scoped rule: let it match the scope root, not just inside it.
      if (rule.selectors.some((s) => s.startsWith(SCOPE_DESCENDANT_PREFIX))) {
        rule.selectors = rule.selectors.map(matchScopeRootToo);
        widened += 1;
      }
    });

    if (!strict) return;

    if (scoped === 0 && removed === 0) {
      // Loud on purpose: silently shipping the global rule is the bug.
      console.warn('[parama] Tailwind defaults rule not found — the global --tw-* block may have shipped unscoped.');
    }

    if (widened === 0) {
      // Equally loud: without this, a scope root loses its own utility classes.
      console.warn('[parama] No scoped utilities found — check the `important` selector in tailwind.config.js.');
    }
  }
});

plugin.postcss = true;

export default plugin;
