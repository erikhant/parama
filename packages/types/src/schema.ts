import { ValidationRule, ValidatorRegistry } from './validation';

// Variable injection types
export type VariableContext = Record<string, any>;

export interface VariableResolver {
  resolve(template: string, variables: VariableContext): string;
  interpolate(value: any, variables: VariableContext): any;
}

export interface VariableReference {
  template: string;
  resolvedValue?: any;
}

// Utility type for variable interpolation
export type Interpolatable<T> = T;

// Utility functions for variable handling
export interface VariableUtils {
  /**
   * Resolves variables in a template string using the pattern {{$variableName}}
   * @param template - The template string containing variable references
   * @param variables - The variable context to resolve from
   * @returns The resolved string with variables replaced
   */
  resolveTemplate(template: string, variables: VariableContext): string;

  /**
   * Checks if a string contains variable references
   * @param value - The string to check
   * @returns True if the string contains variable references
   */
  hasVariables(value: string): boolean;

  /**
   * Extracts variable names from a template string
   * @param template - The template string to extract variables from
   * @returns Array of variable names found in the template
   */
  extractVariables(template: string): string[];

  /**
   * Interpolates variables in any value (string, object, array)
   * @param value - The value to interpolate
   * @param variables - The variable context
   * @returns The interpolated value
   */
  interpolateValue(value: any, variables: VariableContext): any;
}

// Variable context with common user-related variables
export interface StandardVariableContext extends VariableContext {
  userEmail?: string;
  userName?: string;
  userId?: string;
  userRole?: string;
  currentDate?: string;
  currentTime?: string;
  [key: string]: any;
}

// Enhanced FormEditorOptions with variable configuration
export interface VariableEditorConfig {
  /**
   * Whether to show variable suggestions in the editor
   */
  showVariableSuggestions?: boolean;

  /**
   * List of available variables to show in suggestions
   */
  availableVariables?: Array<{
    name: string;
    description?: string;
    example?: string;
  }>;

  /**
   * Custom variable prefix pattern (default: {{$)
   */
  variablePrefix?: string;

  /**
   * Custom variable suffix pattern (default: } })
   */
  variableSuffix?: string;
}

export interface FormSchema {
  id: string;
  version: string;
  title: string;
  description?: string;
  layout: {
    colSize: number;
    gap: number;
  };
  fields: FormField[];
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
}

export type FormField =
  | TextField
  | FileField
  | RadioField
  | CheckboxField
  | SelectField
  | MultiSelectField
  | AutoCompleteField
  | DateField
  | ButtonField
  | BlockField;

export interface FormBuilderProps {
  schema: FormSchema;
  validators?: ValidatorRegistry;
  data?: Record<string, any>;
  variables?: VariableContext;
  onSubmit?: (data: Record<string, any> | FormData, contentType: 'application/json' | 'multipart/form-data') => void;
  onChange?: (data: Record<string, any>) => void;
  onCancel?: () => void;
}

export interface FormEditorOptions {
  brand?: object | string; // Can be a React component or a string
  containerClassname?: string;
  defaultFieldTab?: 'fields' | 'presets';
  showJsonCode?: boolean;
  generalSettings?: FieldSettings;
  propertiesSettings?: FieldSettings;
  dataSettings?: FieldSettings;
  appearanceSettings?: FieldSettings;
  validationSettings?: FieldSettings;
  conditionsSettings?: FieldSettings;
  eventsSettings?: FieldSettings;
  variableConfig?: VariableEditorConfig;
}

export type FieldSettings = 'on' | 'off' | 'readonly';

export interface FormEditorProps {
  onSaveSchema?: (data: FormSchema) => void;
  loadPreset?: (() => PresetTypeDef[]) | PresetTypeDef[];
  schema?: FormSchema;
  options?: FormEditorOptions;
  variables?: VariableContext;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  schema: FormSchema;
  thumbnail?: string;
}

export interface ExternalDataSource<TData = any> {
  url: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  mapper?: {
    dataSource: string;
    dataMapper: TData;
  };
}

export interface LogicalCondition {
  operator: 'Equals' | 'NotEqual' | 'GreaterThan' | 'LessThan' | 'LessOrEqual' | 'GreaterOrEqual';
}

export interface Condition {
  expression: string;
  fallback?: any;
}

export interface FieldConditions {
  hidden?: Condition;
  disabled?: Condition;
  readOnly?: Condition;
}

export interface Events {
  type: 'fetch' | 'setValue' | 'reset';
  target: string;
  params?: Record<string, any>;
  config?: Record<string, any>;
}

export interface DynamicOptions {
  url: string;
  dependsOn?: string[];
  queryParams?: Record<string, string>;
  headers?: Record<string, string>;
  dataPath?: string;
  cache?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
}

export interface FileOptions {
  accept: {
    [key: string]: readonly string[];
  };
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  server: string;
  instantUpload?: boolean;
  bulkUpload?: boolean;
  preferredUnit?: string; // e.g., 'MB', 'KB'
}

export interface BaseField {
  id: string;
  name: string;
  type: string;
  label: string;
  error?: string;
  disabled?: boolean;
  defaultValue?: any;
  value: any;
  helpText?: string;
  readOnly?: boolean;
  placeholder?: string;
  width: number;
  appearance?: Record<string, any>;
  conditions?: FieldConditions;
  events?: Events[];
  validations?: ValidationRule[];
}

export interface FieldGroupItem {
  id: string | number;
  label: string;
  value: any;
  description?: string;
  disabled?: boolean;
  icon?: {
    type: string;
  };
}

export interface DataCustomization {
  transformer?: string;
}

export interface TextField extends BaseField, DataCustomization {
  type: 'text' | 'email' | 'textarea' | 'password' | 'number' | 'tel' | 'url' | 'hidden';
  placeholder?: string;
  rows?: number;
  appearance?: {
    prefix?: {
      type: 'text' | 'icon';
      content: string;
    };
    suffix?: {
      type: 'text' | 'icon';
      content: string;
    };
    addOnStart?: {
      type: 'button' | 'select';
      label: string;
      options?: FieldGroupItem[];
    };
    addOnEnd?: {
      type: 'button' | 'select';
      label: string;
      options?: FieldGroupItem[];
    };
  };
}

export interface RadioField extends BaseField, DataCustomization {
  type: 'radio';
  items: FieldGroupItem[];
  appearance?: {
    position?: 'horizontal' | 'vertical';
    bordered?: boolean;
  };
}

export interface CheckboxField extends BaseField, DataCustomization {
  type: 'checkbox';
  items: FieldGroupItem[];
  appearance?: {
    position?: 'horizontal' | 'vertical';
    bordered?: boolean;
  };
}

export interface FileField extends BaseField {
  type: 'file';
  options: FileOptions;
  formExtension?: Record<string, any>;
  appearance?: {
    droppable: boolean;
  };
  // options?: FileUploadOptions;
}

export interface DateField extends BaseField, DataCustomization {
  type: 'date';
  placeholder?: string;
  mode: 'single' | 'multiple' | 'range';
  options?: {
    dateFormat?: string;
    max?: number;
    min?: number;
    dropdownType?: string;
    disabledPast?: boolean;
    disabledFuture?: boolean;
    disabledWeekdays?: number[];
    restrictedMonths?: string[];
  };
}

export interface SelectField extends BaseField, DataCustomization {
  type: 'select';
  multiple: boolean;
  placeholder?: string;
  options: FieldGroupItem[];
  optionGroups?: {
    id: string;
    label: string;
    items: FieldGroupItem[];
  }[];
  external?: ExternalDataSource<FieldGroupItem> & { _refreshTimestamp?: number };
}

export interface MultiSelectField extends BaseField, DataCustomization {
  type: 'multiselect';
  multiple: boolean;
  placeholder?: string;
  options: FieldGroupItem[];
  external?: ExternalDataSource<FieldGroupItem> & { _refreshTimestamp?: number };
}

export interface AutoCompleteField extends BaseField, DataCustomization {
  type: 'autocomplete';
  placeholder?: string;
  shouldFilter?: boolean;
  options: FieldGroupItem[];
  external?: ExternalDataSource<FieldGroupItem> & { _refreshTimestamp?: number };
}

export interface ButtonField extends Pick<BaseField, 'id' | 'label' | 'disabled' | 'width' | 'conditions'> {
  type: 'submit' | 'reset' | 'button';
  action: 'submit' | 'reset' | 'cancel';
  loadingText?: string; // Text to show when button is in loading state (defaults to "Submitting...")
  appearance?: {
    color?: 'primary' | 'secondary';
    variant?: 'fill' | 'outline' | 'ghost' | 'shadow';
    size?: 'xs' | 'sm' | 'lg' | 'default';
    stickyAtBottom?: boolean; // Whether the button should stick to the bottom of the form
  };
}

export interface BlockField extends Pick<BaseField, 'id' | 'width' | 'conditions'> {
  type: 'block' | 'spacer';
  height?: number;
  content: any; // Can be a React component or HTML content
}

export interface FieldTypeDef {
  id: string;
  type: string;
  label: string;
  group: 'fields' | 'presets';
  description?: string;
  image?: string;
  icon?: object | string; // Can be a React component or a string (e.g., emoji)
}

export interface FieldTypes {
  inputs: FieldTypeDef[];
  selections: FieldTypeDef[];
  presentations: FieldTypeDef[];
  [x: string]: FieldTypeDef[];
}

export interface PresetTypeDef extends FieldTypeDef {
  fields: FormField[];
}

// Type for checking if a field supports variable interpolation
export type VariableSupported<T> = T extends Interpolatable<infer U> ? true : false;

// Utility type to extract the base type from an Interpolatable type
export type BaseType<T> = T extends Interpolatable<infer U> ? U : T;

// Hook-like interface for variable context in forms
export interface UseVariableContext {
  variables: VariableContext;
  updateVariable: (key: string, value: any) => void;
  resolveValue: (value: Interpolatable<any>) => any;
  hasVariable: (template: string) => boolean;
  getVariableNames: (template: string) => string[];
}
