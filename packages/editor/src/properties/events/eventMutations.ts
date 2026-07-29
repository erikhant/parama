import type { Events, FormField, FormSchema } from '@parama-dev/form-builder-types';

/**
 * Pure transitions over a field's event list.
 *
 * Events fire after a field's value changes and its validation passes, acting
 * on *another* field. That cross-field nature is why target resolution lives
 * here rather than in the panel: which fields are valid targets depends on the
 * event type, not on what the panel happens to be rendering.
 */

/** Field types that can be the target of a `fetch` event. */
const OPTION_BACKED_TYPES = new Set<FormField['type']>(['select', 'multiselect', 'autocomplete']);

/** Human-readable names for each event type, used in the panel. */
export const EVENT_TYPE_LABELS: Record<Events['type'], string> = {
  setValue: 'Set value',
  reset: 'Reset field',
  fetch: 'Fetch options'
};

/** Reads a field's events. Buttons and blocks carry none. */
export function eventsOf(field: FormField): Events[] {
  return ('events' in field && field.events) || [];
}

/** Appends an event, returning a new list. */
export function appendEvent(field: FormField, event: Events): Events[] {
  return [...eventsOf(field), event];
}

/** Merges a patch into the event at `index`, returning a new list. */
export function updateEventAt(field: FormField, index: number, patch: Partial<Events>): Events[] {
  return eventsOf(field).map((event, i) => (i === index ? { ...event, ...patch } : event));
}

/** Removes the event at `index`, returning a new list. */
export function removeEventAt(field: FormField, index: number): Events[] {
  return eventsOf(field).filter((_, i) => i !== index);
}

/**
 * The fields an event of `type` may target.
 *
 * A field never targets itself — that would make its own change re-trigger it.
 * `fetch` narrows further to option-backed fields, since there is nothing to
 * refetch on a plain input.
 */
export function targetsFor(schema: FormSchema, sourceFieldId: string, type: Events['type']): FormField[] {
  const candidates = schema.fields.filter((field) => field.id !== sourceFieldId);

  return type === 'fetch' ? candidates.filter((field) => OPTION_BACKED_TYPES.has(field.type)) : candidates;
}

/** The display name of a field, falling back to its id. */
export function fieldLabel(field: FormField): string {
  return 'name' in field && field.name ? field.name : field.id;
}

/**
 * Resolves a target id to a readable label.
 *
 * Falls back to the raw id so an event pointing at a since-deleted field still
 * shows what it was aiming at, rather than rendering blank.
 */
export function resolveTargetLabel(schema: FormSchema, targetId: string): string {
  const target = schema.fields.find((field) => field.id === targetId);
  return target ? fieldLabel(target) : targetId;
}

/** True once an event has everything it needs to run. */
export function isEventComplete(event: Partial<Events>): boolean {
  if (!event.target) return false;

  // `setValue` without a value would clear the target rather than set it.
  if (event.type === 'setValue') return Boolean(event.params?.value);

  return true;
}

/** A fresh, incomplete event for the "add" form to fill in. */
export function blankEvent(): Partial<Events> {
  return { type: 'setValue', target: '', params: { value: '' } };
}
