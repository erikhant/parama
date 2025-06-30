import { ValidationRule, ValidatorRegistry } from './validation';

export interface FormSchema {
  title: string;
  description?: string;
  layout: {
    colSize: number;
    gap: number;
  };
  fields: FormField[];
}

export type FormField =
  | TextField
  | FileField
  | RadioField
  | CheckboxField
  | SelectField
  | DateField
  | SubmitForm;

export interface FormBuilderProps {
  schema: FormSchema;
  validators?: ValidatorRegistry;
  data?: Record<string, any>;
  // templates?: FormTemplate[];
  variables?: Record<string, any>;
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
  render?: Condition;
  visibility?: Condition;
  disabled?: Condition;
  readOnly?: Condition;
}

export interface Events {
  type: 'fetch' | 'setValue' | 'reset';
  target?: string;
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
    [x: string]: string[];
  };
  maxSize?: number; // in bytes
  maxFiles?: number;
  server: string;
  instantUpload: boolean;
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
  readOnly: boolean;
  placeholder?: string;
  width: number;
  appearance?: Record<string, any>;
  conditions?: FieldConditions;
  events?: Events[];
  validations?: ValidationRule[];
  // ... common properties
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

export interface TextField extends BaseField {
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

export interface RadioField extends BaseField {
  type: 'radio';
  items: FieldGroupItem[];
  appearance?: {
    position?: 'horizontal' | 'vertical';
    bordered?: boolean;
  };
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
  items: FieldGroupItem[];
  appearance?: {
    position?: 'horizontal' | 'vertical';
    bordered?: boolean;
  };
}

export interface FileField extends BaseField {
  type: 'file';
  multiple: boolean;
  options?: FileOptions;
  appearance?: {
    droppable: boolean;
  };
  // options?: FileUploadOptions;
}

export interface DateField extends BaseField {
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

export interface SelectField extends BaseField {
  type: 'select';
  multiple: boolean;
  placeholder?: string;
  options: FieldGroupItem[];
  optionGroups?: {
    id: string;
    label: string;
    items: FieldGroupItem[];
  }[];
  external?: ExternalDataSource<FieldGroupItem>;
  // dynamicOptions?: DynamicOptions;
}

export interface SubmitForm extends BaseField {
  type: 'submit';
}
// Add other validation types as needed (NumberValidation, DateValidation, etc.)
