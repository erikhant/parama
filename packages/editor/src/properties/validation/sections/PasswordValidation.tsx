import type { ValidationRule } from '@parama-dev/form-builder-types';
import { FormItem, Label, Switch } from '@parama-ui/react';
import { memo, useCallback } from 'react';
import { SectionPanel } from '../../SectionPanel';
import { PASSWORD_STRENGTH_TEMPLATE } from '../rows/PatternTemplateRow';
import { RequiredRuleRow } from '../rows/RequiredRuleRow';
import type { ValidationRulesApi } from '../useValidationRules';

interface PasswordValidationProps {
  rules: ValidationRulesApi;
  /**
   * Reads the field's current value, stored on the rule when strength checking
   * is switched on. A getter, so the panel does not re-render on every keystroke
   * in the previewed form.
   */
  readFieldValue: () => unknown;
}

/**
 * Validation panel for password fields.
 *
 * Strength checking is a `pattern` rule like any other, but it is presented as
 * a switch rather than one entry in the template dropdown: a password field has
 * no use for the email or URL patterns, so offering them would be noise.
 */
export const PasswordValidation = memo<PasswordValidationProps>(({ rules, readFieldValue }) => {
  const handleStrengthChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        rules.set({ ...PASSWORD_STRENGTH_TEMPLATE, value: readFieldValue() } as ValidationRule);
      } else {
        rules.remove('pattern');
      }
    },
    [rules, readFieldValue]
  );

  return (
    <SectionPanel title="Validation">
      <RequiredRuleRow rules={rules} />

      <FormItem orientation="horizontal">
        <Label className="!col-span-4">Enable strength password</Label>
        <Switch
          className="!col-span-1"
          checked={Boolean(rules.get('pattern'))}
          disabled={rules.isReadOnly}
          onCheckedChange={handleStrengthChange}
        />
      </FormItem>
    </SectionPanel>
  );
});

PasswordValidation.displayName = 'PasswordValidation';
