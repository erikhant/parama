import { describe, expect, it } from 'vitest';
import { buildAcceptMap, FILE_TYPE_OPTIONS, selectedMimeTypes } from './fileTypes';

describe('FILE_TYPE_OPTIONS', () => {
  it('gives every entry a label and a value', () => {
    expect(FILE_TYPE_OPTIONS.every((option) => option.value && option.label)).toBe(true);
  });

  it('has no duplicate mime values', () => {
    const values = FILE_TYPE_OPTIONS.map((option) => option.value);

    expect(new Set(values).size).toBe(values.length);
  });
});

describe('buildAcceptMap', () => {
  it('maps each selected mime type to its extensions', () => {
    expect(buildAcceptMap(['application/pdf'])).toEqual({ 'application/pdf': ['.pdf'] });
  });

  it('includes every selected type', () => {
    const result = buildAcceptMap(['image/png', 'text/plain']);

    expect(Object.keys(result).sort()).toEqual(['image/png', 'text/plain']);
  });

  it('skips a mime type that is not in the catalogue', () => {
    expect(buildAcceptMap(['application/unknown-type'])).toEqual({});
  });

  it('returns an empty map for an empty selection', () => {
    expect(buildAcceptMap([])).toEqual({});
  });

  it('expands a wildcard type to its full extension list', () => {
    const result = buildAcceptMap(['image/*']);

    expect(result['image/*']).toContain('.png');
    expect(result['image/*']).toContain('.jpg');
  });
});

describe('selectedMimeTypes', () => {
  it('reads the mime keys back out of an accept map', () => {
    expect(selectedMimeTypes({ 'application/pdf': ['.pdf'], 'image/png': ['.png'] })).toEqual([
      'application/pdf',
      'image/png'
    ]);
  });

  it('returns an empty list when nothing is configured', () => {
    expect(selectedMimeTypes(undefined)).toEqual([]);
    expect(selectedMimeTypes({})).toEqual([]);
  });

  it('round-trips through buildAcceptMap', () => {
    const chosen = ['image/png', 'application/pdf'];

    expect(selectedMimeTypes(buildAcceptMap(chosen)).sort()).toEqual([...chosen].sort());
  });
});
