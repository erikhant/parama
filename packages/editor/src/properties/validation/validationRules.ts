import type { ValidationRule } from '@parama-dev/form-builder-types';

/**
 * Pure transitions over a field's validation rule list.
 *
 * A field holds at most one rule per `type`, so editing a rule is an upsert
 * rather than an append. Keeping that invariant in one place stops each
 * per-type panel re-implementing it.
 */

/** Finds the rule of a given type, if the field has one. */
export function findRule(rules: ValidationRule[], type: ValidationRule['type']): ValidationRule | undefined {
  return rules.find((rule) => rule.type === type);
}

/**
 * Adds a rule, or merges it into the existing rule of the same type.
 *
 * A newly added `required` rule goes to the front: it gates every other rule,
 * so its message should be the first one a user sees.
 *
 * @returns A new list; the input is never mutated.
 */
export function upsertRule(rules: ValidationRule[], rule: ValidationRule): ValidationRule[] {
  const index = rules.findIndex((existing) => existing.type === rule.type);

  if (index !== -1) {
    const next = [...rules];
    next[index] = { ...next[index], ...rule };
    return next;
  }

  return rule.type === 'required' ? [rule, ...rules] : [...rules, rule];
}

/**
 * Removes the rule of a given type.
 *
 * @returns The same reference when nothing matched, so callers can skip a
 *          pointless state write.
 */
export function removeRule(rules: ValidationRule[], type: ValidationRule['type']): ValidationRule[] {
  const filtered = rules.filter((rule) => rule.type !== type);
  return filtered.length === rules.length ? rules : filtered;
}
