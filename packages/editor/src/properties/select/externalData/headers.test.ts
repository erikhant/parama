import { describe, expect, it } from 'vitest';
import { addHeaderRow, removeHeaderRow, toHeaderList, toHeaderMap, updateHeaderRow } from './headers';

describe('toHeaderList', () => {
  it('turns a header map into editable rows', () => {
    const rows = toHeaderList({ Authorization: 'Bearer x' });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ key: 'Authorization', value: 'Bearer x' });
  });

  it('gives every row a distinct id', () => {
    const rows = toHeaderList({ a: '1', b: '2', c: '3' });

    expect(new Set(rows.map((row) => row.id)).size).toBe(3);
  });

  it('returns an empty list for no headers', () => {
    expect(toHeaderList(undefined)).toEqual([]);
    expect(toHeaderList({})).toEqual([]);
  });
});

describe('toHeaderMap', () => {
  it('collapses rows into a map', () => {
    const rows = [
      { id: '1', key: 'Accept', value: 'application/json' },
      { id: '2', key: 'X-Tenant', value: 'acme' }
    ];

    expect(toHeaderMap(rows)).toEqual({ Accept: 'application/json', 'X-Tenant': 'acme' });
  });

  // A half-typed row is normal while the author is still editing; emitting it
  // would put an empty header name into the request.
  it('skips rows with a blank key', () => {
    const rows = [
      { id: '1', key: '', value: 'orphan' },
      { id: '2', key: '   ', value: 'whitespace' },
      { id: '3', key: 'Kept', value: 'yes' }
    ];

    expect(toHeaderMap(rows)).toEqual({ Kept: 'yes' });
  });

  it('keeps a row whose value is blank', () => {
    expect(toHeaderMap([{ id: '1', key: 'X-Empty', value: '' }])).toEqual({ 'X-Empty': '' });
  });

  it('lets a later row win a duplicate key', () => {
    const rows = [
      { id: '1', key: 'Accept', value: 'first' },
      { id: '2', key: 'Accept', value: 'second' }
    ];

    expect(toHeaderMap(rows)).toEqual({ Accept: 'second' });
  });

  it('round-trips through toHeaderList', () => {
    const map = { Authorization: 'Bearer x', Accept: 'application/json' };

    expect(toHeaderMap(toHeaderList(map))).toEqual(map);
  });
});

describe('addHeaderRow', () => {
  it('appends a blank row', () => {
    const result = addHeaderRow([{ id: '1', key: 'a', value: 'b' }]);

    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({ key: '', value: '' });
  });

  it('does not mutate the input', () => {
    const rows = [{ id: '1', key: 'a', value: 'b' }];

    addHeaderRow(rows);

    expect(rows).toHaveLength(1);
  });
});

describe('updateHeaderRow', () => {
  it('changes one property of the addressed row', () => {
    const rows = [{ id: '1', key: 'a', value: 'b' }];

    expect(updateHeaderRow(rows, '1', 'value', 'changed')[0]).toMatchObject({ key: 'a', value: 'changed' });
  });

  it('leaves other rows untouched by identity', () => {
    const rows = [
      { id: '1', key: 'a', value: 'b' },
      { id: '2', key: 'c', value: 'd' }
    ];

    expect(updateHeaderRow(rows, '1', 'key', 'z')[1]).toBe(rows[1]);
  });
});

describe('removeHeaderRow', () => {
  it('drops the row with the given id', () => {
    const rows = [
      { id: '1', key: 'a', value: 'b' },
      { id: '2', key: 'c', value: 'd' }
    ];

    expect(removeHeaderRow(rows, '1').map((row) => row.id)).toEqual(['2']);
  });
});
