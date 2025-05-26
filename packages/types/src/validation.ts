import { FormField } from './schema';

export type ValidatorFunction = (
  field: FormField
) => Promise<boolean> | boolean;
export type ValidatorRegistry = Record<string, ValidatorFunction>;

export interface BaseValidation {
  required?: boolean | { value: boolean; message: string };
  custom?: Array<{
    validator: string;
    value?: any;
    message?: string;
  }>;
}

export interface CheckboxValidation extends BaseValidation {
  minSelected: number;
  maxSelected: number;
}

export interface TextValidation extends BaseValidation {
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
}

export interface FileValidation extends BaseValidation {
  accept: {
    [x: string]: string[];
  };
  maxSize?: number; // in bytes
  maxFiles?: number;
}
