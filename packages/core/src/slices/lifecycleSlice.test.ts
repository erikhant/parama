import { beforeEach, describe, expect, it } from 'vitest';
import { buildSchema, resetFormBuilder, storeActions, storeState } from '../testing/storeHarness';

describe('initialize', () => {
  beforeEach(() => {
    resetFormBuilder();
  });

  it('marks every field visible', () => {
    storeActions().initialize({
      schema: buildSchema([
        { id: 'a', name: 'a', type: 'text' },
        { id: 'b', name: 'b', type: 'text' }
      ])
    });

    expect([...storeState().visibleFields].sort()).toEqual(['a', 'b']);
  });

  it('seeds a pristine validation state per field', () => {
    storeActions().initialize({ schema: buildSchema([{ id: 'a', name: 'a', type: 'text' }]) });

    expect(storeActions().getFieldValidation('a')).toEqual({
      isValid: true,
      isPending: false,
      messages: [],
      lastValidated: 0
    });
  });

  it('normalises nullish variables to an object', () => {
    storeActions().initialize({
      schema: buildSchema([{ id: 'a', name: 'a', type: 'text' }]),
      variables: undefined
    });

    expect(storeActions().getVariables()).toEqual({});
  });

  // BUG 4: `formData` was seeded as a copy of the caller's name-keyed payload
  // and then had id-keyed entries layered on top, so it carried both keyings at
  // once. `getFormData()` documents itself as returning id-keyed data, and
  // expression interpolation only ever reads ids.
  it('keys form data by field id only', () => {
    storeActions().initialize({
      schema: buildSchema([{ id: 'f1', name: 'email', type: 'text' }]),
      data: { email: 'a@b.c' }
    });

    expect(storeState().formData).toEqual({ f1: 'a@b.c' });
  });

  it('does not retain payload keys that match no field', () => {
    storeActions().initialize({
      schema: buildSchema([{ id: 'f1', name: 'email', type: 'text' }]),
      data: { email: 'a@b.c', strayKey: 'unused' }
    });

    expect(storeState().formData).not.toHaveProperty('strayKey');
  });

  it('is idempotent when re-run with the same inputs', () => {
    const schema = buildSchema([{ id: 'f1', name: 'email', type: 'text' }]);

    storeActions().initialize({ schema, data: { email: 'a@b.c' } });
    const first = storeState().formData;

    storeActions().initialize({ schema, data: { email: 'a@b.c' } });

    expect(storeState().formData).toEqual(first);
  });

  it('clears values carried over from a previous schema', () => {
    storeActions().initialize({
      schema: buildSchema([{ id: 'old', name: 'old', type: 'text' }]),
      data: { old: 'stale' }
    });

    storeActions().initialize({ schema: buildSchema([{ id: 'fresh', name: 'fresh', type: 'text' }]) });

    expect(storeState().formData).toEqual({});
  });
});
