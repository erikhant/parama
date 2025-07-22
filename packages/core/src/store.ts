import type {
  FormBuilderProps,
  FormField,
  FormSchema,
  FormTemplate,
  ValidationState,
  ValidationTrigger,
  ValidatorRegistry
} from '@parama-dev/form-builder-types';
import { debounce, DebouncedFunc } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { WorkflowEngine } from './workflow/engine';
import { evaluateValidations } from './validations/evaluate';

export interface FormBuilderState {
  // Core form state
  schema: FormSchema;
  formData: Record<string, any>;
  validators: ValidatorRegistry;
  selectedFieldId: string | null;
  // templates: FormTemplate[];
  mode: 'editor' | 'preview';
  screenSize: 'mobile' | 'tablet' | 'desktop';

  // Enhanced state properties
  validation: Record<string, ValidationState>;
  visibleFields: Set<string>;
  readOnlyFields: Set<string>;
  disabledFields: Set<string>;
  optionsCache: Record<string, any>;
  validationQueue: Set<string>;
  isProcessingQueue: boolean;
  debouncedValidators: Record<string, DebouncedFunc<(value: any) => Promise<boolean>>>;
  workflowEngine: WorkflowEngine | null;

  // All store actions
  actions: {
    updateLayout: (layout: FormSchema['layout']) => void;
    initialize: (props: FormBuilderProps) => void;

    // Editor mode actions
    addField: (field: FormField) => void;
    getField: (id: string) => FormField | undefined;
    getFields: () => FormField[];
    getFieldValue: (id: string) => any | undefined;
    updateFields: (fields: FormField[]) => void;
    updateField: (id: string, updates: Partial<FormField>) => void;
    insertField: (index: number, field: FormField) => void;
    removeField: (id: string) => void;
    selectField: (id: string | null) => void;
    changeMode: (mode: 'editor' | 'preview') => void;
    changeScreenSize: (size: 'mobile' | 'tablet' | 'desktop') => void;

    // Data management
    updateFieldValue: (id: string, value: any) => void;
    getFormData: () => Record<string, any>;
    getFormDataByNames: () => Record<string, any>;
    resetForm: () => void;

    // Validation system
    validateField: (id: string, trigger?: ValidationTrigger) => Promise<boolean>;
    validateForm: () => Promise<boolean>;
    getFieldValidation: (id: string) => ValidationState;
    clearValidation: (id?: string) => void;
    setFieldError: (fieldId: string, error: string) => void;
    clearFieldError: (fieldId: string) => void;
    clearErrors: () => void;

    // Conditional logic
    refreshFieldOptions: (fieldId: string) => Promise<void>;

    // applyTemplate: (templateId: string) => void;
    submitForm: () => Promise<{ isValid: boolean; data: Record<string, any> }>;
  };
}

/**
 * Default empty form schema
 */
export const defaultSchema: FormSchema = {
  id: uuid(),
  version: '1.0.0',
  title: 'Untitled Form',
  description: 'Not provided',
  layout: { colSize: 12, gap: 4 },
  fields: []
};

/**
 * Main form builder store creation
 */
export const useFormBuilder = create<FormBuilderState>((set, get) => {
  // Initialize workflow engine
  const workflowEngine = new WorkflowEngine({
    getState: get,
    setState: set,
    debounceWait: 150
  });

  return {
    // Initial state
    schema: defaultSchema,
    formData: {},
    validators: {},
    templates: [],
    selectedFieldId: null,
    mode: 'editor',
    screenSize: 'desktop',

    // Enhanced state
    validation: {},
    visibleFields: new Set(),
    readOnlyFields: new Set(),
    disabledFields: new Set(),
    optionsCache: {},
    validationQueue: new Set(),
    isProcessingQueue: false,
    debouncedValidators: {},
    workflowEngine,
    needsConditionEval: new Set(),

    // All store actions
    actions: {
      /**
       * Initializes the form with schema, validators, and initial data
       * @param props - Form builder initialization properties
       */
      initialize: ({ schema, validators = {}, data = {} }) => {
        set({
          schema: schema || defaultSchema,
          formData: data,
          validators,
          visibleFields: new Set(schema?.fields.map((f) => f.id) || []),
          validation:
            schema?.fields.reduce(
              (acc, field) => {
                acc[field.id] = {
                  isValid: true,
                  isPending: false,
                  messages: [],
                  lastValidated: 0
                };
                return acc;
              },
              {} as Record<string, ValidationState>
            ) || {}
        });

        // Register all field dependencies
        schema.fields.forEach((field) => {
          workflowEngine.registerDependencies(field);
        });

        // Evaluate initial conditions after all fields are registered
        workflowEngine.evaluateConditions();
      },

      /**
       * Updates the form layout configuration
       * @param layout - New layout properties
       */
      updateLayout: (layout) => {
        set((state) => ({
          schema: {
            ...state.schema,
            layout: { ...state.schema.layout, ...layout }
          }
        }));
      },

      /**
       * Adds a new field to the form
       * @param field - Field to add
       * @note This ONLY used in the `editor` mode
       */
      addField: (field) => {
        set((state) => ({
          schema: {
            ...state.schema,
            fields: [...state.schema.fields, field]
          },
          // Initialize field visibility
          visibleFields: new Set([...state.visibleFields, field.id]),
          // Initialize validation state
          validation: {
            ...state.validation,
            [field.id]: {
              isValid: true,
              isPending: false,
              messages: [],
              lastValidated: 0
            }
          }
        }));
      },

      /**
       * Updates multiple fields at once
       * @param fields - Array of updated fields
       * @note This ONLY used in the `editor` mode
       */
      updateFields: (fields) => {
        // Clear states for updated fields
        set((state) => ({
          schema: {
            ...state.schema,
            fields
          },
          selectedFieldId: null
        }));
      },

      /**
       * Updates a specific field
       * @param id - Field ID to update
       * @param updates - Partial field updates
       * @note This ONLY used in the `editor` mode
       * @description
       * Updates a field's properties and re-evaluates conditions if necessary.
       * This method allows for partial updates to a field, such as changing its label,
       * type, or validations without affecting the entire schema.
       * It also ensures that any dependencies are re-registered and conditions are
       * re-evaluated to maintain the integrity of the form's logic.
       */
      updateField: (id, updates) => {
        set((state) => ({
          schema: {
            ...state.schema,
            fields: state.schema.fields.map((field) =>
              field.id === id ? ({ ...field, ...updates } as FormField) : field
            )
          }
        }));
        const field = get().actions.getField(id);
        if (field) {
          workflowEngine.registerDependencies(field);
          // Re-evaluate conditions for this field
          workflowEngine.evaluateDependentConditions(field);
        }
      },

      /**
       * Inserts a field at a specific position
       * @param index - Position to insert at
       * @param field - Field to insert
       * @note This ONLY used in the `editor` mode
       * @description
       * Inserts a new field into the form schema at the specified index.
       * This method allows for dynamic insertion of fields, such as when a user
       * wants to add a new field between existing ones. It updates the schema
       * and sets the newly inserted field as the selected field for immediate editing.
       */
      insertField: (index, field) => {
        set((state) => ({
          schema: {
            ...state.schema,
            fields: [...state.schema.fields.slice(0, index), field, ...state.schema.fields.slice(index)]
          },
          // Add field to visible fields
          visibleFields: new Set([...state.visibleFields, field.id]),
          // Initialize validation state
          validation: {
            ...state.validation,
            [field.id]: {
              isValid: true,
              isPending: false,
              messages: [],
              lastValidated: 0
            }
          },
          selectedFieldId: field.id
        }));
      },

      /**
       * Removes a field from the form
       * @param id - Field ID to remove
       * @note This ONLY used in the `editor` mode
       * @description
       * Removes a field from the form schema by its ID. This method also cleans up
       * any related validation state and visibility settings for the removed field.
       * It ensures that the form remains consistent and that any dependencies
       * related to the removed field are also cleaned up in the workflow engine.
       */
      removeField: (id) => {
        set((state) => ({
          schema: {
            ...state.schema,
            fields: state.schema.fields.filter((f) => f.id !== id)
          },
          // Clean up related state
          validation: Object.fromEntries(Object.entries(state.validation).filter(([key]) => key !== id)),
          visibleFields: new Set(Array.from(state.visibleFields).filter((fieldId) => fieldId !== id)),
          disabledFields: new Set(Array.from(state.disabledFields).filter((fieldId) => fieldId !== id))
        }));
        workflowEngine.removeField(id);
        workflowEngine.evaluateConditions();
      },

      /**
       * Gets a field by ID
       * @param id - Field ID to retrieve
       * @returns The field or undefined if not found
       */
      getField: (id) => {
        const byId = get().schema.fields.find((field) => field.id === id);
        if (!byId) {
          const byName = get().schema.fields.find((field) => 'name' in field && field.name === id);
          return byName;
        }
        return byId;
      },

      /**
       * Gets all fields in the form
       * @returns Array of all fields
       */
      getFields: () => get().schema.fields,

      getFieldValue: (id) => {
        const field = get().actions.getField(id);
        if (!field) return undefined;

        return get().formData[field.id] ?? ('defaultValue' in field ? field.defaultValue : undefined);
      },

      /**
       * Selects a field (for editing)
       * @param id - Field ID to select (null to deselect)
       */
      selectField: (id) => {
        set({ selectedFieldId: id });
      },

      /**
       * Changes the form mode (editor/preview)
       * @param mode - New mode to set
       */
      changeMode: (mode) => {
        set({ mode });
        // Reset selected field when switching to preview mode
        if (mode === 'preview') {
          set({ selectedFieldId: null });
        }
      },
      /**
       * Changes the screen size for responsive preview
       * @param size - New screen size to set
       */
      changeScreenSize: (size) => {
        set({ screenSize: size });
      },

      /**
       * Updates a field's value and triggers dependent updates
       * @param fieldId - Field ID to update
       * @param value - New field value
       */
      updateFieldValue: (fieldId, value) => {
        // Initialize debounced validator if not exists
        if (!get().debouncedValidators[fieldId]) {
          set((state) => ({
            debouncedValidators: {
              ...state.debouncedValidators,
              [fieldId]: debounce(() => get().actions.validateField(fieldId, 'change'), 300, {
                leading: false,
                trailing: true
              })
            }
          }));
        }

        set((state) => ({
          formData: { ...state.formData, [fieldId]: value }
        }));

        workflowEngine.processFieldChange(fieldId);
      },

      /**
       * Sets an error message for a specific field
       * @param fieldId - Field ID to set error for
       * @param error - Error message to set
       */
      setFieldError: (fieldId: string, error: string) => {
        set((state) => ({
          schema: {
            ...state.schema,
            fields: state.schema.fields.map((f) => (f.id === fieldId ? { ...f, error } : f))
          }
        }));
      },

      /**
       * Clears the error message for a specific field
       * @param fieldId - Field ID to clear error for
       */
      clearFieldError: (fieldId: string) => {
        set((state) => ({
          schema: {
            ...state.schema,
            fields: state.schema.fields.map((f) => (f.id === fieldId ? { ...f, error: undefined } : f))
          }
        }));
      },

      /**
       * Clears all error messages in the form
       */
      clearErrors: () => {
        set((state) => ({
          schema: {
            ...state.schema,
            fields: state.schema.fields.map((f) => ({ ...f, error: undefined }))
          }
        }));
      },

      /**
       * Validates a single field
       * @param fieldId - Field ID to validate
       * @param trigger - What triggered the validation
       * @returns Promise resolving to whether the field is valid
       */
      validateField: async (fieldId, trigger = 'change') => {
        const field = get().actions.getField(fieldId);
        if (!field || !('validations' in field) || !field.validations) return true;

        // Cancel any pending debounced validation
        if (get().debouncedValidators[fieldId]) {
          get().debouncedValidators[fieldId].cancel();
        }

        set((state) => ({
          validation: {
            ...state.validation,
            [fieldId]: {
              ...state.validation[fieldId],
              isPending: true
            }
          }
        }));

        const value = get().formData[fieldId] ?? ('defaultValue' in field ? field.defaultValue : undefined);
        const results = await Promise.all(
          field.validations
            .filter((rule: any) => !rule.trigger || rule.trigger === trigger)
            .map(async (rule: any) => {
              return await evaluateValidations(fieldId, rule, value, get().formData);
            })
        );

        // Eliminate 'true or undefined' results (no error)
        const messages = results.filter((r: any) => typeof r === 'string') as string[];
        const isValid = messages.length === 0;

        set((state) => ({
          validation: {
            ...state.validation,
            [fieldId]: {
              isValid,
              isPending: false,
              messages,
              lastValidated: Date.now()
            }
          }
        }));

        return isValid;
      },

      /**
       * Validates the entire form
       * @returns Promise resolving to whether the form is valid
       */
      validateForm: async () => {
        const validationResults = await Promise.all(
          get().schema.fields.map((field) => get().actions.validateField(field.id))
        );
        return validationResults.every((result) => result);
      },

      /**
       * Gets validation state for a field
       * @param id - Field ID
       * @returns Current validation state
       */
      getFieldValidation: (id) => {
        return (
          get().validation[id] || {
            isValid: true,
            isPending: false,
            messages: [],
            lastValidated: 0
          }
        );
      },

      /**
       * Clears validation state for a field or all fields
       * @param id - Field ID (optional - clears all if not provided)
       */
      clearValidation: (id) => {
        set((state) => ({
          validation: id
            ? Object.fromEntries(Object.entries(state.validation).filter(([key]) => key !== id))
            : Object.keys(state.validation).reduce(
                (acc, key) => {
                  acc[key] = {
                    isValid: true,
                    isPending: false,
                    messages: [],
                    lastValidated: 0
                  };
                  return acc;
                },
                {} as Record<string, ValidationState>
              )
        }));
      },

      /**
       * Refreshes dynamic options for a field
       * @param fieldId - Field ID to refresh
       */
      refreshFieldOptions: async (fieldId) => {
        const field = get().actions.getField(fieldId);
        if (!field) return;

        await workflowEngine.refreshDynamicOptions(field);
      },

      /**
       * Applies a template to the form
       * @param templateId - Template ID to apply
       */
      // applyTemplate: (templateId) => {
      //   const { templates } = get();
      //   const template = templates.find((t) => t.id === templateId);
      //   if (template) {
      //     set({
      //       schema: template.schema,
      //       formData: {},
      //       // Reset all enhanced state
      //       validation: {},
      //       visibleFields: new Set(template.schema.fields.map((f) => f.id)),
      //       disabledFields: new Set(),
      //       optionsCache: {}
      //     });
      //     template.schema.fields.forEach((field) => {
      //       workflowEngine.registerDependencies(field);
      //     });
      //   }
      // },

      /**
       * Resets form data while keeping schema
       */
      resetForm: () => {
        set((state) => ({
          ...state,
          formData: {}
        }));
        // Clear all validation states and errors
        get().actions.clearValidation();
        get().actions.clearErrors();
      },

      /**
       * Gets current form data
       * @returns Current form data with field IDs as keys
       */
      getFormData: () => {
        return get().formData;
      },

      /**
       * Gets current form data with field names as keys
       * @returns Current form data remapped to use field names instead of IDs
       */
      getFormDataByNames: () => {
        const formData = get().formData;
        const usedNames = new Set<string>();

        // Remap form data keys from field IDs to field names
        // Only include fields that have both name and data value
        return get().schema.fields.reduce(
          (acc, field) => {
            // Only process fields that have a name property (excluding ButtonField and BlockField)
            if ('name' in field && field.name) {
              const fieldValue = formData[field.id];
              if (fieldValue !== undefined) {
                // Handle duplicate field names by appending the field ID
                let fieldName = field.name;
                if (usedNames.has(fieldName)) {
                  fieldName = `${field.name}_${field.id}`;
                  console.warn(`Duplicate field name "${field.name}" found. Using "${fieldName}" instead.`);
                }
                usedNames.add(fieldName);
                acc[fieldName] = fieldValue;
              }
            }
            return acc;
          },
          {} as Record<string, any>
        );
      },

      /**
       * Submits the form with validation
       * @returns Promise with validation result and form data with field names as keys
       */
      submitForm: async () => {
        const isValid = await get().actions.validateForm();
        const remappedData = get().actions.getFormDataByNames();

        return {
          isValid,
          data: remappedData
        };
      }
    }
  };
});
