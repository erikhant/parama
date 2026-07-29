import { describe, expect, it } from 'vitest';
import { mapResponseToOptions } from './optionsMapper';

describe('mapResponseToOptions', () => {
  describe('without a mapper', () => {
    it('turns a string array into self-referencing options', () => {
      const [first] = mapResponseToOptions(['Alpha'], undefined);

      expect(first).toMatchObject({ label: 'Alpha', value: 'Alpha' });
      expect(first.id).toEqual(expect.any(String));
    });

    it('infers id, label and value from conventional property names', () => {
      const result = mapResponseToOptions([{ id: 7, name: 'Jakarta' }], undefined);

      expect(result).toEqual([{ id: '7', label: 'Jakarta', value: '7' }]);
    });

    it('prefers label over name when both are present', () => {
      const result = mapResponseToOptions([{ id: 1, label: 'Preferred', name: 'Ignored' }], undefined);

      expect(result[0].label).toBe('Preferred');
    });

    it('falls back to a positional label when nothing usable exists', () => {
      const result = mapResponseToOptions([{ unrelated: null }], undefined);

      expect(result).toEqual([{ id: '0', label: 'Option 1', value: '0' }]);
    });

    it('stringifies primitives that are not strings', () => {
      expect(mapResponseToOptions([42, true], undefined).map((o) => o.value)).toEqual(['42', 'true']);
    });
  });

  describe('with a mapper', () => {
    const mapper = { dataSource: 'result.items', dataMapper: { id: 'code', label: 'title', value: 'code' } } as any;

    it('reads the option array from the dataSource path', () => {
      const response = { result: { items: [{ code: 'JK', title: 'Jakarta' }] } };

      expect(mapResponseToOptions(response, mapper)).toEqual([{ id: 'JK', label: 'Jakarta', value: 'JK' }]);
    });

    it('resolves nested property paths', () => {
      const nested = { dataMapper: { id: 'meta.id', label: 'meta.name', value: 'meta.id' } } as any;

      const result = mapResponseToOptions([{ meta: { id: 'x', name: 'Ex' } }], nested);

      expect(result).toEqual([{ id: 'x', label: 'Ex', value: 'x' }]);
    });

    it('falls back to the value field when the label path misses', () => {
      const result = mapResponseToOptions([{ code: 'JK' }], mapper);

      expect(result[0].label).toBe('JK');
    });

    it('uses the whole response when the dataSource path does not resolve', () => {
      const missing = { dataSource: 'no.such.path', dataMapper: { id: 'code', label: 'code', value: 'code' } } as any;

      expect(mapResponseToOptions([{ code: 'A' }], missing)).toEqual([{ id: 'A', label: 'A', value: 'A' }]);
    });
  });

  describe('malformed responses', () => {
    it('wraps a non-array response in an array', () => {
      expect(mapResponseToOptions({ id: 1, name: 'Solo' }, undefined)).toHaveLength(1);
    });

    it('returns an empty list rather than throwing on null', () => {
      expect(mapResponseToOptions(null, undefined)).toEqual([{ id: expect.any(String), label: 'null', value: 'null' }]);
    });
  });
});
