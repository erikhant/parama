import type { ValidationRule } from '@parama-dev/form-builder-types';
import { FormItem, Input, Label } from '@parama-ui/react';
import { memo, useCallback } from 'react';

export interface NumericRuleRowProps {
  label: string;
  ruleType: ValidationRule['type'];
  /** The field's current rule of this type, if it has one. */
  rule: ValidationRule | undefined;
  /** Builds the message stored on the rule, e.g. `Minimum length is 3`. */
  describe: (value: number) => string;
  isReadOnly: boolean;
  onSet: (rule: ValidationRule) => void;
  onRemove: (type: ValidationRule['type']) => void;
  /** Tooltip and placeholder text; falls back to the label. */
  hint?: string;
}

/**
 * One numeric validation constraint: a label and a number input.
 *
 * Six rules share this exact shape — `minLength`, `maxLength`, `min`, `max`,
 * `minSelected`, `maxSelected` — and were previously six copies of the same
 * ~28-line block differing only in the rule type and the message wording.
 *
 * Clearing the input removes the rule. Numeric rules have no separate delete
 * control, so an empty box has to mean "no constraint" rather than "zero".
 * Values that are not a non-negative number are ignored, leaving the previous
 * rule intact rather than storing `NaN`.
 */
export const NumericRuleRow = memo<NumericRuleRowProps>(
  ({ label, ruleType, rule, describe, isReadOnly, onSet, onRemove, hint }) => {
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;

        if (raw === '') {
          onRemove(ruleType);
          return;
        }

        const value = Number(raw);
        if (isNaN(value) || value < 0) return;

        onSet({ trigger: 'change', type: ruleType, value, message: describe(value) } as ValidationRule);
      },
      [ruleType, describe, onSet, onRemove]
    );

    return (
      <FormItem orientation="horizontal">
        <Label className="!col-span-3">{label}</Label>
        <Input
          type="number"
          min={0}
          title={hint ?? label}
          placeholder={hint ?? label}
          value={rule?.value ?? ''}
          disabled={isReadOnly}
          className="!col-span-2"
          onChange={handleChange}
        />
      </FormItem>
    );
  }
);

NumericRuleRow.displayName = 'NumericRuleRow';
