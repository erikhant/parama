import type { CheckboxField, MultiSelectField, RadioField, SelectField } from '@parama-dev/form-builder-types';
import { describe, expect, it } from 'vitest';
import {
  appendGroup,
  appendItem,
  appendOption,
  clearAllItems,
  clearAllOptions,
  removeItemAt,
  removeOptionAt,
  toggleDefaultValue,
  updateEntryAt
} from './optionMutations';

const option = (value: string, label = value) => ({ id: `id-${value}`, label, value });

const selectField = (overrides: Partial<SelectField> = {}): SelectField =>
  ({
    id: 'f1',
    name: 'choice',
    type: 'select',
    label: 'Choice',
    width: 12,
    multiple: false,
    options: [option('a'), option('b'), option('c')],
    ...overrides
  }) as SelectField;

const multiSelectField = (overrides: Partial<MultiSelectField> = {}): MultiSelectField =>
  ({
    id: 'f1',
    name: 'choices',
    type: 'multiselect',
    label: 'Choices',
    width: 12,
    multiple: true,
    options: [option('a'), option('b'), option('c')],
    ...overrides
  }) as MultiSelectField;

const radioField = (overrides: Partial<RadioField> = {}): RadioField =>
  ({
    id: 'f1',
    name: 'pick',
    type: 'radio',
    label: 'Pick',
    width: 12,
    items: [option('a'), option('b')],
    ...overrides
  }) as RadioField;

const checkboxField = (overrides: Partial<CheckboxField> = {}): CheckboxField =>
  ({
    id: 'f1',
    name: 'picks',
    type: 'checkbox',
    label: 'Picks',
    width: 12,
    items: [option('a'), option('b')],
    ...overrides
  }) as CheckboxField;

describe('appendOption', () => {
  it('adds a blank option to the end', () => {
    const result = appendOption(selectField());

    expect(result.options).toHaveLength(4);
    expect(result.options?.[3]).toMatchObject({ label: '', value: '' });
  });

  it('starts the list when the field has none', () => {
    expect(appendOption(selectField({ options: undefined })).options).toHaveLength(1);
  });

  it('does not mutate the original list', () => {
    const field = selectField();
    const original = field.options;

    appendOption(field);

    expect(original).toHaveLength(3);
  });
});

describe('updateEntryAt', () => {
  it('replaces one property of the entry at the index', () => {
    const result = updateEntryAt([option('a'), option('b')], 1, 'label', 'Renamed');

    expect(result[1]).toMatchObject({ value: 'b', label: 'Renamed' });
  });

  it('leaves the other entries untouched', () => {
    const entries = [option('a'), option('b')];

    const result = updateEntryAt(entries, 0, 'value', 'z');

    expect(result[1]).toBe(entries[1]);
  });

  it('returns the list unchanged for an out-of-range index', () => {
    const entries = [option('a')];

    expect(updateEntryAt(entries, 5, 'label', 'x')).toEqual(entries);
  });
});

describe('removeOptionAt', () => {
  it('removes the option at the index', () => {
    const result = removeOptionAt(selectField(), 1);

    expect(result.options?.map((o) => o.value)).toEqual(['a', 'c']);
  });

  it('leaves an unrelated default value alone', () => {
    const result = removeOptionAt(selectField({ defaultValue: 'a' }), 1);

    expect(result).not.toHaveProperty('defaultValue');
  });

  it('clears a single default value that pointed at the removed option', () => {
    const result = removeOptionAt(selectField({ defaultValue: 'b' }), 1);

    expect(result.defaultValue).toBeUndefined();
    expect('defaultValue' in result).toBe(true);
  });

  it('drops the removed value from a multi default value', () => {
    const result = removeOptionAt(multiSelectField({ defaultValue: ['a', 'b'] }), 1);

    expect(result.defaultValue).toEqual(['a']);
  });

  it('clears a multi default value that becomes empty', () => {
    const result = removeOptionAt(multiSelectField({ defaultValue: ['b'] }), 1);

    expect(result.defaultValue).toBeUndefined();
  });

  // The original used `defaultValue?.includes(value)` without checking for an
  // array first, so a *string* default was substring-matched: deleting option
  // "b" wrongly cleared a default of "abc".
  it('does not substring-match a string default value', () => {
    const result = removeOptionAt(selectField({ defaultValue: 'abc' }), 1);

    expect(result).not.toHaveProperty('defaultValue');
  });
});

describe('toggleDefaultValue', () => {
  describe('single selection', () => {
    it('sets the value when switched on', () => {
      expect(toggleDefaultValue(undefined, 'b', true, 'single')).toBe('b');
    });

    it('clears the value when switched off', () => {
      expect(toggleDefaultValue('b', 'b', false, 'single')).toBeUndefined();
    });

    it('leaves a different value in place when switched off', () => {
      expect(toggleDefaultValue('a', 'b', false, 'single')).toBe('a');
    });
  });

  describe('multiple selection', () => {
    it('appends the value when switched on', () => {
      expect(toggleDefaultValue(['a'], 'b', true, 'multiple')).toEqual(['a', 'b']);
    });

    it('starts a list from nothing', () => {
      expect(toggleDefaultValue(undefined, 'b', true, 'multiple')).toEqual(['b']);
    });

    it('removes the value when switched off', () => {
      expect(toggleDefaultValue(['a', 'b'], 'b', false, 'multiple')).toEqual(['a']);
    });

    it('collapses an emptied list to undefined', () => {
      expect(toggleDefaultValue(['b'], 'b', false, 'multiple')).toBeUndefined();
    });

    it('does not add the same value twice', () => {
      expect(toggleDefaultValue(['b'], 'b', true, 'multiple')).toEqual(['b']);
    });
  });
});

describe('appendGroup', () => {
  it('adds a numbered group seeded with one blank item', () => {
    const result = appendGroup(selectField({ optionGroups: [] }));

    expect(result.optionGroups).toHaveLength(1);
    expect(result.optionGroups?.[0].label).toBe('Group 1');
    expect(result.optionGroups?.[0].items).toHaveLength(1);
  });

  it('numbers the new group after the existing ones', () => {
    const existing = [{ id: 'g1', label: 'Group 1', items: [] }];

    const result = appendGroup(selectField({ optionGroups: existing }));

    expect(result.optionGroups?.[1].label).toBe('Group 2');
  });
});

describe('clearAllOptions', () => {
  it('clears every option source that is configured', () => {
    const field = selectField({ optionGroups: [{ id: 'g', label: 'G', items: [] }] });

    expect(clearAllOptions(field)).toEqual({ options: undefined, optionGroups: undefined });
  });

  it('clears an external source too', () => {
    const field = selectField({ options: undefined, external: { url: 'https://api' } });

    expect(clearAllOptions(field)).toEqual({ external: undefined });
  });

  it('returns nothing to change when no source is configured', () => {
    expect(clearAllOptions(selectField({ options: undefined }))).toEqual({});
  });
});

describe('appendItem', () => {
  it('adds a numbered item', () => {
    const result = appendItem(radioField());

    expect(result.items).toHaveLength(3);
    expect(result.items?.[2]).toMatchObject({ label: 'Item 3', value: 'item-3' });
  });
});

describe('removeItemAt', () => {
  it('removes the item at the index', () => {
    expect(removeItemAt(radioField(), 0).items?.map((i) => i.value)).toEqual(['b']);
  });

  it('clears a radio default that pointed at the removed item', () => {
    const result = removeItemAt(radioField({ defaultValue: 'a' }), 0);

    expect(result.defaultValue).toBeUndefined();
    expect('defaultValue' in result).toBe(true);
  });

  it('drops the removed value from a checkbox default', () => {
    const result = removeItemAt(checkboxField({ defaultValue: ['a', 'b'] }), 0);

    expect(result.defaultValue).toEqual(['b']);
  });

  it('clears a checkbox default that becomes empty', () => {
    const result = removeItemAt(checkboxField({ defaultValue: ['a'] }), 0);

    expect(result.defaultValue).toBeUndefined();
  });

  // An absent key leaves the field's existing default untouched, which is not
  // the same as writing `undefined` over it.
  it('leaves an unrelated default alone by omitting the key', () => {
    const result = removeItemAt(checkboxField({ defaultValue: ['b'] }), 0);

    expect(result).not.toHaveProperty('defaultValue');
  });
});

describe('clearAllItems', () => {
  it('clears the items and the default value together', () => {
    expect(clearAllItems(radioField({ defaultValue: 'a' }))).toEqual({
      items: undefined,
      defaultValue: undefined
    });
  });
});
