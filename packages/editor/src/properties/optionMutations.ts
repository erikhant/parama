import type {
  AutoCompleteField,
  CheckboxField,
  FieldGroupItem,
  MultiSelectField,
  RadioField,
  SelectField
} from '@parama-dev/form-builder-types';

/**
 * Pure state transitions for the option and item lists edited in the
 * properties panel.
 *
 * Editing an option is rarely a single-property change: removing one may have
 * to cascade into the field's `defaultValue`, and how it cascades depends on
 * whether the field holds one value or many. Keeping that logic here — out of
 * the components — makes it testable and stops each field type re-deriving it.
 *
 * Every function returns a partial field update to hand to `onChange`; none
 * mutates its input.
 */

/** Fields whose choices live in an `options` array. */
export type OptionField = SelectField | MultiSelectField | AutoCompleteField;

/** Fields whose choices live in an `items` array. */
export type ItemField = CheckboxField | RadioField;

/** How many values a field's `defaultValue` can hold. */
export type SelectionMode = 'single' | 'multiple';

/** Timestamp-based ids are stable enough for entries that exist only in the editor. */
const newId = (prefix: string) => `${prefix}-${Date.now()}`;

/** A blank entry, ready for the author to fill in. */
const blankEntry = (): FieldGroupItem => ({ id: newId('item'), label: '', value: '' });

/** Adds an empty option to the end of the list. */
export function appendOption(field: OptionField): Partial<OptionField> {
  return { options: [...(field.options ?? []), { ...blankEntry(), id: newId('option') }] };
}

/**
 * Replaces one property of the entry at `index`.
 *
 * @returns A new list; the original and its untouched entries keep their identity.
 */
export function updateEntryAt<T extends FieldGroupItem>(
  entries: T[],
  index: number,
  key: keyof FieldGroupItem,
  value: string
): T[] {
  if (index < 0 || index >= entries.length) return entries;

  const next = [...entries];
  next[index] = { ...next[index], [key]: value };
  return next;
}

/**
 * Drops the value the removed entry contributed to `defaultValue`.
 *
 * @returns `{ defaultValue }` when the default has to change, `{}` otherwise.
 *          The distinction matters: an absent key leaves the default alone,
 *          whereas an explicit `undefined` clears it.
 */
function cascadeDefaultValue(defaultValue: unknown, removedValue: unknown): { defaultValue?: any } {
  if (Array.isArray(defaultValue)) {
    if (!defaultValue.includes(removedValue)) return {};

    const remaining = defaultValue.filter((value) => value !== removedValue);
    return { defaultValue: remaining.length > 0 ? remaining : undefined };
  }

  // Compared by identity, never by `includes`: a string default is a single
  // value, not a collection, and substring-matching it wrongly cleared
  // defaults that merely contained the removed option's value.
  return defaultValue === removedValue ? { defaultValue: undefined } : {};
}

/** Removes the option at `index`, cascading into `defaultValue` if needed. */
export function removeOptionAt(field: OptionField, index: number): Partial<OptionField> {
  const options = field.options ?? [];
  const removed = options[index];

  return {
    options: options.filter((_, i) => i !== index),
    ...cascadeDefaultValue(field.defaultValue, removed?.value)
  };
}

/**
 * Computes the next `defaultValue` when an option's "set as default" switch is
 * toggled.
 *
 * @param current - The field's current default
 * @param value - The option being toggled
 * @param isDefault - The switch's new position
 * @param mode - Whether the field holds one value or many
 */
export function toggleDefaultValue(
  current: unknown,
  value: string,
  isDefault: boolean,
  mode: SelectionMode
): any {
  if (mode === 'single') {
    if (isDefault) return value;
    return current === value ? undefined : current;
  }

  const list: string[] = Array.isArray(current) ? current : [];

  if (isDefault) return list.includes(value) ? list : [...list, value];

  const remaining = list.filter((entry) => entry !== value);
  return remaining.length > 0 ? remaining : undefined;
}

/** Adds a numbered option group seeded with one blank item. */
export function appendGroup(field: SelectField): Partial<SelectField> {
  const groups = field.optionGroups ?? [];

  return {
    optionGroups: [
      ...groups,
      { id: newId('group'), label: `Group ${groups.length + 1}`, items: [blankEntry()] }
    ]
  };
}

/** Adds a blank item to the group at `groupIndex`. */
export function appendItemToGroup(field: SelectField, groupIndex: number): Partial<SelectField> {
  const groups = field.optionGroups ?? [];
  if (groupIndex < 0 || groupIndex >= groups.length) return {};

  return {
    optionGroups: groups.map((group, index) =>
      index === groupIndex ? { ...group, items: [...(group.items ?? []), blankEntry()] } : group
    )
  };
}

/** Removes the group with the given id. */
export function removeGroup(field: SelectField, groupId: string): Partial<SelectField> {
  return { optionGroups: (field.optionGroups ?? []).filter((group) => group.id !== groupId) };
}

/**
 * Clears every configured option source.
 *
 * Only the sources that are actually set are included, so the update does not
 * write `undefined` over properties the field never had.
 */
export function clearAllOptions(field: OptionField): Partial<OptionField> {
  const updates: Partial<SelectField> = {};

  if (field.options) updates.options = undefined;
  if ('optionGroups' in field && field.optionGroups) updates.optionGroups = undefined;
  if (field.external) updates.external = undefined;

  return updates as Partial<OptionField>;
}

/** Adds a numbered item to a checkbox or radio field. */
export function appendItem(field: ItemField): Partial<ItemField> {
  const items = field.items ?? [];
  const position = items.length + 1;

  return {
    items: [...items, { id: newId('item'), label: `Item ${position}`, value: `item-${position}` }]
  };
}

/** Removes the item at `index`, cascading into `defaultValue` if needed. */
export function removeItemAt(field: ItemField, index: number): Partial<ItemField> {
  const items = field.items ?? [];
  const removed = items[index];

  return {
    items: items.filter((_, i) => i !== index),
    ...cascadeDefaultValue(field.defaultValue, removed?.value)
  };
}

/** Clears every item and the default value that referenced them. */
export function clearAllItems(_field: ItemField): Partial<ItemField> {
  return { items: undefined, defaultValue: undefined };
}
