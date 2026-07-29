import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { FormBuilderActions, FormMode } from '@parama-dev/form-builder-core';
import type { FormField, ValidationState } from '@parama-dev/form-builder-types';
import { useMemo } from 'react';

/** Stable fallback so the selector never returns a fresh object. */
const PRISTINE_VALIDATION: ValidationState = { isValid: true, isPending: false, messages: [], lastValidated: 0 };

export interface FieldFlags {
  isVisible: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
}

/**
 * Reads a field's derived interaction flags from the workflow engine.
 *
 * Each flag is selected individually so a field re-renders only when *its own*
 * state changes — subscribing to the whole store instead would re-render every
 * field on every keystroke anywhere in the form.
 *
 * In editor mode conditions are not applied: fields always render, enabled and
 * writable, so the author can see and edit them.
 */
export function useFieldFlags(field: FormField): FieldFlags {
  const isEditor = useFormBuilder((state) => state.mode === 'editor');
  const isHidden = useFormBuilder((state) => !state.visibleFields.has(field.id));
  const isConditionallyDisabled = useFormBuilder((state) => state.disabledFields.has(field.id));
  const isConditionallyReadOnly = useFormBuilder((state) => state.readOnlyFields.has(field.id));

  const isRequired = useMemo(
    () => ('validations' in field ? Boolean(field.validations?.some((rule) => rule.type === 'required')) : false),
    [field]
  );

  return {
    isVisible: isEditor || !isHidden,
    isDisabled: isEditor ? false : isConditionallyDisabled,
    isReadOnly: isEditor ? false : isConditionallyReadOnly,
    isRequired
  };
}

/** Subscribes to one field's validation state, falling back to pristine. */
export function useFieldValidation(fieldId: string): ValidationState {
  return useFormBuilder((state) => state.validation[fieldId]) ?? PRISTINE_VALIDATION;
}

/** Subscribes to the store's action bag. The reference is stable for the store's lifetime. */
export function useFormActions(): FormBuilderActions {
  return useFormBuilder((state) => state.actions);
}

/** Subscribes to the current editor/render mode. */
export function useFormMode(): FormMode {
  return useFormBuilder((state) => state.mode);
}
