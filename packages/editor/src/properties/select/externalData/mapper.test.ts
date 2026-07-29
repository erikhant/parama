import type { ExternalDataSource, FieldGroupItem } from '@parama-dev/form-builder-types';
import { describe, expect, it } from 'vitest';
import { isValidApiUrl, MAPPER_FIELDS, readMapperField, withMapperField } from './mapper';

const source = (overrides: Partial<ExternalDataSource<FieldGroupItem>> = {}): ExternalDataSource<FieldGroupItem> => ({
  url: 'https://api.example.com/items',
  ...overrides
});

describe('MAPPER_FIELDS', () => {
  it('describes the source path plus the four option properties', () => {
    expect(MAPPER_FIELDS.map((entry) => entry.key)).toEqual(['dataSource', 'id', 'label', 'value', 'description']);
  });

  it('gives every entry a label, hint and placeholder', () => {
    expect(MAPPER_FIELDS.every((entry) => entry.label && entry.hint && entry.placeholder)).toBe(true);
  });
});

describe('withMapperField', () => {
  it('sets the data source path', () => {
    const result = withMapperField(source(), 'dataSource', 'data.items');

    expect(result.mapper?.dataSource).toBe('data.items');
  });

  it('sets an option property inside dataMapper', () => {
    const result = withMapperField(source(), 'label', 'name');

    expect(result.mapper?.dataMapper).toMatchObject({ label: 'name' });
  });

  it('preserves the data source when an option property changes', () => {
    const withSource = withMapperField(source(), 'dataSource', 'data.items');

    const result = withMapperField(withSource, 'id', 'code');

    expect(result.mapper?.dataSource).toBe('data.items');
    expect(result.mapper?.dataMapper).toMatchObject({ id: 'code' });
  });

  it('preserves sibling option properties', () => {
    let result = withMapperField(source(), 'id', 'code');
    result = withMapperField(result, 'label', 'name');

    expect(result.mapper?.dataMapper).toMatchObject({ id: 'code', label: 'name' });
  });

  it('keeps the rest of the data source intact', () => {
    const result = withMapperField(source({ headers: { Accept: 'application/json' } }), 'value', 'code');

    expect(result.url).toBe('https://api.example.com/items');
    expect(result.headers).toEqual({ Accept: 'application/json' });
  });

  it('defaults the data source to an empty string when unset', () => {
    expect(withMapperField(source(), 'id', 'code').mapper?.dataSource).toBe('');
  });

  it('does not mutate the input', () => {
    const original = source();

    withMapperField(original, 'id', 'code');

    expect(original.mapper).toBeUndefined();
  });
});

describe('readMapperField', () => {
  it('reads the data source path', () => {
    expect(readMapperField(withMapperField(source(), 'dataSource', 'items'), 'dataSource')).toBe('items');
  });

  it('reads an option property', () => {
    expect(readMapperField(withMapperField(source(), 'label', 'name'), 'label')).toBe('name');
  });

  it('returns an empty string when nothing is configured', () => {
    expect(readMapperField(source(), 'id')).toBe('');
    expect(readMapperField(source(), 'dataSource')).toBe('');
  });
});

describe('isValidApiUrl', () => {
  it.each([
    ['https with a domain', 'https://api.example.com/data', true],
    ['http with a domain', 'http://api.example.com', true],
    ['a port', 'https://api.example.com:8443/v1', true],
    ['localhost', 'http://localhost:3000/api', true],
    ['a loopback address', 'http://127.0.0.1:8080', true]
  ])('accepts %s', (_label, url, expected) => {
    expect(isValidApiUrl(url)).toBe(expected);
  });

  it.each([
    ['an empty string', ''],
    ['a bare domain with no scheme', 'api.example.com'],
    ['an unsupported scheme', 'ftp://api.example.com'],
    ['a relative path', '/api/data'],
    ['a single-label host', 'https://localhostx']
  ])('rejects %s', (_label, url) => {
    expect(isValidApiUrl(url)).toBe(false);
  });
});
