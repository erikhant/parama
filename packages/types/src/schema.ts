import {
  BaseValidation,
  CheckboxValidation,
  FileValidation,
  TextValidation,
  ValidatorRegistry
} from './validation';

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
  templates?: FormTemplate[];
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  schema: FormSchema;
  thumbnail?: string;
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
  width: number;
  conditions?: FieldConditions;
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

interface FieldConditions {
  visibility?: {
    dependsOn: string;
    operator:
      | 'Equals'
      | 'NotEqual'
      | 'GreaterThan'
      | 'LessThan'
      | 'LessOrEqual'
      | 'GreaterOrEqual';
    value: string | number;
  };
}

export interface TextField extends BaseField {
  type: 'text' | 'email' | 'textarea' | 'password' | 'number';
  placeholder?: string;
  validation?: TextValidation;
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
  validation?: BaseValidation;
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
  items: FieldGroupItem[];
  appearance?: {
    position?: 'horizontal' | 'vertical';
    bordered?: boolean;
  };
  validation?: CheckboxValidation;
}

export interface FileField extends BaseField {
  type: 'file';
  multiple: boolean;
  validation?: FileValidation;
  options?: {
    server: string;
    instantUpload: boolean;
  };
  appearance?: {
    droppable: boolean;
  };
  // options?: FileUploadOptions;
}

export interface DateField extends BaseField {
  type: 'date';
  placeholder?: string;
  mode: 'single' | 'multiple' | 'range' | 'default';
  appearance?: {
    dateFormat?: string;
  };
  validation?: BaseValidation;
}

export interface SelectField extends BaseField {
  type: 'select';
  multiple: boolean;
  placeholder?: string;
  options: FieldGroupItem[];
  validation?: BaseValidation;
}

export interface SubmitForm extends BaseField {
  type: 'submit';
}
// Add other validation types as needed (NumberValidation, DateValidation, etc.)
