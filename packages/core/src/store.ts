import type {
  ExternalDataSource,
  FieldGroupItem,
  FormBuilderProps,
  FormField,
  FormSchema,
  ValidationState,
  ValidationTrigger,
  ValidatorRegistry,
  VariableContext
} from '@parama-dev/form-builder-types';
import { debounce, DebouncedFunc, get as getObject } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { WorkflowEngine } from './workflow/engine';
import { evaluateValidations } from './validations/evaluate';
import { interceptExpressionTemplate, interpolate, interpolateVariables, resolveInterpolatableValue } from './utils';

export interface FormBuilderState {
  // Core form state
  schema: FormSchema;
  formData: Record<string, any>;
  fileData: FormData; // File storage using FormData
  validators: ValidatorRegistry;
  variables: VariableContext;
  selectedFieldId: string | null;
  mode: 'editor' | 'render';
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
    changeMode: (mode: 'editor' | 'render') => void;
    changeScreenSize: (size: 'mobile' | 'tablet' | 'desktop') => void;

    // Data management
    updateFieldValue: (id: string, value: any) => void;
    refreshDynamicOptions: (field: FormField) => Promise<FieldGroupItem[]>;
    mapResponseToOptions: (data: any, mapper: any) => FieldGroupItem[];
    getFormData: () => Record<string, any> | FormData;
    getFormDataByNames: () => Record<string, any> | FormData;
    getFieldFiles: (fieldId: string) => File[];
    getFormDataWithFiles: () => { data: Record<string, any>; files: FormData };
    addFileField: (fieldId: string, file: File) => boolean;
    removeFileField: (fieldId: string, fileIndex: number) => boolean;
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

    // Variable management
    updateVariables: (variables: VariableContext) => void;
    updateVariable: (key: string, value: any) => void;
    getVariable: (key: string) => any;
    getVariables: () => VariableContext;
    resolveFieldValue: (field: FormField, property: keyof FormField) => any;

    // applyTemplate: (templateId: string) => void;
    submitForm: () => Promise<{
      isValid: boolean;
      data: Record<string, any> | FormData;
      contentType: 'application/json' | 'multipart/form-data';
    }>;
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
    fileData: new FormData(),
    validators: {},
    variables: {},
    templates: [],
    selectedFieldId: null,
    mode: 'render',
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
      initialize: ({ schema, validators = {}, data = {}, variables = {} }) => {
        // Ensure variables is always an object to prevent undefined issues
        const safeVariables = variables || {};
        // Extract initial values from schema fields if no explicit data provided
        let initialFormData = data;
        if (Object.keys(data).length === 0 && schema?.fields) {
          initialFormData = schema.fields.reduce(
            (acc, field) => {
              if ('value' in field && field.value !== undefined) {
                acc[field.id] = field.value;
              } else if ('defaultValue' in field && field.defaultValue !== undefined) {
                acc[field.id] = field.defaultValue;
              }
              return acc;
            },
            {} as Record<string, any>
          );
        }

        set({
          schema: schema || defaultSchema,
          formData: initialFormData,
          validators,
          variables: safeVariables,
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
        const field = get().actions.getField(id);
        const newFileData = new FormData();

        if (field && field.type === 'file') {
          // Remove file data for file fields
          const currentFileData = get().fileData;
          const fieldName = field.name || field.id;

          // Create new FormData and copy existing entries except current field
          for (const [key, value] of currentFileData.entries()) {
            if (key !== fieldName) {
              newFileData.append(key, value);
            }
          }
        }
        set((state) => ({
          schema: {
            ...state.schema,
            fields: state.schema.fields.filter((f) => f.id !== id)
          },
          fileData: field?.type === 'file' ? newFileData : state.fileData,
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

        if (field.type === 'file') {
          // Get files from FormData
          const fieldName = field.name || field.id;
          const isMultiple = field.options?.multiple || false;
          const files: File[] = [];

          for (const [key, value] of get().fileData.entries()) {
            if (key === fieldName && value instanceof File) {
              files.push(value);
            }
          }

          if (files.length === 0) {
            return undefined;
          } else if (isMultiple) {
            // Return array for multiple files
            return files;
          } else {
            // Return single file for non-multiple fields
            return files[0];
          }
        } else {
          // Get regular field value
          return get().formData[field.id] ?? ('defaultValue' in field ? field.defaultValue : undefined);
        }
      },

      /**
       * Selects a field (for editing)
       * @param id - Field ID to select (null to deselect)
       */
      selectField: (id) => {
        set({ selectedFieldId: id });
      },

      /**
       * Changes the form mode (editor/render)
       * @param mode - New mode to set
       */
      changeMode: (mode) => {
        set({ mode });
        // Reset selected field when switching to render mode
        if (mode === 'render') {
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
        const field = get().actions.getField(fieldId);

        if (field?.type === 'file') {
          const currentFileData = get().fileData;
          const fieldName = field.name;
          const isMultiple = field.options?.multiple || false;

          // Add new files based on multiple option
          if (Array.isArray(value)) {
            if (isMultiple) {
              currentFileData.delete(fieldName); // Clear existing files
              value.forEach((file: File) => {
                currentFileData.append(fieldName, file);
              });
            } else {
              // Single file only - take the first file
              const firstFile = value[0];
              if (firstFile) {
                currentFileData.set(fieldName, firstFile);
              }
            }
          } else if (value instanceof File) {
            // Single file provided
            currentFileData.set(fieldName, value);
          }

          set((state) => ({ ...state, fileData: currentFileData }));
        } else {
          // Handle regular fields - store in formData
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
        }

        workflowEngine.processFieldChange(fieldId);
      },

      /**
       * Refreshes dynamic options for a field
       * @param field Form field to refresh
       */
      async refreshDynamicOptions(field: FormField): Promise<FieldGroupItem[]> {
        const formData = get().formData;

        if (
          (field.type !== 'select' && field.type !== 'multiselect' && field.type !== 'autocomplete') ||
          !field.external
        ) {
          return [];
        }
        const { url, headers, mapper } = field.external;

        try {
          // Resolve URL if it's a VariableReference
          const resolvedUrl = resolveInterpolatableValue(url, get().variables);
          const interceptedExpression = interceptExpressionTemplate(resolvedUrl, get());
          const serializedUrl = interpolate(interceptedExpression, formData).replace(/"/g, '');

          // Resolve headers if they contain variable references
          const resolvedHeaders = headers ? resolveInterpolatableValue(headers, get().variables) : {};

          const response = await fetch(serializedUrl, {
            headers: { ...resolvedHeaders }
          });

          if (!response.ok) {
            get().actions.setFieldError(field.id, `Failed to load options: ${response.statusText}`);
            return [];
          }

          const data = await response.json();
          const mappedOptions = get().actions.mapResponseToOptions(data, mapper);

          // Clear any previous errors
          get().actions.clearFieldError(field.id);

          return mappedOptions;
        } catch (error) {
          get().actions.setFieldError(
            field.id,
            `Error loading options: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
          return [];
        }
      },

      /**
       * Maps API response to FieldGroupItem format with flexible structure handling
       * @param data API response data
       * @param mapper Mapping configuration
       * @returns Array of mapped options
       */
      mapResponseToOptions: (data: any, mapper: ExternalDataSource<FieldGroupItem>['mapper']): FieldGroupItem[] => {
        try {
          // Extract the data source based on mapper configuration
          let sourceData = data;

          // If dataSource is provided, try to extract nested data
          if (mapper?.dataSource) {
            sourceData = getObject(data, mapper?.dataSource, data);
          }

          // Ensure we have an array to work with
          if (!Array.isArray(sourceData)) {
            console.warn('Response data is not an array, wrapping in array');
            sourceData = [sourceData];
          }

          return sourceData.map((item: any, index: number): FieldGroupItem => {
            // Handle different response structures
            if (typeof item === 'string') {
              return {
                id: uuid(),
                label: item,
                value: item
              } as FieldGroupItem;
            } else if (typeof item === 'object' && item !== null) {
              // Case: Object with properties
              const mappedItem: FieldGroupItem = {
                id: uuid(),
                label: '',
                value: ''
              };

              // Use mapper configuration if available
              if (mapper?.dataMapper) {
                mappedItem.id = getObject(item, mapper!.dataMapper.id) || uuid();
                mappedItem.label =
                  getObject(item, mapper!.dataMapper.label) ||
                  getObject(item, mapper!.dataMapper.value) ||
                  `Option ${index + 1}`;
                mappedItem.value =
                  getObject(item, mapper!.dataMapper.value) ||
                  getObject(item, mapper!.dataMapper.id) ||
                  `option-${index}`;
              } else {
                // Auto-detect common property names
                const id = item.id || item.key || item.value || index;
                const label =
                  item.label ||
                  item.name ||
                  item.title ||
                  item.text ||
                  item.display ||
                  item.id ||
                  item.key ||
                  item.value ||
                  `Option ${index + 1}`;
                const value = item.value || item.id || item.key || item.name || index;

                mappedItem.id = String(id);
                mappedItem.label = String(label);
                mappedItem.value = String(value);
              }

              return mappedItem;
            } else {
              // Fallback for primitive values (numbers, booleans, etc.)
              return {
                id: uuid(),
                label: String(item),
                value: String(item)
              };
            }
          });
        } catch (error) {
          console.error('Error mapping response to options:', error);
          return [];
        }
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

        await get().actions.refreshDynamicOptions(field);
      },

      /**
       * Resets form data while keeping schema
       */
      resetForm: () => {
        set((state) => ({
          ...state,
          formData: {},
          fileData: new FormData() // Clear file data
        }));
        // Clear all validation states and errors
        get().actions.clearValidation();
        get().actions.clearErrors();
      },

      /**
       * Gets current form data
       * @returns Current form data with field IDs as keys - FormData if files exist, otherwise JSON
       */
      getFormData: () => {
        const formData = get().formData;
        const fileData = get().fileData;

        // Check if FormData has any entries
        const hasFiles = Array.from(fileData.keys()).length > 0;

        if (hasFiles) {
          // Create new FormData and merge both
          const mergedData = new FormData();

          // Add regular form data
          Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              mergedData.append(key, String(value));
            }
          });

          // Add file data (files are already in FormData)
          for (const [key, value] of fileData.entries()) {
            mergedData.append(key, value);
          }

          return mergedData;
        } else {
          // Return JSON object for non-file forms
          return formData;
        }
      },

      /**
       * Gets current form data with field names as keys
       * @returns Current form data remapped to use field names instead of IDs - FormData if files exist, otherwise JSON
       */
      getFormDataByNames: () => {
        const formData = get().formData;
        const fileData = get().fileData;
        const schema = get().schema;
        const usedNames = new Set<string>();

        // Check if we have files
        const hasFiles = Array.from(fileData.entries()).length > 0;

        if (hasFiles) {
          const mergedData = new FormData();

          // Process each field in schema order
          schema.fields.forEach((field) => {
            if ('name' in field && field.name) {
              let fieldName = field.name;

              // Handle duplicate names
              if (usedNames.has(fieldName)) {
                fieldName = `${field.name}_${field.id}`;
                console.warn(`Duplicate field name "${field.name}" found. Using "${fieldName}" instead.`);
              }
              usedNames.add(fieldName);

              if (field.type === 'file') {
                // Copy files for this field from fileData
                const storedFieldName = field.name;
                let filesFound = 0;
                for (const [key, value] of fileData.entries()) {
                  if (key === storedFieldName) {
                    mergedData.append(fieldName, value);
                    filesFound++;
                  }
                }
              } else {
                const fieldValue = formData[field.id];
                if (fieldValue !== undefined) {
                  // Apply transformer if exists
                  if ('transformer' in field && field.transformer) {
                    const interceptedTemplate = interceptExpressionTemplate(field.transformer, get());
                    const transformedValue = interpolate(interceptedTemplate, formData);
                    mergedData.append(fieldName, JSON.stringify(transformedValue));
                  } else {
                    mergedData.append(fieldName, JSON.stringify(fieldValue));
                  }
                }
              }
            }
          });

          return mergedData;
        } else {
          // Return JSON object using existing logic for non-file forms
          return schema.fields.reduce(
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
                  if ('transformer' in field && field.transformer) {
                    const interceptedTemplate = interceptExpressionTemplate(field.transformer, get());
                    const dataTransform = interpolate(interceptedTemplate, formData);
                    acc[fieldName] = dataTransform;
                  } else {
                    acc[fieldName] = fieldValue;
                  }
                }
              }
              return acc;
            },
            {} as Record<string, any>
          );
        }
      },

      /**
       * Submits the form with validation
       * @returns Promise with validation result and form data with field names as keys
       */
      submitForm: async () => {
        const isValid = await get().actions.validateForm();
        const data = get().actions.getFormDataByNames();
        // Determine content type based on data type
        const contentType = data instanceof FormData ? 'multipart/form-data' : 'application/json';

        return {
          isValid,
          data,
          contentType
        };
      },

      /**
       * Gets files for a specific field
       * @param fieldId - Field ID to get files for
       * @returns Array of File objects for the field
       */
      getFieldFiles: (fieldId: string) => {
        const field = get().actions.getField(fieldId);
        if (!field || field.type !== 'file') return [];

        const fieldName = field.name;
        const files: File[] = [];

        for (const [key, value] of get().fileData.entries()) {
          if (key === fieldName && value instanceof File) {
            files.push(value);
          }
        }

        return files;
      },

      /**
       * Adds a file to a file field (respects multiple option)
       * @param fieldId - Field ID to add file to
       * @param file - File to add
       * @returns Whether the file was added successfully
       */
      addFileField: (fieldId: string, file: File) => {
        const field = get().actions.getField(fieldId);
        if (!field || field.type !== 'file') return false;

        const currentFiles = get().actions.getFieldFiles(fieldId);
        const isMultiple = field.options?.multiple || false;
        const maxFiles = field.options?.maxFiles;

        if (!isMultiple && currentFiles.length > 0) {
          // Replace existing file for single file fields
          get().actions.updateFieldValue(fieldId, [file]);
        } else if (isMultiple) {
          // Add to existing files for multiple file fields
          const newFiles = [...currentFiles, file];

          // Respect maxFiles limit
          if (maxFiles && newFiles.length > maxFiles) {
            console.warn(`Maximum files limit (${maxFiles}) exceeded for field ${fieldId}`);
            return false;
          }

          get().actions.updateFieldValue(fieldId, newFiles);
        } else {
          // Set as first file
          get().actions.updateFieldValue(fieldId, [file]);
        }

        return true;
      },

      /**
       * Removes a file from a file field
       * @param fieldId - Field ID to remove file from
       * @param fileIndex - Index of file to remove
       * @returns Whether the file was removed successfully
       */
      removeFileField: (fieldId: string, fileIndex: number) => {
        const field = get().actions.getField(fieldId);
        if (!field || field.type !== 'file') return false;

        const currentFiles = get().actions.getFieldFiles(fieldId);

        if (fileIndex < 0 || fileIndex >= currentFiles.length) {
          console.warn(`Invalid file index ${fileIndex} for field ${fieldId}`);
          return false;
        }

        const newFiles = currentFiles.filter((_, index) => index !== fileIndex);
        get().actions.updateFieldValue(fieldId, newFiles);

        return true;
      },

      /**
       * Gets form data with files separated
       * @returns Object with separate data and files properties
       */
      getFormDataWithFiles: () => ({
        data: get().formData,
        files: get().fileData
      }),

      // Variable management actions
      /**
       * Updates all variables in the context
       * @param variables - New variable context
       */
      updateVariables: (variables: VariableContext) => {
        // Ensure variables is always an object to prevent undefined issues
        const safeVariables = variables || {};
        set({ variables: safeVariables });
      },

      /**
       * Updates a single variable in the context
       * @param key - Variable key
       * @param value - Variable value
       */
      updateVariable: (key: string, value: any) => {
        set((state) => ({
          variables: {
            ...state.variables,
            [key]: value
          }
        }));
      },

      /**
       * Gets a single variable value
       * @param key - Variable key
       * @returns Variable value or undefined
       */
      getVariable: (key: string) => {
        return get().variables[key];
      },

      /**
       * Gets all variables
       * @returns Current variable context
       */
      getVariables: () => {
        return get().variables;
      },

      /**
       * Resolves a field property value that may contain variable references
       * @param field - Form field
       * @param property - Field property to resolve
       * @returns Resolved value
       */
      resolveFieldValue: (field: FormField, property: keyof FormField) => {
        const value = field[property];
        const variables = get().variables;

        return resolveInterpolatableValue(value, variables);
      }
    }
  };
});
