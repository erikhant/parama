import type { FormField, FormSchema } from '@parama-dev/form-builder-types';
import { useFormBuilder } from '../store';
import { defaultSchema } from '../state/defaultSchema';

/**
 * Test helpers for the form builder store.
 *
 * The store is a module singleton, so state survives between tests in the same
 * file. Call {@link resetFormBuilder} in `beforeEach` to get a clean slate.
 */

/** Restores the store to its post-construction state. */
export function resetFormBuilder(): void {
  useFormBuilder.setState({
    schema: defaultSchema,
    formData: {},
    fileData: new FormData(),
    existingFiles: {},
    validators: {},
    variables: {},
    selectedFieldId: null,
    mode: 'render',
    screenSize: 'desktop',
    initRevision: 0,
    validation: {},
    visibleFields: new Set<string>(),
    readOnlyFields: new Set<string>(),
    disabledFields: new Set<string>(),
    formState: { isSubmitting: false }
  });
}

/** Reads the store's action bag outside React. */
export const storeActions = () => useFormBuilder.getState().actions;

/** Reads a snapshot of store state outside React. */
export const storeState = () => useFormBuilder.getState();

let sequence = 0;

/**
 * Builds a schema from partial field definitions, filling in the required
 * scaffolding (`id`, `name`, `label`, `width`) so tests only state what matters.
 */
export function buildSchema(fields: Array<Partial<FormField> & { type: string }>): FormSchema {
  return {
    id: 'schema-under-test',
    version: '1.0.0',
    title: 'Test Form',
    layout: { colSize: 12, gap: 4 },
    fields: fields.map((field) => {
      sequence += 1;
      const id = field.id ?? `field-${sequence}`;
      return {
        id,
        name: id,
        label: `Label ${id}`,
        width: 12,
        value: undefined,
        ...field
      } as FormField;
    })
  };
}
