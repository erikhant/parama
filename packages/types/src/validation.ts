import { FormField } from './schema';
import type { Options as AjvOptions } from 'ajv';

export type ValidatorFunction = (field: FormField) => Promise<boolean> | boolean;
export type ValidatorRegistry = Record<string, ValidatorFunction>;

export interface ValidationRule {
  type:
    | 'required'
    | 'pattern'
    | 'minLength'
    | 'maxLength'
    | 'min'
    | 'max'
    | 'minSelected'
    | 'maxSelected'
    | 'custom'
    | 'server'
    | 'cross-field'
    | 'json-schema';
  message: string;
  trigger?: ValidationTrigger;
  pattern?: RegExp;
  expression?: string;
  value?: any;
  json?: JSONSchemaValidation;
  serverConfig?: ServerConfig;
}

export interface ValidationState {
  isValid: boolean;
  isPending: boolean;
  messages: string[];
  lastValidated?: number;
}

export type ValidationTrigger = 'change' | 'blur' | 'submit';

export interface JSONSchemaValidation {
  schema?: object;
  ajvOptions?: AjvOptions;
  severity?: 'error' | 'warning';
}

export interface ServerConfig {
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  debounce?: number;
  dataSource?: string;
}
