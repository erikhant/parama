import type { Events, FormField, FormSchema } from '@parama-dev/form-builder-types';
import { describe, expect, it } from 'vitest';
import {
  appendEvent,
  blankEvent,
  eventsOf,
  isEventComplete,
  removeEventAt,
  resolveTargetLabel,
  targetsFor,
  updateEventAt
} from './eventMutations';

const event = (overrides: Partial<Events> = {}): Events => ({
  type: 'setValue',
  target: 'other',
  params: { value: 'x' },
  ...overrides
});

const field = (id: string, type: string): FormField =>
  ({ id, name: `name_${id}`, type, label: id, width: 12 }) as FormField;

const schema = (fields: FormField[]): FormSchema => ({
  id: 's',
  version: '1.0.0',
  title: 'T',
  layout: { colSize: 12, gap: 4 },
  fields
});

describe('eventsOf', () => {
  it('reads the event list off a field', () => {
    const source = { ...field('a', 'text'), events: [event()] } as FormField;

    expect(eventsOf(source)).toHaveLength(1);
  });

  it('returns an empty list for a field with no events', () => {
    expect(eventsOf(field('a', 'text'))).toEqual([]);
  });

  it('returns an empty list for a field type that cannot carry events', () => {
    expect(eventsOf({ id: 'b', type: 'block', width: 12 } as FormField)).toEqual([]);
  });
});

describe('appendEvent', () => {
  it('adds to the end of the list', () => {
    const source = { ...field('a', 'text'), events: [event({ target: 'first' })] } as FormField;

    const result = appendEvent(source, event({ target: 'second' }));

    expect(result.map((e) => e.target)).toEqual(['first', 'second']);
  });

  it('starts the list when the field has none', () => {
    expect(appendEvent(field('a', 'text'), event())).toHaveLength(1);
  });

  it('does not mutate the existing list', () => {
    const existing = [event()];
    const source = { ...field('a', 'text'), events: existing } as FormField;

    appendEvent(source, event({ target: 'new' }));

    expect(existing).toHaveLength(1);
  });
});

describe('updateEventAt', () => {
  it('merges the patch into the addressed event', () => {
    const source = { ...field('a', 'text'), events: [event({ target: 'one' })] } as FormField;

    expect(updateEventAt(source, 0, { target: 'two' })[0]).toMatchObject({ type: 'setValue', target: 'two' });
  });

  it('leaves other events untouched', () => {
    const source = {
      ...field('a', 'text'),
      events: [event({ target: 'one' }), event({ target: 'two' })]
    } as FormField;

    expect(updateEventAt(source, 0, { target: 'changed' })[1].target).toBe('two');
  });
});

describe('removeEventAt', () => {
  it('drops the event at the index', () => {
    const source = {
      ...field('a', 'text'),
      events: [event({ target: 'one' }), event({ target: 'two' })]
    } as FormField;

    expect(removeEventAt(source, 0).map((e) => e.target)).toEqual(['two']);
  });
});

describe('targetsFor', () => {
  const fields = [
    field('self', 'text'),
    field('other', 'text'),
    field('picker', 'select'),
    field('multi', 'multiselect'),
    field('auto', 'autocomplete')
  ];

  it('excludes the field the event belongs to', () => {
    const targets = targetsFor(schema(fields), 'self', 'setValue');

    expect(targets.map((f) => f.id)).not.toContain('self');
  });

  it('offers every other field for setValue', () => {
    expect(targetsFor(schema(fields), 'self', 'setValue')).toHaveLength(4);
  });

  it('offers every other field for reset', () => {
    expect(targetsFor(schema(fields), 'self', 'reset')).toHaveLength(4);
  });

  // Only option-backed fields have anything to refetch.
  it('offers only option-backed fields for fetch', () => {
    const targets = targetsFor(schema(fields), 'self', 'fetch');

    expect(targets.map((f) => f.id).sort()).toEqual(['auto', 'multi', 'picker']);
  });
});

describe('resolveTargetLabel', () => {
  const fields = [field('self', 'text'), field('other', 'text')];

  it('shows the target field name', () => {
    expect(resolveTargetLabel(schema(fields), 'other')).toBe('name_other');
  });

  it('falls back to the raw target when the field is gone', () => {
    expect(resolveTargetLabel(schema(fields), 'deleted-id')).toBe('deleted-id');
  });
});

describe('isEventComplete', () => {
  it('requires a target', () => {
    expect(isEventComplete({ type: 'reset', target: '' })).toBe(false);
    expect(isEventComplete({ type: 'reset', target: 'other' })).toBe(true);
  });

  it('additionally requires a value for setValue', () => {
    expect(isEventComplete({ type: 'setValue', target: 'other', params: { value: '' } })).toBe(false);
    expect(isEventComplete({ type: 'setValue', target: 'other', params: { value: '5' } })).toBe(true);
  });

  it('does not require a value for fetch', () => {
    expect(isEventComplete({ type: 'fetch', target: 'picker' })).toBe(true);
  });
});

describe('blankEvent', () => {
  it('starts as an incomplete setValue event', () => {
    const draft = blankEvent();

    expect(draft.type).toBe('setValue');
    expect(isEventComplete(draft)).toBe(false);
  });
});
