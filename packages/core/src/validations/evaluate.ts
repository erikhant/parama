import { ValidationRule, ValidatorRegistry } from '@form-builder/types';
import { interpolate, objectToQueryString } from '../utils';
import { JsonValidator } from './json';
import _ from 'lodash';

export const evaluateValidations = async (
  fieldId: string,
  rule: ValidationRule,
  value: any,
  formData: Record<string, any>
): Promise<string | boolean> => {
  switch (rule.type) {
    case 'required':
      if (rule.expression) {
        try {
          const expr = interpolate(rule.expression, formData);
          const isValid = new Function(`return ${expr}`)();
          return isValid || rule.message;
        } catch {
          return rule.message;
        }
      }
      return !!value || rule.message;
    case 'pattern':
      return rule.pattern!.test(value || '') || rule.message;
    case 'cross-field':
    case 'custom':
      if (rule.expression) {
        try {
          const expr = interpolate(rule.expression, formData);
          const isValid = new Function(`return ${expr}`)();
          return isValid || rule.message;
        } catch {
          return rule.message;
        }
      }
      return true; // No custom validation logic provided
    case 'minLength':
      if (typeof value === 'string') {
        return value.length >= (rule.value || 0) || rule.message;
      }
      return true;
    case 'maxLength':
      if (typeof value === 'string') {
        return value.length <= (rule.value || Infinity) || rule.message;
      }
      return true;
    case 'min':
      return (value || 0) >= (rule.value || 0) || rule.message;
    case 'max':
      return (value || 0) <= (rule.value || Infinity) || rule.message;
    case 'minSelected':
      if (Array.isArray(value)) {
        return value.length >= (rule.value || 0) || rule.message;
      }
      return true;
    case 'maxSelected':
      if (Array.isArray(value)) {
        return value.length <= (rule.value || Infinity) || rule.message;
      }
      return true;
    case 'server':
      if (rule.serverConfig) {
        const { url, headers = {}, params } = rule.serverConfig;
        const queryString = objectToQueryString(params || {});
        try {
          const response = await fetch(`${url}?${queryString}`, {
            ...headers
          });
          const result = await response.json();
          return _.get(result, rule.serverConfig.dataSource!) || rule.message;
        } catch {
          return rule.message;
        }
      }
      return true;
    case 'json-schema':
      try {
        const validator = new JsonValidator();
        const { isValid, formattedErrors } = validator.validate(rule.json?.schema || {}, {
          [fieldId]: formData[fieldId]
        });
        return isValid || formattedErrors.join(', ') || rule.message;
      } catch {
        return rule.message;
      }
    default:
      return true; // No validation needed
  }
};

export const createValidatorRegistry = (
  customValidators: ValidatorRegistry = {}
): ValidatorRegistry => {
  return {
    // ...builtInValidators,
    ...customValidators
  };
};

// export const builtInValidators: ValidatorRegistry = {
//   minSelected: (field) => {
//     if (field.type == 'checkbox') {
//       const min = field.validations?.minSelected ?? 1;
//       const selected = Array.isArray(field.value) ? field.value.length : 0;
//       return selected >= min;
//     }
//     return true;
//   },
//   maxSelected: (field) => {
//     if (field.type == 'checkbox') {
//       const max = field.validations?.maxSelected ?? Infinity;
//       const selected = Array.isArray(field.value) ? field.value.length : 0;
//       return selected <= max;
//     }
//     return true;
//   }
//   // Add more built-in validators
// };
