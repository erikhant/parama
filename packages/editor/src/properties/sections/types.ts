import type { FormField } from '@parama-dev/form-builder-types';

/**
 * The contract every properties section implements.
 *
 * Sections are presentational: they read the field they are given and report
 * changes upward. The panel owns the debounced write into the store, so a
 * section never talks to it directly.
 */
export interface SectionProps<TField extends FormField = FormField> {
  field: TField;
  onChange: (updates: Partial<FormField>) => void;
}
