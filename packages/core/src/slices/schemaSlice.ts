import type { FormField } from '@parama-dev/form-builder-types';
import { logger } from '../logger';
import { withoutKey } from '../services/fileData';
import { pristineValidation } from '../services/validationState';
import type { FormBuilderActions, SliceContext } from '../state/types';

type SchemaActions = Pick<
  FormBuilderActions,
  | 'updateLayout'
  | 'addField'
  | 'insertField'
  | 'removeField'
  | 'updateField'
  | 'updateFields'
  | 'getField'
  | 'getFields'
  | 'setFieldError'
  | 'clearFieldError'
  | 'clearErrors'
>;

/**
 * Schema ownership: field CRUD, layout, and the per-field `error` string.
 *
 * Every mutating action here is editor-facing. Render mode reads the schema but
 * never reshapes it, apart from error reporting.
 */
export function createSchemaSlice({ set, get, workflow }: SliceContext): SchemaActions {
  /** Rewrites one field in place within the schema, preserving order. */
  const mapField = (id: string, project: (field: FormField) => FormField) =>
    set((state) => ({
      schema: {
        ...state.schema,
        fields: state.schema.fields.map((field) => (field.id === id ? project(field) : field))
      }
    }));

  return {
    /**
     * Updates the form layout configuration.
     * @note Editor mode only.
     */
    updateLayout: (layout) => {
      set((state) => ({
        schema: { ...state.schema, layout: { ...state.schema.layout, ...layout } }
      }));
    },

    /**
     * Appends a field to the form, seeding its visibility and validation state.
     * Duplicate ids are rejected so the schema stays a set.
     * @note Editor mode only.
     */
    addField: (field) => {
      if (get().schema.fields.some((f) => f.id === field.id)) {
        logger.warn(`Duplicate field id detected (addField): "${field.id}". Skipping addition.`);
        return;
      }

      set((state) => ({
        schema: { ...state.schema, fields: [...state.schema.fields, field] },
        visibleFields: new Set([...state.visibleFields, field.id]),
        validation: { ...state.validation, [field.id]: pristineValidation() }
      }));
    },

    /**
     * Inserts a field at `index` and selects it for immediate editing.
     * @note Editor mode only.
     */
    insertField: (index, field) => {
      if (get().schema.fields.some((f) => f.id === field.id)) {
        logger.warn(`Duplicate field id detected (insertField): "${field.id}". Skipping insertion.`);
        return;
      }

      set((state) => ({
        schema: {
          ...state.schema,
          fields: [...state.schema.fields.slice(0, index), field, ...state.schema.fields.slice(index)]
        },
        visibleFields: new Set([...state.visibleFields, field.id]),
        validation: { ...state.validation, [field.id]: pristineValidation() },
        selectedFieldId: field.id
      }));
    },

    /**
     * Removes a field and every piece of state keyed to it — validation,
     * visibility, disabled flag, uploaded files and graph edges.
     * @note Editor mode only.
     */
    removeField: (id) => {
      const field = get().actions.getField(id);
      const isFileField = field?.type === 'file';

      set((state) => ({
        schema: { ...state.schema, fields: state.schema.fields.filter((f) => f.id !== id) },
        fileData: isFileField ? withoutKey(state.fileData, field.name || field.id) : state.fileData,
        validation: Object.fromEntries(Object.entries(state.validation).filter(([key]) => key !== id)),
        visibleFields: new Set([...state.visibleFields].filter((fieldId) => fieldId !== id)),
        disabledFields: new Set([...state.disabledFields].filter((fieldId) => fieldId !== id))
      }));

      workflow.removeField(id);
      workflow.evaluateConditions();
    },

    /**
     * Applies a partial update to one field, then re-registers its dependencies
     * and re-evaluates the conditions that reference it.
     * @note Editor mode only.
     */
    updateField: (id, updates) => {
      mapField(id, (field) => ({ ...field, ...updates }) as FormField);

      const field = get().actions.getField(id);
      if (!field) return;

      workflow.registerDependencies(field);
      workflow.evaluateDependentConditions(field);
    },

    /**
     * Replaces the whole field list and clears the selection.
     * @note Editor mode only.
     */
    updateFields: (fields) => {
      set((state) => ({ schema: { ...state.schema, fields }, selectedFieldId: null }));
    },

    /** Finds a field by id, falling back to a lookup by `name`. */
    getField: (id) => {
      const fields = get().schema.fields;
      return fields.find((field) => field.id === id) ?? fields.find((field) => 'name' in field && field.name === id);
    },

    getFields: () => get().schema.fields,

    /** Attaches an error message to a field. */
    setFieldError: (fieldId, error) => mapField(fieldId, (field) => ({ ...field, error })),

    /** Clears one field's error message. */
    clearFieldError: (fieldId) => mapField(fieldId, (field) => ({ ...field, error: undefined })),

    /** Clears every field error in the form. */
    clearErrors: () => {
      set((state) => ({
        schema: { ...state.schema, fields: state.schema.fields.map((f) => ({ ...f, error: undefined })) }
      }));
    }
  };
}
