import type { DateField, FormField, TextField } from '@parama-dev/form-builder-types';
import { memo } from 'react';
import { DateAppearance } from './sections/DateAppearance';
import { TextAppearance } from './sections/TextAppearance';
import { TextareaAppearance } from './sections/TextareaAppearance';

type AppearanceEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

/** Single-line inputs that share the prefix/suffix/add-on decoration slots. */
const DECORATED_TEXT_TYPES = new Set<FormField['type']>(['text', 'email', 'number', 'password']);

/**
 * Routes a field to the appearance panel that styles it.
 *
 * Only three field families expose appearance settings at all; the rest render
 * nothing. Splitting them apart means the date panel no longer sits behind 440
 * lines of text-decoration markup.
 */
export const AppearanceEditor = memo<AppearanceEditorProps>(({ field, onChange }) => {
  if (DECORATED_TEXT_TYPES.has(field.type)) {
    return <TextAppearance field={field as TextField} onChange={onChange} />;
  }

  if (field.type === 'textarea') {
    return <TextareaAppearance field={field as TextField} onChange={onChange} />;
  }

  if (field.type === 'date') {
    return <DateAppearance field={field as DateField} onChange={onChange} />;
  }

  return null;
});

AppearanceEditor.displayName = 'AppearanceEditor';
