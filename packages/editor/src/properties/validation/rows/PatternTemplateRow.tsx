import { builtInValidatorTemplate } from '@parama-dev/form-builder-core';
import type { ValidationRule } from '@parama-dev/form-builder-types';
import { Button, FormItem, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@parama-ui/react';
import { memo, useCallback, useMemo } from 'react';
import type { ValidationRulesApi } from '../useValidationRules';

/**
 * The named pattern rules offered to text-like fields.
 *
 * Password strength is excluded: it is presented as its own switch on the
 * password panel rather than as one option among email, url and the rest.
 */
export const TEXT_PATTERN_TEMPLATES: ValidationRule[] = builtInValidatorTemplate.filter(
  (rule) => rule.name !== 'passwordStrength'
);

/** The password-strength rule, presented on its own as a switch. */
export const PASSWORD_STRENGTH_TEMPLATE = builtInValidatorTemplate.find(
  (rule) => rule.name === 'passwordStrength'
) as ValidationRule;

interface PatternTemplateRowProps {
  rules: ValidationRulesApi;
  /**
   * Reads the field's current value, stored on the rule when one is chosen.
   *
   * A getter rather than a value: the value is only needed at the moment a rule
   * is created, and reading it during render would subscribe this row to every
   * keystroke in the previewed form.
   */
  readFieldValue: () => unknown;
}

/**
 * Picks a named pattern rule (email, url, phone, …) for a text-like field.
 *
 * A field carries at most one pattern rule, so this is a single select rather
 * than a list, with a Remove action that appears once a template is chosen.
 */
export const PatternTemplateRow = memo<PatternTemplateRowProps>(({ rules, readFieldValue }) => {
  const current = rules.get('pattern');

  const handleSelect = useCallback(
    (name: string) => {
      const template = TEXT_PATTERN_TEMPLATES.find((rule) => rule.name === name);
      if (!template) return;

      rules.set({ ...template, value: readFieldValue() } as ValidationRule);
    },
    [rules, readFieldValue]
  );

  const handleRemove = useCallback(() => rules.remove('pattern'), [rules]);

  const options = useMemo(() => TEXT_PATTERN_TEMPLATES.filter((rule) => Boolean(rule.name)), []);

  return (
    <FormItem className="py-2">
      <div className="flex items-center justify-between h-7">
        <Label>Validation template</Label>
        {current && (
          <Button
            color="secondary"
            variant="ghost"
            size="xs"
            className="text-xs text-content-subtle"
            disabled={rules.isReadOnly}
            onClick={handleRemove}>
            Remove
          </Button>
        )}
      </div>

      <Select value={current?.name || ''} disabled={rules.isReadOnly} onValueChange={handleSelect}>
        <SelectTrigger className="whitespace-nowrap capitalize">
          <SelectValue placeholder="No selected" />
        </SelectTrigger>
        <SelectContent>
          {options.map((rule) => (
            <SelectItem key={rule.name} value={rule.name as string} className="capitalize">
              {rule.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <p className="form-description">Choose validation template</p>
    </FormItem>
  );
});

PatternTemplateRow.displayName = 'PatternTemplateRow';
