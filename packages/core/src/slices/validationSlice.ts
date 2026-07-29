import type { FormField, ValidationRule, ValidationState, ValidationTrigger } from '@parama-dev/form-builder-types';
import { pristineValidation } from '../services/validationState';
import type { FormBuilderActions, GetState, SliceContext } from '../state/types';
import { evaluateValidations } from '../validations/evaluate';

type ValidationActions = Pick<
  FormBuilderActions,
  'validateField' | 'validateForm' | 'getFieldValidation' | 'clearValidation'
>;

/** A field that can carry validation rules. */
type ValidatableField = FormField & { validations: ValidationRule[] };

function hasValidations(field: FormField | undefined): field is ValidatableField {
  return Boolean(field && 'validations' in field && field.validations);
}

/**
 * Resolves the value handed to the rule evaluator.
 *
 * File fields have no comparable primitive value, so they are represented by a
 * sparse array whose length is the total file count (new uploads plus files
 * already on the server). That lets the shared `required`, `minSelected` and
 * `maxSelected` rules work unchanged.
 */
function resolveValueForValidation(field: ValidatableField, get: GetState): any {
  if (field.type !== 'file') {
    return get().formData[field.id] ?? ('defaultValue' in field ? field.defaultValue : undefined);
  }

  const newFiles = get().actions.getFieldFiles(field.id).length;
  const existingFiles = get().actions.getExistingFiles(field.id).length;
  return Array.from({ length: newFiles + existingFiles });
}

/**
 * Validation state: per-field results and whole-form checks.
 *
 * Rules are filtered by trigger, evaluated concurrently, and reduced to a
 * message list; an empty list means valid.
 */
export function createValidationSlice({ set, get }: SliceContext): ValidationActions {
  /** Merges a patch into one field's validation state. */
  const patchValidation = (fieldId: string, patch: Partial<ValidationState>) =>
    set((state) => ({
      validation: {
        ...state.validation,
        [fieldId]: { ...(state.validation[fieldId] ?? pristineValidation()), ...patch }
      }
    }));

  return {
    /**
     * Validates one field against the rules matching `trigger`.
     *
     * @param fieldId - Field to validate
     * @param trigger - Only rules with this trigger (or no trigger) are run
     * @returns Whether the field passed. Fields without rules always pass.
     */
    validateField: async (fieldId, trigger: ValidationTrigger = 'change') => {
      const field = get().actions.getField(fieldId);
      if (!hasValidations(field)) return true;

      patchValidation(fieldId, { isPending: true });

      const value = resolveValueForValidation(field, get);
      const applicableRules = field.validations.filter((rule) => !rule.trigger || rule.trigger === trigger);

      const results = await Promise.all(
        applicableRules.map((rule) => evaluateValidations(fieldId, rule, value, get().formData))
      );

      // The evaluator returns `true` when a rule passes and the message string
      // when it fails, so the strings are exactly the failures.
      const messages = results.filter((result): result is string => typeof result === 'string');
      const isValid = messages.length === 0;

      set((state) => ({
        validation: {
          ...state.validation,
          [fieldId]: { isValid, isPending: false, messages, lastValidated: Date.now() }
        }
      }));

      return isValid;
    },

    /**
     * Validates every field in the schema concurrently.
     * @returns Whether all fields passed.
     */
    validateForm: async () => {
      const results = await Promise.all(get().schema.fields.map((field) => get().actions.validateField(field.id)));
      return results.every(Boolean);
    },

    /** Current validation state for a field; pristine if never validated. */
    getFieldValidation: (id) => get().validation[id] ?? pristineValidation(),

    /**
     * Resets validation state.
     * @param id - Field to drop from the map; omit to reset every field to pristine.
     */
    clearValidation: (id) => {
      set((state) => ({
        validation: id
          ? Object.fromEntries(Object.entries(state.validation).filter(([key]) => key !== id))
          : Object.fromEntries(Object.keys(state.validation).map((key) => [key, pristineValidation()]))
      }));
    }
  };
}
