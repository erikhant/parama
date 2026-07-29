import type {
  FieldGroupItem,
  FileDescriptor,
  FormBuilderProps,
  FormField,
  FormSchema,
  FormState,
  ValidationState,
  ValidationTrigger,
  ValidatorRegistry,
  VariableContext
} from '@parama-dev/form-builder-types';
import type { StoreApi } from 'zustand';
import type { WorkflowEngine } from '../workflow/engine';

export type FormMode = 'editor' | 'render';
export type ScreenSize = 'mobile' | 'tablet' | 'desktop';
export type SubmissionContentType = 'application/json' | 'multipart/form-data';

export interface SubmitResult {
  isValid: boolean;
  data: Record<string, any> | FormData;
  contentType: SubmissionContentType;
}

/**
 * Resolves a field by either its id or its `name`. Modules that only need to
 * look a field up depend on this instead of the whole store, which keeps
 * expression utilities and the workflow engine decoupled from state shape.
 */
export type FieldResolver = (idOrName: string) => FormField | undefined;

/**
 * The complete action surface of the form builder store.
 *
 * This is the package's public contract — the editor, the renderer and consumer
 * applications all call through `useFormBuilder().actions`. Slices implement
 * disjoint subsets of it and the store composes them; the shape must not change
 * without a major version bump.
 */
export interface FormBuilderActions {
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
  changeMode: (mode: FormMode) => void;
  changeScreenSize: (size: ScreenSize) => void;

  // Data management
  updateFieldValue: (id: string, value: any) => void;
  refreshDynamicOptions: (field: FormField) => Promise<FieldGroupItem[]>;
  mapResponseToOptions: (data: any, mapper: any) => FieldGroupItem[];
  getFormData: () => Record<string, any> | FormData;
  getFormDataByNames: () => Record<string, any> | FormData;
  /** Name-keyed values, always a plain object. Backs the `onChange` callback. */
  getFormValues: () => Record<string, any>;
  getFieldFiles: (fieldId: string) => File[];
  getFormDataWithFiles: () => { data: Record<string, any>; files: FormData };
  getExistingFiles: (fieldId: string) => FileDescriptor[];
  addFileField: (fieldId: string, file: File) => boolean;
  removeFileField: (fieldId: string, fileIndex: number) => boolean;
  removeExistingFileMeta: (fieldId: string, fileIndex: number) => boolean;
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

  // Submission state management
  setSubmissionState: (state: Partial<FormState>) => void;
  submitForm: () => Promise<SubmitResult>;
}

export interface FormBuilderState {
  // Core form state
  schema: FormSchema;
  formData: Record<string, any>;
  /** Newly selected files, keyed by field `name`. */
  fileData: FormData;
  /** Pre-existing (already uploaded) file metadata, keyed by field `name`. */
  existingFiles: Record<string, FileDescriptor[]>;
  validators: ValidatorRegistry;
  variables: VariableContext;
  selectedFieldId: string | null;
  mode: FormMode;
  screenSize: ScreenSize;

  /**
   * Bumped on every `initialize`. Lets subscribers distinguish "the form was
   * (re)seeded" from "a value changed", which look identical from `formData`.
   */
  initRevision: number;

  // Derived / evaluated state
  validation: Record<string, ValidationState>;
  visibleFields: Set<string>;
  readOnlyFields: Set<string>;
  disabledFields: Set<string>;
  formState: FormState;
  workflowEngine: WorkflowEngine | null;

  actions: FormBuilderActions;
}

export type SetState = StoreApi<FormBuilderState>['setState'];
export type GetState = () => FormBuilderState;

/**
 * Everything a slice needs to do its job. Slices receive this instead of
 * reaching for module-level singletons, which makes them independently
 * constructible in tests.
 */
export interface SliceContext {
  set: SetState;
  get: GetState;
  workflow: WorkflowEngine;
}
