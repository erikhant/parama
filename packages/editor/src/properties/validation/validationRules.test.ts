import type { ValidationRule } from '@parama-dev/form-builder-types';
import { describe, expect, it } from 'vitest';
import { findRule, removeRule, upsertRule } from './validationRules';

const rule = (type: ValidationRule['type'], extra: Partial<ValidationRule> = {}): ValidationRule =>
  ({ type, message: `${type} failed`, ...extra }) as ValidationRule;

describe('findRule', () => {
  it('returns the rule of the requested type', () => {
    const rules = [rule('required'), rule('minLength')];

    expect(findRule(rules, 'minLength')).toMatchObject({ type: 'minLength' });
  });

  it('returns undefined when the type is absent', () => {
    expect(findRule([rule('required')], 'maxLength')).toBeUndefined();
  });

  it('tolerates an empty list', () => {
    expect(findRule([], 'required')).toBeUndefined();
  });
});

describe('upsertRule', () => {
  it('appends a rule that is not present yet', () => {
    const result = upsertRule([rule('required')], rule('minLength', { value: 3 }));

    expect(result.map((r) => r.type)).toEqual(['required', 'minLength']);
  });

  it('merges into an existing rule of the same type', () => {
    const result = upsertRule([rule('minLength', { value: 3 })], { type: 'minLength', value: 5 } as ValidationRule);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ type: 'minLength', value: 5, message: 'minLength failed' });
  });

  // `required` gates every other rule, so it reads first in the panel and its
  // message should be the one surfaced first at runtime.
  it('puts a new required rule at the front', () => {
    const result = upsertRule([rule('minLength')], rule('required'));

    expect(result.map((r) => r.type)).toEqual(['required', 'minLength']);
  });

  it('does not reorder an existing required rule', () => {
    const rules = [rule('minLength'), rule('required')];

    const result = upsertRule(rules, { type: 'required', message: 'Updated' } as ValidationRule);

    expect(result.map((r) => r.type)).toEqual(['minLength', 'required']);
    expect(result[1].message).toBe('Updated');
  });

  it('does not mutate the input list', () => {
    const rules = [rule('required')];

    upsertRule(rules, rule('minLength'));

    expect(rules).toHaveLength(1);
  });
});

describe('removeRule', () => {
  it('drops the rule of the given type', () => {
    const result = removeRule([rule('required'), rule('minLength')], 'required');

    expect(result.map((r) => r.type)).toEqual(['minLength']);
  });

  it('returns the same reference when nothing matches', () => {
    const rules = [rule('required')];

    expect(removeRule(rules, 'maxLength')).toBe(rules);
  });
});
