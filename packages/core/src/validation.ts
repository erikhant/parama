import { FormField, TextValidation, ValidatorRegistry } from '@form-builder/types';

export const runBasicValidations = (field: FormField, value: any): string | undefined => {
  if (field.type == 'submit') return undefined;
  if (!field.validation) return undefined;

  // Required validation
  if (field.validation.required) {
    const requiredConfig =
      typeof field.validation.required === 'boolean'
        ? {
            value: field.validation.required,
            message: 'This field is required'
          }
        : field.validation.required;

    if (requiredConfig.value && !value) {
      return requiredConfig.message;
    }
  }

  // Text-specific validations
  if (field.type === 'text' || field.type === 'textarea' || field.type === 'email') {
    const textValidation = field.validation as TextValidation;

    if (textValidation.minLength && value) {
      const minConfig =
        typeof textValidation.minLength === 'number'
          ? {
              value: textValidation.minLength,
              message: `Minimum length is ${textValidation.minLength}`
            }
          : textValidation.minLength;

      if (value.length < minConfig.value) {
        return minConfig.message;
      }
    }

    if (textValidation.maxLength && value) {
      const maxConfig =
        typeof textValidation.maxLength === 'number'
          ? {
              value: textValidation.maxLength,
              message: `Maximum length is ${textValidation.maxLength}`
            }
          : textValidation.maxLength;

      if (value.length > maxConfig.value) {
        return maxConfig.message;
      }
    }

    if (textValidation.pattern && value) {
      const patternConfig =
        typeof textValidation.pattern === 'object' && 'test' in textValidation.pattern
          ? { value: textValidation.pattern, message: 'Invalid format' }
          : textValidation.pattern;

      if (!patternConfig.value.test(value)) {
        return patternConfig.message;
      }
    }
  }

  // Add other field type validations here...

  return undefined;
};

export const builtInValidators: ValidatorRegistry = {
  minSelected: (field) => {
    if (field.type == 'checkbox') {
      const min = field.validation?.minSelected ?? 1;
      const selected = Array.isArray(field.value) ? field.value.length : 0;
      return selected >= min;
    }
    return true;
  },
  maxSelected: (field) => {
    if (field.type == 'checkbox') {
      const max = field.validation?.maxSelected ?? Infinity;
      const selected = Array.isArray(field.value) ? field.value.length : 0;
      return selected <= max;
    }
    return true;
  }
  // Add more built-in validators
};

export const createValidatorRegistry = (
  customValidators: ValidatorRegistry = {}
): ValidatorRegistry => {
  return {
    ...builtInValidators,
    ...customValidators
  };
};
