import { Condition } from '@form-builder/types';
import { FormBuilderState } from './store';

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
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    console.log('Interpolating with key:', key);
    console.log('Interpolating with data:', data[key.trim()]);

    const value = data[key.trim()];

    // Handle undefined/null values
    if (value === undefined || value === null) {
      return 'null';
    }

    // For JavaScript expressions, we need to properly quote string values
    if (typeof value === 'string') {
      console.log('Interpolating string value:', value);
      return JSON.stringify(value);
    }

    // For other types (numbers, booleans, etc.), convert to string
    return String(value);
  });
}

export function interceptExpressionTemplate(expression: string, state: FormBuilderState) {
  return expression.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    // Replace field names with their IDs
    const fieldId = state.actions.getField(key.trim())?.id;
    if (!fieldId) {
      return `{{${key.trim()}}}`;
    }
    return `{{${fieldId}}}`;
  });
}
