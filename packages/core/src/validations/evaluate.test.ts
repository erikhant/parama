import type { ValidationRule } from '@parama-dev/form-builder-types';
import { describe, expect, it } from 'vitest';
import { evaluateValidations } from './evaluate';

const run = (rule: ValidationRule, value: any, formData: Record<string, any> = {}) =>
  evaluateValidations('field-1', rule, value, formData);

const required = (message = 'Required'): ValidationRule => ({ type: 'required', message });

describe('evaluateValidations', () => {
  describe('required', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['empty string', ''],
      ['whitespace only', '   '],
      ['empty array', []]
    ])('rejects %s', async (_label, value) => {
      expect(await run(required(), value)).toBe('Required');
    });

    it.each([
      ['a non-empty string', 'hello'],
      ['a positive number', 42],
      ['a populated array', ['a']]
    ])('accepts %s', async (_label, value) => {
      expect(await run(required(), value)).toBe(true);
    });

    // KNOWN ISSUE: the final branch is `Boolean(value) || rule.message`, so a
    // numeric field whose legitimate value is 0 fails `required`. Same for
    // `false` on a boolean-valued field. Documented rather than changed —
    // fixing it alters validation semantics for every numeric field, which is a
    // product decision, not a refactor.
    it('rejects zero, treating it as empty', async () => {
      expect(await run(required(), 0)).toBe('Required');
    });

    it('accepts a valid Date', async () => {
      expect(await run(required(), new Date('2024-01-01'))).toBe(true);
    });

    it('rejects an Invalid Date', async () => {
      expect(await run(required(), new Date('nonsense'))).toBe('Required');
    });

    it('requires both ends of a date range', async () => {
      expect(await run(required(), { from: new Date(), to: new Date() })).toBe(true);
      expect(await run(required(), { from: new Date(), to: undefined })).toBe('Required');
    });
  });

  describe('pattern', () => {
    it('validates a named email rule', async () => {
      const rule: ValidationRule = { type: 'pattern', name: 'email', message: 'Bad email' };

      expect(await run(rule, 'user@example.com')).toBe(true);
      expect(await run(rule, 'not-an-email')).toBe('Bad email');
    });

    it('skips the email rule for an empty value so required owns emptiness', async () => {
      const rule: ValidationRule = { type: 'pattern', name: 'email', message: 'Bad email' };

      expect(await run(rule, '')).toBe(true);
    });

    it('applies a custom RegExp', async () => {
      const rule: ValidationRule = { type: 'pattern', pattern: /^\d{3}$/, message: 'Need 3 digits' };

      expect(await run(rule, '123')).toBe(true);
      expect(await run(rule, '12')).toBe('Need 3 digits');
    });

    it('passes when no pattern is configured', async () => {
      expect(await run({ type: 'pattern', message: 'x' }, 'anything')).toBe(true);
    });
  });

  describe('length and bounds', () => {
    it('enforces minLength on strings only', async () => {
      const rule: ValidationRule = { type: 'minLength', value: 3, message: 'Too short' };

      expect(await run(rule, 'abc')).toBe(true);
      expect(await run(rule, 'ab')).toBe('Too short');
      expect(await run(rule, 12)).toBe(true);
    });

    it('enforces maxLength', async () => {
      const rule: ValidationRule = { type: 'maxLength', value: 3, message: 'Too long' };

      expect(await run(rule, 'abcd')).toBe('Too long');
    });

    it('enforces min and max on numbers', async () => {
      expect(await run({ type: 'min', value: 10, message: 'Low' }, 5)).toBe('Low');
      expect(await run({ type: 'max', value: 10, message: 'High' }, 15)).toBe('High');
    });

    it('enforces minSelected and maxSelected on arrays', async () => {
      expect(await run({ type: 'minSelected', value: 2, message: 'Pick 2' }, ['a'])).toBe('Pick 2');
      expect(await run({ type: 'maxSelected', value: 1, message: 'Only 1' }, ['a', 'b'])).toBe('Only 1');
    });
  });

  describe('cross-field expressions', () => {
    it('passes when the interpolated expression is truthy', async () => {
      const rule: ValidationRule = {
        type: 'cross-field',
        expression: '{{end}} > {{start}}',
        message: 'End must follow start'
      };

      expect(await run(rule, 10, { start: 1, end: 10 })).toBe(true);
    });

    it('fails when the expression is falsy', async () => {
      const rule: ValidationRule = {
        type: 'cross-field',
        expression: '{{end}} > {{start}}',
        message: 'End must follow start'
      };

      expect(await run(rule, 0, { start: 10, end: 1 })).toBe('End must follow start');
    });

    it('reports the message when the expression throws', async () => {
      const rule: ValidationRule = { type: 'cross-field', expression: '{{a}}.oops(', message: 'Broken' };

      expect(await run(rule, null, {})).toBe('Broken');
    });
  });

  it('passes for an unrecognised rule type', async () => {
    expect(await run({ type: 'json-schema', message: 'x' }, 'value')).toBe(true);
  });
});
