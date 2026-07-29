import type { FormField, FormSchema } from '@parama-dev/form-builder-types';
import { logger } from '../logger';
import type { FieldResolver } from '../state/types';
import { interceptExpressionTemplate, interpolate } from '../utils';
import { hasEntries } from './fileData';

export interface SerializerContext {
  schema: FormSchema;
  formData: Record<string, any>;
  fileData: FormData;
  resolveField: FieldResolver;
}

/** A field that carries a `name`, i.e. everything except buttons and blocks. */
type NamedField = Extract<FormField, { name: string }>;

function isNamedField(field: FormField): field is NamedField {
  return 'name' in field && Boolean(field.name);
}

/**
 * Hands out submission keys, disambiguating repeated field names by suffixing
 * the field id. Stateful by design — allocation order decides which field keeps
 * the bare name.
 */
class NameAllocator {
  private used = new Set<string>();

  allocate(field: NamedField): string {
    if (!this.used.has(field.name)) {
      this.used.add(field.name);
      return field.name;
    }
    const unique = `${field.name}_${field.id}`;
    logger.warn(`Duplicate field name "${field.name}" found. Using "${unique}" instead.`);
    this.used.add(unique);
    return unique;
  }
}

/**
 * Applies a field's `transformer` template, if present.
 *
 * @returns The transformed value, or the raw value when no transformer is set.
 */
function applyTransformer(field: FormField, rawValue: any, ctx: SerializerContext): any {
  if (!('transformer' in field) || !field.transformer) return rawValue;

  const template = interceptExpressionTemplate(field.transformer, ctx.resolveField);
  return interpolate(template, ctx.formData);
}

/** Collects the file entries a file field contributes to the payload. */
function filesFor(field: NamedField, fileData: FormData): FormDataEntryValue[] {
  const entries: FormDataEntryValue[] = [];
  fileData.forEach((value, key) => {
    if (key === field.name) entries.push(value);
  });
  return entries;
}

/**
 * Serialises named fields into a `FormData`, carrying selected files across.
 *
 * A name is allocated only for a field that actually emits something, matching
 * {@link serializeToJson}. Allocating for value-less fields too would make the
 * same form produce different keys depending on whether it happened to contain
 * a file.
 */
function serializeToFormData(ctx: SerializerContext): FormData {
  const merged = new FormData();
  const names = new NameAllocator();

  ctx.schema.fields.forEach((field) => {
    if (!isNamedField(field)) return;

    if (field.type === 'file') {
      const files = filesFor(field, ctx.fileData);
      if (files.length === 0) return;

      const key = names.allocate(field);
      files.forEach((file) => merged.append(key, file));
      return;
    }

    const rawValue = ctx.formData[field.id];
    if (rawValue === undefined) return;

    merged.append(names.allocate(field), JSON.stringify(applyTransformer(field, rawValue, ctx)));
  });

  return merged;
}

/** Serialises named fields into a plain object keyed by field name. */
function serializeToJson(ctx: SerializerContext): Record<string, any> {
  const names = new NameAllocator();

  return ctx.schema.fields.reduce<Record<string, any>>((acc, field) => {
    if (!isNamedField(field)) return acc;

    const rawValue = ctx.formData[field.id];
    if (rawValue === undefined) return acc;

    acc[names.allocate(field)] = applyTransformer(field, rawValue, ctx);
    return acc;
  }, {});
}

/**
 * Serialises the form keyed by field **name**, applying transformers.
 *
 * Returns a `FormData` when the form holds files (so it can be posted as
 * `multipart/form-data`) and a plain object otherwise.
 */
export function serializeByNames(ctx: SerializerContext): Record<string, any> | FormData {
  return hasEntries(ctx.fileData) ? serializeToFormData(ctx) : serializeToJson(ctx);
}

/**
 * Serialises the form's **values** keyed by field name, always as a plain
 * object.
 *
 * Unlike {@link serializeByNames} this never returns a `FormData`: it backs the
 * `onChange` callback, whose signature is `Record<string, any>` and which
 * reports value changes, not file uploads.
 */
export function serializeValuesByName(ctx: SerializerContext): Record<string, any> {
  return serializeToJson(ctx);
}

/**
 * Serialises the form keyed by field **id**, without transformers.
 *
 * Returns a `FormData` when files are present, otherwise the raw value map.
 */
export function serializeById(formData: Record<string, any>, fileData: FormData): Record<string, any> | FormData {
  if (!hasEntries(fileData)) return formData;

  const merged = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) merged.append(key, String(value));
  });

  fileData.forEach((value, key) => merged.append(key, value));

  return merged;
}
