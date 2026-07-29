import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { CheckboxField, DateField, FileField, FormField, RadioField, TextField } from '@parama-dev/form-builder-types';
import { memo, useCallback } from 'react';
import type { ItemField, OptionField } from './optionMutations';
import { ChoiceProperties } from './sections/ChoiceProperties';
import { DateProperties } from './sections/DateProperties';
import { FileProperties } from './sections/FileProperties';
import { OptionsProperties } from './sections/OptionsProperties';
import { TextProperties } from './sections/TextProperties';

type PropertiesEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

/** Field types handled by the shared text-input section. */
const TEXT_TYPES = new Set<FormField['type']>(['hidden', 'text', 'number', 'email', 'textarea', 'password']);

/** Field types handled by the shared option-list section. */
const OPTION_TYPES = new Set<FormField['type']>(['select', 'multiselect', 'autocomplete']);

/** Field types handled by the shared checkbox/radio section. */
const CHOICE_TYPES = new Set<FormField['type']>(['checkbox', 'radio']);

/**
 * Routes a selected field to the properties section that edits it.
 *
 * This was a single 1,200-line component holding every field type's handlers at
 * once, so editing a text input still constructed the option-group and
 * date-restriction callbacks. Each section now owns only its own state, and
 * three sections cover eleven field types because the differences between them
 * turned out to be parameters rather than separate implementations.
 *
 * Field types with no editable properties render nothing.
 */
export const PropertiesEditor = memo<PropertiesEditorProps>(({ field, onChange }) => {
  const updateFieldValue = useFormBuilder((state) => state.actions.updateFieldValue);

  /**
   * Mirrors a default-value change into the live form.
   *
   * Updating the schema alone would not move the canvas preview, because a
   * rendered field reads its value from form data rather than `defaultValue`.
   */
  const commitDefaultValue = useCallback(
    (value: unknown) => updateFieldValue(field.id, value),
    [updateFieldValue, field.id]
  );

  const handleDefaultValueChange = useCallback(
    (value: string) => {
      onChange({ defaultValue: value } as Partial<FormField>);
      commitDefaultValue(value);
    },
    [onChange, commitDefaultValue]
  );

  if (TEXT_TYPES.has(field.type)) {
    return (
      <TextProperties field={field as TextField} onChange={onChange} onDefaultValueCommit={handleDefaultValueChange} />
    );
  }

  if (OPTION_TYPES.has(field.type)) {
    return <OptionsProperties field={field as OptionField} onChange={onChange} />;
  }

  if (CHOICE_TYPES.has(field.type)) {
    return (
      <ChoiceProperties
        field={field as CheckboxField | RadioField}
        onChange={onChange}
        onDefaultValueCommit={commitDefaultValue}
      />
    );
  }

  if (field.type === 'date') {
    return <DateProperties field={field as DateField} onChange={onChange} />;
  }

  if (field.type === 'file') {
    return <FileProperties field={field as FileField} onChange={onChange} />;
  }

  return null;
});

PropertiesEditor.displayName = 'PropertiesEditor';
