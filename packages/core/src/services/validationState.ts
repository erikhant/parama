import type { FormField, ValidationState } from '@parama-dev/form-builder-types';

/** A freshly initialised, passing validation state. */
export function pristineValidation(): ValidationState {
  return { isValid: true, isPending: false, messages: [], lastValidated: 0 };
}

/** Builds a pristine validation map covering every field in `fields`. */
export function pristineValidationMap(fields: FormField[] = []): Record<string, ValidationState> {
  return fields.reduce<Record<string, ValidationState>>((acc, field) => {
    acc[field.id] = pristineValidation();
    return acc;
  }, {});
}
