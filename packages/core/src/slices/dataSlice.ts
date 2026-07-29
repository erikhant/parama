import type { FieldGroupItem, FormField } from '@parama-dev/form-builder-types';
import { fetchFieldOptions } from '../services/externalData';
import { readFiles, toFileList, withFiles } from '../services/fileData';
import { mapResponseToOptions } from '../services/optionsMapper';
import { serializeById, serializeByNames, serializeValuesByName } from '../services/serializer';
import type { FormBuilderActions, SliceContext } from '../state/types';

type DataActions = Pick<
  FormBuilderActions,
  | 'updateFieldValue'
  | 'getFieldValue'
  | 'getFormData'
  | 'getFormDataByNames'
  | 'getFormValues'
  | 'getFormDataWithFiles'
  | 'resetForm'
  | 'refreshDynamicOptions'
  | 'refreshFieldOptions'
  | 'mapResponseToOptions'
  | 'submitForm'
>;

/**
 * Computes the next `fileData` for a file field assignment.
 *
 * An array assignment is authoritative: it replaces whatever the field held,
 * including replacing it with nothing. A single-file field keeps only the first
 * entry. This is the path `removeFileField` writes through, so an empty array
 * has to clear the field rather than be ignored.
 */
function applyFileValue(current: FormData, name: string, isMultiple: boolean, value: unknown): FormData {
  if (Array.isArray(value)) {
    const files = toFileList(value);
    return withFiles(current, name, isMultiple ? files : files.slice(0, 1));
  }

  if (value instanceof File) return withFiles(current, name, [value]);

  // A nullish assignment clears the field; anything else is not a file value.
  if (value === null || value === undefined) return withFiles(current, name, []);

  return current;
}

/**
 * Form values: reads, writes, serialisation and submission.
 *
 * File bytes live in `fileData` (keyed by field name); every other value lives
 * in `formData` (keyed by field id). `getFieldValue` hides that split from
 * callers.
 */
export function createDataSlice({ set, get, workflow }: SliceContext): DataActions {
  /** Builds the context that expression-aware services need. */
  const requestContext = () => ({
    variables: get().variables,
    formData: get().formData,
    resolveField: get().actions.getField
  });

  /** Builds the context the serialisers need. */
  const serializerContext = () => ({
    schema: get().schema,
    formData: get().formData,
    fileData: get().fileData,
    resolveField: get().actions.getField
  });

  return {
    /**
     * Writes a field's value and lets the workflow engine cascade the change to
     * dependent conditions, validations and events.
     */
    updateFieldValue: (fieldId, value) => {
      const field = get().actions.getField(fieldId);

      if (field?.type === 'file') {
        const isMultiple = field.options?.multiple ?? false;
        set((state) => ({
          fileData: applyFileValue(state.fileData, field.name, isMultiple, value)
        }));
      } else {
        set((state) => ({ formData: { ...state.formData, [fieldId]: value } }));
      }

      workflow.processFieldChange(fieldId);
    },

    /**
     * Reads a field's current value.
     *
     * @returns For file fields, a `File` (single) or `File[]` (multiple), or
     *          `undefined` when none are selected. For every other field, the
     *          stored value falling back to `defaultValue`.
     */
    getFieldValue: (id) => {
      const field = get().actions.getField(id);
      if (!field) return undefined;

      if (field.type === 'file') {
        const files = readFiles(get().fileData, field.name || field.id);
        if (files.length === 0) return undefined;
        return field.options?.multiple ? files : files[0];
      }

      return get().formData[field.id] ?? ('defaultValue' in field ? field.defaultValue : undefined);
    },

    /** Current values keyed by field id; a `FormData` when files are present. */
    getFormData: () => serializeById(get().formData, get().fileData),

    /** Current values keyed by field name, with transformers applied. */
    getFormDataByNames: () => serializeByNames(serializerContext()),

    /** Current values keyed by field name, always as a plain object. */
    getFormValues: () => serializeValuesByName(serializerContext()),

    /** Raw value map and file container, unmerged. */
    getFormDataWithFiles: () => ({ data: get().formData, files: get().fileData }),

    /** Clears all values, files, validation state and errors; keeps the schema. */
    resetForm: () => {
      set((state) => ({
        schema: { ...state.schema, fields: state.schema.fields.map((f) => ({ ...f, value: undefined })) },
        formData: {},
        fileData: new FormData()
      }));

      get().actions.clearValidation();
      get().actions.clearErrors();
    },

    /**
     * Loads a field's options from its configured external source.
     *
     * Failures are reported through the field's `error` and resolve to an empty
     * list, so option loading never rejects into a caller's render path.
     */
    refreshDynamicOptions: async (field: FormField): Promise<FieldGroupItem[]> => {
      const result = await fetchFieldOptions(field, requestContext());

      if (!result.ok) {
        get().actions.setFieldError(field.id, result.error);
        return [];
      }

      get().actions.clearFieldError(field.id);
      return result.options;
    },

    /** Refreshes options for a field addressed by id. */
    refreshFieldOptions: async (fieldId) => {
      const field = get().actions.getField(fieldId);
      if (!field) return;
      await get().actions.refreshDynamicOptions(field);
    },

    mapResponseToOptions,

    /**
     * Validates the whole form and packages it for submission.
     * @returns Validity plus the payload and the content type it implies.
     */
    submitForm: async () => {
      const isValid = await get().actions.validateForm();
      const data = get().actions.getFormDataByNames();

      return {
        isValid,
        data,
        contentType: data instanceof FormData ? 'multipart/form-data' : 'application/json'
      };
    }
  };
}
