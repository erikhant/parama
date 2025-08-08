import { FormBuilderState } from './store';

// Import variable types and utilities
import type { VariableContext } from '@parama-dev/form-builder-types';

/**
 * Converts an object to a URL query string format.
 *
 * Filters out undefined, null, and empty string values, then encodes
 * the remaining key-value pairs into a properly formatted query string.
 *
 * @param obj - The object to convert to a query string. Keys should be strings
 *              and values can be of any type that can be converted to string.
 * @returns A URL-encoded query string without the leading '?' character.
 *          Returns an empty string if no valid key-value pairs exist.
 *
 * @example
 * ```typescript
 * const params = { name: 'John', age: 30, city: '', country: null };
 * const queryString = objectToQueryString(params);
 * // Returns: "name=John&age=30"
 * ```
 */
export function objectToQueryString(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

/**
 * Interpolates a template string by replacing placeholders with corresponding values from a data object.
 *
 * Replaces all occurrences of `{{key}}` in the template string with the corresponding value
 * from the data object. If a key is not found in the data object, it will be replaced with
 * an empty string.
 *
 * @param template - The template string containing placeholders in the format `{{key}}`
 * @param data - An object containing key-value pairs to substitute into the template
 * @returns The interpolated string with all placeholders replaced by their corresponding values
 *
 * @example
 * ```typescript
 * const template = "Hello {{name}}, you have {{count}} messages";
 * const data = { name: "John", count: 5 };
 * const result = interpolate(template, data);
 * // Returns: "Hello John, you have 5 messages"
 * ```
 *
 * @example
 * ```typescript
 * const template = "Welcome {{user}}! Your role is {{role}}.";
 * const data = { user: "Alice" }; // missing 'role' key
 * const result = interpolate(template, data);
 * // Returns: "Welcome Alice! Your role is ."
 * ```
 */
export function interpolate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();

    // Skip variable patterns ({{$variableName}}) - these should be handled by interpolateVariables first
    if (trimmedKey.startsWith('$')) {
      return match;
    }

    const value = data[trimmedKey];
    // Handle undefined/null values
    if (value === undefined || value === null) {
      return 'null';
    }

    // For JavaScript expressions, we need to properly quote string values
    if (typeof value === 'string' || typeof value === 'object') {
      return JSON.stringify(value);
    }

    // For other types (numbers, booleans, etc.), convert to string
    return String(value);
  });
}

export function interceptExpressionTemplate(expression: string, state: FormBuilderState) {
  return expression.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();

    // Skip variable patterns ({{$variableName}}) - these should be handled by resolveInterpolatableValue first
    if (trimmedKey.startsWith('$')) {
      return match;
    }

    // Replace field names with their IDs
    const fieldId = state.actions.getField(trimmedKey)?.id;
    if (!fieldId) {
      return match;
    }
    return `{{${fieldId}}}`;
  });
}

/**
 * Interpolates variables using the {{$variableName}} pattern
 * @param template - Template string containing variable references
 * @param variables - Variable context
 * @param forExpression - Whether this is for a JavaScript expression (quotes strings)
 * @returns Resolved string
 */
export function interpolateVariables(template: string, variables: VariableContext, forExpression = false): string {
  if (typeof template !== 'string') {
    return template;
  }

  return template.replace(/\{\{\$([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g, (match, variableName) => {
    const value = variables[variableName];
    if (value !== undefined && value !== null) {
      if (forExpression) {
        // For JavaScript expressions, we need to properly quote string values
        if (typeof value === 'string') {
          return JSON.stringify(value);
        }
        // For other types (numbers, booleans, etc.), convert to string
        return String(value);
      } else {
        // For text interpolation, just convert to string
        return String(value);
      }
    }
    // Return the original pattern if variable is not found
    return match;
  });
}

/**
 * Resolves a value that may be a string or VariableReference
 * @param value - Value to resolve
 * @param variables - Variable context
 * @returns Resolved value
 */
export function resolveInterpolatableValue(value: any, variables: VariableContext): any {
  if (typeof value === 'string') {
    return interpolateVariables(value, variables);
  }

  if (value && typeof value === 'object' && 'template' in value) {
    return interpolateVariables(value.template, variables);
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveInterpolatableValue(item, variables));
  }

  if (value && typeof value === 'object') {
    const result: any = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = resolveInterpolatableValue(val, variables);
    }
    return result;
  }

  return value;
}

/**
 * Resolves variables in expression context (quotes string values for JavaScript)
 * @param expression - Expression string containing variable references
 * @param variables - Variable context
 * @returns Resolved expression with properly quoted values
 */
export function resolveExpressionVariables(expression: string, variables: VariableContext): string {
  if (typeof expression !== 'string') {
    return expression;
  }
  return interpolateVariables(expression, variables, true);
}
