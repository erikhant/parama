import type { ValidationRule } from '@parama-dev/form-builder-types';
import { memo } from 'react';
import { SectionPanel } from '../../SectionPanel';
import { PatternTemplateRow } from '../rows/PatternTemplateRow';
import { NumericRuleRow } from '../rows/NumericRuleRow';
import { RequiredRuleRow } from '../rows/RequiredRuleRow';
import type { ValidationRulesApi } from '../useValidationRules';

/** One numeric constraint offered by a section. */
export interface NumericConstraint {
  ruleType: ValidationRule['type'];
  label: string;
  hint: string;
  describe: (value: number) => string;
}

/**
 * Constraint sets, keyed by the field family that offers them.
 *
 * Making these data rather than markup is what collapses six near-identical
 * ~28-line blocks into one row component: the panels differ only in which
 * constraints they list and how each phrases its message.
 */
export const CONSTRAINT_SETS = {
  length: [
    {
      ruleType: 'minLength',
      label: 'Min length',
      hint: 'Minimum character length',
      describe: (value: number) => `Minimum length is ${value}`
    },
    {
      ruleType: 'maxLength',
      label: 'Max length',
      hint: 'Maximum character length',
      describe: (value: number) => `Maximum length is ${value}`
    }
  ],
  maxLengthOnly: [
    {
      ruleType: 'maxLength',
      label: 'Max length',
      hint: 'Maximum character length',
      describe: (value: number) => `Maximum length is ${value}`
    }
  ],
  bounds: [
    { ruleType: 'min', label: 'Min', hint: 'Minimum value', describe: (value: number) => `Minimum value is ${value}` },
    { ruleType: 'max', label: 'Max', hint: 'Maximum value', describe: (value: number) => `Maximum value is ${value}` }
  ],
  selection: [
    {
      ruleType: 'minSelected',
      label: 'Min selected',
      hint: 'Minimum selected',
      describe: (value: number) => `Minimum selected is ${value}`
    },
    {
      ruleType: 'maxSelected',
      label: 'Max selected',
      hint: 'Maximum selected',
      describe: (value: number) => `Maximum selected is ${value}`
    }
  ]
} satisfies Record<string, NumericConstraint[]>;

interface NumericConstraintsValidationProps {
  rules: ValidationRulesApi;
  constraints: NumericConstraint[];
  /**
   * Offers the named pattern templates above the constraints. Requires
   * `readFieldValue`, which the chosen rule is stamped with.
   */
  showPatternTemplate?: boolean;
  /** Reads the field's current value; only consulted when a rule is created. */
  readFieldValue?: () => unknown;
}

/**
 * A validation panel made of the required switch plus a list of numeric
 * constraints.
 *
 * Covers text, email, textarea, number and checkbox — every field type whose
 * validation is "is it required, and what are its numeric limits".
 */
export const NumericConstraintsValidation = memo<NumericConstraintsValidationProps>(
  ({ rules, constraints, showPatternTemplate = false, readFieldValue }) => (
    <SectionPanel title="Validation">
      <RequiredRuleRow rules={rules} />

      {showPatternTemplate && readFieldValue && <PatternTemplateRow rules={rules} readFieldValue={readFieldValue} />}

      {constraints.map((constraint) => (
        <NumericRuleRow
          key={constraint.ruleType}
          label={constraint.label}
          hint={constraint.hint}
          ruleType={constraint.ruleType}
          rule={rules.get(constraint.ruleType)}
          describe={constraint.describe}
          isReadOnly={rules.isReadOnly}
          onSet={rules.set}
          onRemove={rules.remove}
        />
      ))}
    </SectionPanel>
  )
);

NumericConstraintsValidation.displayName = 'NumericConstraintsValidation';

/**
 * A validation panel offering nothing but the required switch.
 *
 * Used by date, radio, select, multiselect and autocomplete, which have no
 * numeric constraints to express.
 */
export const RequiredOnlyValidation = memo<{ rules: ValidationRulesApi }>(({ rules }) => (
  <SectionPanel title="Validation">
    <RequiredRuleRow rules={rules} />
  </SectionPanel>
));

RequiredOnlyValidation.displayName = 'RequiredOnlyValidation';
