import type { FormField, ValidationRule } from '@parama-dev/form-builder-types';
import { useCallback, useMemo } from 'react';
import { useFieldSettings } from '../hooks/useFieldSettings';
import { findRule, removeRule, upsertRule } from './validationRules';

export interface ValidationRulesApi {
  /** The field's current rules; never undefined. */
  rules: ValidationRule[];
  /** Reads one rule by type. */
  get: (type: ValidationRule['type']) => ValidationRule | undefined;
  /** Adds a rule, or merges it into the existing one of the same type. */
  set: (rule: ValidationRule) => void;
  /** Drops the rule of a given type, if present. */
  remove: (type: ValidationRule['type']) => void;
  /** True when the validation panel should reject input. */
  isReadOnly: boolean;
}

/**
 * Binds a field's validation rules to the panel's change handler.
 *
 * Every validation section needs the same four operations over the same list,
 * so they take this instead of each re-deriving `getValidationByType` /
 * `handleValidationChange` / `removeValidation` from `onChange`.
 */
export function useValidationRules(
  field: FormField,
  onChange: (updates: Partial<FormField>) => void
): ValidationRulesApi {
  const { isReadOnly } = useFieldSettings('validationSettings');

  const fieldRules = 'validations' in field ? field.validations : undefined;
  const rules = useMemo(() => fieldRules ?? [], [fieldRules]);

  const get = useCallback((type: ValidationRule['type']) => findRule(rules, type), [rules]);

  const set = useCallback(
    (rule: ValidationRule) => onChange({ validations: upsertRule(rules, rule) } as Partial<FormField>),
    [rules, onChange]
  );

  const remove = useCallback(
    (type: ValidationRule['type']) => {
      const next = removeRule(rules, type);
      // `removeRule` returns the same reference when nothing matched, so this
      // skips a state write that would re-render the whole panel for nothing.
      if (next !== rules) onChange({ validations: next } as Partial<FormField>);
    },
    [rules, onChange]
  );

  return { rules, get, set, remove, isReadOnly };
}
