import type {
  FormBuilderProps,
  FormField,
  FormSchema,
  FormTemplate,
  ValidatorRegistry
} from '@form-builder/types';
import { create } from 'zustand';
import { runBasicValidations } from './validation';

interface FormBuilderState {
  schema: FormSchema;
  formData: Record<string, any>;
  validators: ValidatorRegistry;
  selectedFieldId: string | null;
  templates: FormTemplate[];
  actions: {
    initialize: (props: FormBuilderProps) => void;
    addField: (field: FormField) => void;
    getField: (id: string) => FormField | undefined;
    getFields: () => FormField[];
    updateFields: (fields: FormField[]) => void;
    updateField: (id: string, updates: Partial<FormField>) => void;
    insertField: (index: number, field: FormField) => void;
    removeField: (id: string) => void;
    selectField: (id: string | null) => void;
    updateFieldValue: (id: string, value: any) => void;
    validateField: (id: string) => Promise<boolean>;
    applyTemplate: (templateId: string) => void;
    resetForm: () => void;
    getFormData: () => Record<string, any>;
    submitForm: () => Promise<{ isValid: boolean; data: Record<string, any> }>;
  };
}

const defaultSchema: FormSchema = {
  title: 'Untitled Form',
  description: '',
  layout: { colSize: 12, gap: 4 },
  fields: []
};

export const useFormBuilder = create<FormBuilderState>((set, get) => ({
  schema: defaultSchema,
  formData: {},
  validators: {},
  templates: [],
  selectedFieldId: null,
  actions: {
    initialize: ({ schema, validators = {}, data = {}, templates = [] }) => {
      set({
        schema,
        formData: data,
        validators,
        templates
      });
    },
    addField: (field) =>
      set((state) => ({
        schema: {
          ...state.schema,
          fields: [...state.schema.fields, field]
        }
      })),
    updateFields: (fields) =>
      set((state) => ({
        schema: {
          ...state.schema,
          fields
        }
      })),
    updateField: (id, updates) => {
      set((state) => ({
        schema: {
          ...state.schema,
          fields: state.schema.fields.map((field) =>
            field.id === id ? ({ ...field, ...updates } as FormField) : field
          )
        }
      }));
    },
    insertField: (index, field) => {
      set((state) => ({
        schema: {
          ...state.schema,
          fields: [
            ...state.schema.fields.slice(0, index),
            field,
            ...state.schema.fields.slice(index)
          ]
        }
      }));
    },
    removeField: (id) => {
      set((state) => ({
        schema: {
          ...state.schema,
          fields: get().schema.fields.filter((f) => f.id !== id)
        }
      }));
    },
    getField: (id) => {
      return get().schema.fields.find((field) => field.id === id);
    },
    getFields: () => get().schema.fields,
    selectField: (id) => {
      set(() => ({
        selectedFieldId: id
      }));
    },
    updateFieldValue: (fieldId, value) => {
      set((state) => ({
        formData: { ...state.formData, [fieldId]: value }
      }));
      //get().actions.validateField(fieldId);
    },
    validateField: async (fieldId) => {
      const { schema, formData, validators } = get();
      const field = schema.fields.find((f) => f.id === fieldId);
      if (!field) return true;
      if (field.type == 'submit') return true;

      const value = formData[fieldId] ?? field.defaultValue;
      let error: string | undefined;

      // Run basic validations
      error = runBasicValidations(field, value);

      // Run custom validations if no basic error
      if (!error && field.validation?.custom) {
        for (const customValidation of field.validation.custom) {
          const validator = validators[customValidation.validator];
          if (validator) {
            // const fieldWithValue = {
            //   ...field,
            //   value,
            //   setError: (msg: string) => error = msg,
            //   validationConfig: customValidation
            // };

            const isValid = await validator({ ...field, value });
            if (!isValid && !error) {
              error = customValidation.message || 'Validation failed';
            }
          }
        }
      }
      // Update field error state
      set((state) => ({
        schema: {
          ...state.schema,
          fields: state.schema.fields.map((f) =>
            f.id === fieldId ? { ...f, error } : f
          )
        }
      }));

      return !error;
    },
    applyTemplate: (templateId) => {
      const { templates } = get();
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        set({ schema: template.schema, formData: {} });
      }
    },
    resetForm: () => {
      set({ formData: {} });
    },
    getFormData: () => {
      return get().formData;
    },
    submitForm: async () => {
      const { schema, formData } = get();
      const validationResults = await Promise.all(
        schema.fields.map((field) => get().actions.validateField(field.id))
      );
      const isValid = validationResults.every((result) => result);

      return {
        isValid,
        data: formData
      };
    }
  }
}));
