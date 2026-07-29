import type { FileDescriptor, FileField, FormField, FormSchema } from '@parama-dev/form-builder-types';

/**
 * Result of turning a schema plus a caller-supplied data payload into the
 * store's initial value maps.
 */
export interface HydrationResult {
  formData: Record<string, any>;
  existingFiles: Record<string, FileDescriptor[]>;
}

const NAME_ID_SEPARATOR = '__';

/**
 * Extracts the GUID portion of a field-name id token.
 *
 * Field names are shaped `<base>__<prefix>_<guid>` (e.g. `email__attr_9f3c…`).
 * Callers occasionally send back payloads where the *prefix* differs from the
 * schema's (`attr_` vs `tax_`) while the GUID is stable, so matching keys off
 * the GUID lets those payloads still hydrate.
 */
function guidOf(idToken: string): string {
  const underscoreIndex = idToken.indexOf('_');
  return underscoreIndex !== -1 ? idToken.slice(underscoreIndex + 1) : idToken;
}

/**
 * Builds a lookup that finds a field's initial value inside `data`, tolerating
 * id-prefix mismatches between the schema and the payload.
 *
 * Resolution order:
 *  1. exact key match on the field name;
 *  2. same base name and same GUID, ignoring the id prefix;
 *  3. any key containing the GUID (covers a renamed base);
 *  4. `undefined`.
 */
function createValueFinder(data: Record<string, any>) {
  const keys = Object.keys(data);

  return function findInitialValueForField(fieldName: string): any {
    if (Object.prototype.hasOwnProperty.call(data, fieldName)) {
      return data[fieldName];
    }

    const sepIndex = fieldName.lastIndexOf(NAME_ID_SEPARATOR);
    if (sepIndex === -1) return undefined;

    const base = fieldName.slice(0, sepIndex);
    const guidPart = guidOf(fieldName.slice(sepIndex + NAME_ID_SEPARATOR.length));

    const sameBaseAndGuid = keys.find((key) => {
      const i = key.lastIndexOf(NAME_ID_SEPARATOR);
      if (i === -1) return false;
      if (key.slice(0, i) !== base) return false;
      return guidOf(key.slice(i + NAME_ID_SEPARATOR.length)) === guidPart;
    });
    if (sameBaseAndGuid) return data[sameBaseAndGuid];

    const anyGuidMatch = keys.find((key) => key.includes(guidPart));
    return anyGuidMatch ? data[anyGuidMatch] : undefined;
  };
}

/** Converts one loosely-typed file reference into a descriptor, or null. */
function toFileDescriptor(value: any): FileDescriptor | null {
  if (!value) return null;

  if (typeof value === 'string') {
    const segments = value.split('/');
    return { name: segments[segments.length - 1] || 'file', url: value };
  }

  if (typeof value === 'object' && 'url' in value) {
    return {
      id: value.id,
      name: value.name || 'file',
      url: value.url,
      size: value.size,
      type: value.type
    };
  }

  return null;
}

/**
 * Normalises a file field's incoming value into descriptors. Accepts a URL
 * string, a descriptor-like object, or an array of either.
 */
export function toFileDescriptors(input: any): FileDescriptor[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(toFileDescriptor).filter((d): d is FileDescriptor => d !== null);
  }
  const single = toFileDescriptor(input);
  return single ? [single] : [];
}

/** Seeds form data from the schema alone, using each field's value/defaultValue. */
function hydrateFromSchemaDefaults(fields: FormField[]): Record<string, any> {
  return fields.reduce<Record<string, any>>((acc, field) => {
    if ('value' in field && field.value !== undefined) {
      acc[field.id] = field.value;
    } else if ('defaultValue' in field && field.defaultValue !== undefined) {
      acc[field.id] = field.defaultValue;
    }
    return acc;
  }, {});
}

/**
 * Seeds form data from a caller-supplied payload.
 *
 * The payload arrives keyed by field *name*; the store keys values by field
 * *id*. Only id-keyed entries are produced here — every reader (`getFieldValue`,
 * expression interpolation, serialisation) looks values up by id, so carrying
 * the original name keys as well would leave the map in two keyings at once and
 * leak unmatched payload keys straight back out of `getFormData()`.
 */
function hydrateFromData(fields: FormField[], data: Record<string, any>): HydrationResult {
  const formData: Record<string, any> = {};
  const existingFiles: Record<string, FileDescriptor[]> = {};
  const findValue = createValueFinder(data);

  fields.forEach((field) => {
    if (field.type === 'file') {
      const fileField = field as FileField;
      const storageKey = fileField.name || field.id;
      const candidate = findValue(fileField.name) ?? fileField.value ?? field.defaultValue;
      const descriptors = toFileDescriptors(candidate);

      // File bytes and metadata live outside the primitive value map.
      if (descriptors.length > 0) existingFiles[storageKey] = descriptors;
      return;
    }

    if ('name' in field && field.name) {
      const valueFromData = findValue(field.name);
      if (valueFromData !== undefined) {
        formData[field.id] = valueFromData;
      } else if (field.defaultValue !== undefined) {
        formData[field.id] = field.defaultValue;
      }
    }
  });

  return { formData, existingFiles };
}

/**
 * Produces the store's initial `formData` and `existingFiles` for a schema.
 *
 * When no data payload is supplied the schema's own values/defaults seed the
 * form; otherwise the payload wins and defaults only fill the gaps.
 */
export function hydrateInitialData(schema: FormSchema | undefined, data: Record<string, any>): HydrationResult {
  const fields = schema?.fields;

  // No fields means no ids to key values by, so there is nothing to hydrate.
  if (!fields || fields.length === 0) {
    return { formData: {}, existingFiles: {} };
  }

  if (Object.keys(data).length === 0) {
    return { formData: hydrateFromSchemaDefaults(fields), existingFiles: {} };
  }

  return hydrateFromData(fields, data);
}
