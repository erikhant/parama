import _ from 'lodash';
import type { ValidationRule } from '@parama-dev/form-builder-types';
import { interpolate, objectToQueryString } from '../utils';
import { JsonValidator } from './json';
import validator from 'validator';

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
      if (rule.name === 'email') {
        if (!value) return true;
        return validator.isEmail(value) || rule.message;
      }
      if (rule.name === 'url') {
        return validator.isURL(value) || rule.message;
      }
      if (rule.name === 'phone') {
        return validator.isMobilePhone(value, 'id-ID') || rule.message;
      }
      if (rule.name === 'postalCode') {
        return validator.isPostalCode(value, 'ID') || rule.message;
      }
      if (rule.name === 'ip') {
        return validator.isIP(value) || rule.message;
      }
      if (rule.name === 'creditCard') {
        return validator.isCreditCard(value) || rule.message;
      }
      if (rule.name === 'port') {
        return validator.isPort(value) || rule.message;
      }
      if (rule.name === 'passport') {
        return validator.isPassportNumber(value, 'ID') || rule.message;
      }
      if (rule.name === 'passwordStrength') {
        return (
          validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          }) || rule.message
        );
      }
      // If a custom pattern is provided, use it for validation
      if (!rule.pattern) {
        return true; // No pattern defined, skip validation
      }
      if (!(rule.pattern instanceof RegExp)) {
        const pattern = new RegExp(rule.pattern);
        return pattern.test(value || '') || rule.message;
      }
      // Use the provided pattern for validation
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

// export const createValidatorRegistry = (
//   customValidators: ValidatorRegistry = {}
// ): ValidatorRegistry => {
//   return {
//     // ...builtInValidators,
//     ...customValidators
//   };
// };

export const builtInValidatorTemplate: ValidationRule[] = [
  {
    type: 'pattern',
    name: 'email',
    message: 'Invalid email format',
    trigger: 'change'
  },
  {
    type: 'pattern',
    name: 'url',
    message: 'Invalid URL format',
    trigger: 'change'
  },
  {
    type: 'pattern',
    name: 'phone',
    message: 'Invalid phone number format',
    trigger: 'change'
  },
  {
    type: 'pattern',
    name: 'ip',
    message: 'Invalid IP address format',
    trigger: 'change'
  },
  {
    type: 'pattern',
    name: 'port',
    message: 'Invalid port number format',
    trigger: 'change'
  },
  {
    type: 'pattern',
    name: 'passport',
    message: 'Invalid passport number format',
    trigger: 'change'
  },
  {
    type: 'pattern',
    name: 'passwordStrength',
    message:
      'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters',
    trigger: 'change'
  },
  {
    type: 'pattern',
    name: 'creditCard',
    message: 'Invalid credit card number format',
    trigger: 'change'
  },
  {
    type: 'pattern',
    name: 'postalCode',
    message: 'Invalid postal code format',
    trigger: 'change'
  }
];
