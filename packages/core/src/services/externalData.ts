import type { FieldGroupItem, FormField, VariableContext } from '@parama-dev/form-builder-types';
import type { FieldResolver } from '../state/types';
import { interceptExpressionTemplate, interpolate, resolveInterpolatableValue } from '../utils';
import { mapResponseToOptions } from './optionsMapper';

/** Field types that can source their options from a remote endpoint. */
const EXTERNAL_CAPABLE_TYPES = ['select', 'multiselect', 'autocomplete'] as const;

type ExternalCapableField = Extract<FormField, { type: (typeof EXTERNAL_CAPABLE_TYPES)[number] }>;

/** Narrows a field to one that can carry an `external` data source. */
export function supportsExternalOptions(field: FormField): field is ExternalCapableField {
  return (EXTERNAL_CAPABLE_TYPES as readonly string[]).includes(field.type);
}

export interface OptionsRequestContext {
  variables: VariableContext;
  formData: Record<string, any>;
  resolveField: FieldResolver;
}

/** Outcome of an option fetch. Never throws — failures surface as `error`. */
export type OptionsResult = { ok: true; options: FieldGroupItem[] } | { ok: false; error: string };

/**
 * Resolves an external-source URL template into a request URL.
 *
 * Three substitution passes run in order: `{{$variable}}` references, field
 * *names* rewritten to field *ids*, then `{{fieldId}}` replaced with the current
 * value. The final `"` strip removes the JSON quoting `interpolate` adds for
 * expression safety, which a URL must not carry.
 */
export function buildOptionsUrl(urlTemplate: string, ctx: OptionsRequestContext): string {
  const withVariables = resolveInterpolatableValue(urlTemplate, ctx.variables);
  const withFieldIds = interceptExpressionTemplate(withVariables, ctx.resolveField);
  return interpolate(withFieldIds, ctx.formData).replace(/"/g, '');
}

/**
 * Fetches and maps a field's remote options.
 *
 * @returns `{ ok: true, options }` on success, `{ ok: false, error }` otherwise.
 *          Fields without an external source resolve to an empty option list.
 */
export async function fetchFieldOptions(field: FormField, ctx: OptionsRequestContext): Promise<OptionsResult> {
  if (!supportsExternalOptions(field) || !field.external) {
    return { ok: true, options: [] };
  }

  const { url, headers, mapper } = field.external;

  try {
    const requestUrl = buildOptionsUrl(url, ctx);
    const resolvedHeaders = headers ? resolveInterpolatableValue(headers, ctx.variables) : {};

    const response = await fetch(requestUrl, { headers: { ...resolvedHeaders } });

    if (!response.ok) {
      return { ok: false, error: `Failed to load options: ${response.statusText}` };
    }

    return { ok: true, options: mapResponseToOptions(await response.json(), mapper) };
  } catch (error) {
    return {
      ok: false,
      error: `Error loading options: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
