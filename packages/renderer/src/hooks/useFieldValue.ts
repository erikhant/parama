import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { FileField, FormField } from '@parama-dev/form-builder-types';

/**
 * Subscribes to one field's current value.
 *
 * Values live in two places: file fields keep their `File` objects in a
 * `FormData` container keyed by field *name*, everything else keeps a plain
 * value keyed by field *id*. This hook hides that split and, critically,
 * subscribes narrowly — a field re-renders when its own value changes, not when
 * any field in the form does.
 *
 * @returns The stored value, falling back to the field's `defaultValue`.
 */
export function useFieldValue(field: FormField): any {
  const storedValue = useFormBuilder((state) => state.formData[field.id]);
  const fileData = useFormBuilder((state) => (field.type === 'file' ? state.fileData : undefined));

  if (field.type === 'file' && fileData) {
    const key = (field as FileField).name || field.id;
    const files: File[] = [];
    fileData.forEach((entry, entryKey) => {
      if (entryKey === key && entry instanceof File) files.push(entry);
    });

    if (files.length === 0) return undefined;
    return (field as FileField).options?.multiple ? files : files[0];
  }

  return storedValue ?? ('defaultValue' in field ? field.defaultValue : undefined);
}
