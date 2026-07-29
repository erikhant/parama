import { FormItem, Label, Switch } from '@parama-ui/react';
import { memo, useCallback } from 'react';
import type { ValidationRulesApi } from '../useValidationRules';

/**
 * The "Required field" switch, shown by every validation section.
 *
 * Turning it on stores a `required` rule with a default message; turning it off
 * drops the rule entirely rather than storing a disabled one, so the schema
 * only ever carries constraints that apply.
 */
export const RequiredRuleRow = memo<{ rules: ValidationRulesApi }>(({ rules }) => {
  const handleChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        rules.set({ trigger: 'change', type: 'required', message: 'This field is required' });
      } else {
        rules.remove('required');
      }
    },
    [rules]
  );

  return (
    <FormItem orientation="horizontal">
      <Label className="!col-span-4">Required field</Label>
      <Switch
        className="!col-span-1"
        checked={Boolean(rules.get('required'))}
        disabled={rules.isReadOnly}
        onCheckedChange={handleChange}
      />
    </FormItem>
  );
});

RequiredRuleRow.displayName = 'RequiredRuleRow';
