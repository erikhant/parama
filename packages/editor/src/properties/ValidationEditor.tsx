import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { FileField, FormField } from '@parama-dev/form-builder-types';
import { memo, useCallback } from 'react';
import {
  CONSTRAINT_SETS,
  NumericConstraintsValidation,
  RequiredOnlyValidation
} from './validation/sections/NumericConstraintsValidation';
import { FileValidation } from './validation/sections/FileValidation';
import { PasswordValidation } from './validation/sections/PasswordValidation';
import { useValidationRules } from './validation/useValidationRules';

type ValidationEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

/** Field types validated by character length, and offered pattern templates. */
const LENGTH_TYPES = new Set<FormField['type']>(['text', 'email']);

/** Field types whose validation is the required switch and nothing else. */
const REQUIRED_ONLY_TYPES = new Set<FormField['type']>([
  'date',
  'radio',
  'select',
  'multiselect',
  'autocomplete'
]);

/**
 * Routes a selected field to the validation panel that applies to it.
 *
 * The nine per-type panels this replaced were mostly the same three ingredients
 * in different combinations — a required switch, a pattern template picker, and
 * a list of numeric constraints — so they are now composed from shared rows
 * rather than written out per type.
 *
 * Field types with no validation options render nothing.
 */
export const ValidationEditor = memo<ValidationEditorProps>(({ field, onChange }) => {
  const rules = useValidationRules(field, onChange);

  // Passed as a getter, not a value. `getFieldValue` returns a fresh array for
  // multi-file fields, so calling it inside a selector would hand React a new
  // snapshot on every read. It is only needed at the moment a rule is created.
  const getFieldValue = useFormBuilder((state) => state.actions.getFieldValue);
  const readFieldValue = useCallback(() => getFieldValue(field.id), [getFieldValue, field.id]);

  if (LENGTH_TYPES.has(field.type)) {
    return (
      <NumericConstraintsValidation
        rules={rules}
        constraints={CONSTRAINT_SETS.length}
        showPatternTemplate
        readFieldValue={readFieldValue}
      />
    );
  }

  if (field.type === 'textarea') {
    return <NumericConstraintsValidation rules={rules} constraints={CONSTRAINT_SETS.maxLengthOnly} />;
  }

  if (field.type === 'number') {
    return <NumericConstraintsValidation rules={rules} constraints={CONSTRAINT_SETS.bounds} />;
  }

  if (field.type === 'checkbox') {
    return <NumericConstraintsValidation rules={rules} constraints={CONSTRAINT_SETS.selection} />;
  }

  if (field.type === 'password') {
    return <PasswordValidation rules={rules} readFieldValue={readFieldValue} />;
  }

  if (field.type === 'file') {
    return <FileValidation field={field as FileField} rules={rules} onChange={onChange} />;
  }

  if (REQUIRED_ONLY_TYPES.has(field.type)) {
    return <RequiredOnlyValidation rules={rules} />;
  }

  return null;
});

ValidationEditor.displayName = 'ValidationEditor';

export default ValidationEditor;
