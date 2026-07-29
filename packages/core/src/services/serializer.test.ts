import type { FormField, FormSchema } from '@parama-dev/form-builder-types';
import { describe, expect, it } from 'vitest';
import { serializeById, serializeByNames, type SerializerContext } from './serializer';

const schemaOf = (fields: any[]): FormSchema => ({
  id: 's',
  version: '1.0.0',
  title: 'T',
  layout: { colSize: 12, gap: 4 },
  fields
});

const text = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
  id,
  name,
  type: 'text',
  label: name,
  width: 12,
  value: undefined,
  ...extra
});

const fileField = (id: string, name: string) => ({
  id,
  name,
  type: 'file',
  label: name,
  width: 12,
  value: undefined,
  options: { accept: {}, server: '' }
});

const contextFor = (fields: any[], formData: Record<string, any>, fileData = new FormData()): SerializerContext => {
  const schema = schemaOf(fields);
  return {
    schema,
    formData,
    fileData,
    resolveField: (key) =>
      schema.fields.find((f) => f.id === key) ??
      schema.fields.find((f) => 'name' in f && (f as { name: string }).name === key)
  };
};

const file = (name: string) => new File(['x'], name, { type: 'text/plain' });

const entriesOf = (data: FormData): Array<[string, unknown]> => {
  const out: Array<[string, unknown]> = [];
  data.forEach((value, key) => out.push([key, value]));
  return out;
};

describe('serializeByNames', () => {
  describe('as JSON (no files)', () => {
    it('keys values by field name', () => {
      const ctx = contextFor([text('f1', 'email')], { f1: 'a@b.c' });

      expect(serializeByNames(ctx)).toEqual({ email: 'a@b.c' });
    });

    it('omits fields with no value', () => {
      const ctx = contextFor([text('f1', 'email'), text('f2', 'phone')], { f1: 'a@b.c' });

      expect(serializeByNames(ctx)).toEqual({ email: 'a@b.c' });
    });

    it('skips buttons and blocks, which carry no name', () => {
      const button = { id: 'b1', type: 'submit', action: 'submit', label: 'Go', width: 12 } as unknown as FormField;
      const ctx = contextFor([text('f1', 'email'), button], { f1: 'a@b.c' });

      expect(serializeByNames(ctx)).toEqual({ email: 'a@b.c' });
    });

    it('suffixes the field id onto a duplicate name', () => {
      const ctx = contextFor([text('f1', 'email'), text('f2', 'email')], { f1: 'first', f2: 'second' });

      expect(serializeByNames(ctx)).toEqual({ email: 'first', email_f2: 'second' });
    });

    it('applies a transformer template', () => {
      const ctx = contextFor([text('f1', 'email', { transformer: '{{email}}' })], { f1: 'a@b.c' });

      expect(serializeByNames(ctx)).toEqual({ email: '"a@b.c"' });
    });
  });

  describe('as FormData (files present)', () => {
    it('carries files across under the field name', () => {
      const data = new FormData();
      data.append('doc', file('a.pdf'));
      const ctx = contextFor([fileField('f1', 'doc')], {}, data);

      const result = serializeByNames(ctx) as FormData;

      expect(result).toBeInstanceOf(FormData);
      expect(entriesOf(result).map(([key]) => key)).toEqual(['doc']);
    });

    it('JSON-encodes non-file values alongside the files', () => {
      const data = new FormData();
      data.append('doc', file('a.pdf'));
      const ctx = contextFor([fileField('f1', 'doc'), text('f2', 'email')], { f2: 'a@b.c' }, data);

      const result = serializeByNames(ctx) as FormData;

      expect(result.get('email')).toBe('"a@b.c"');
    });

    // BUG 5: the FormData path used to reserve a name for every named field,
    // including value-less ones, while the JSON path only reserved names for
    // fields that emit. The same form therefore produced different keys
    // depending on whether it happened to contain a file.
    it('allocates duplicate-name suffixes the same way the JSON path does', () => {
      const withFile = new FormData();
      withFile.append('doc', file('a.pdf'));

      const fields = [
        fileField('f0', 'doc'),
        text('f1', 'email'), // no value — must not consume the "email" name
        text('f2', 'email')
      ];

      const asFormData = serializeByNames(contextFor(fields, { f2: 'second' }, withFile)) as FormData;
      const asJson = serializeByNames(contextFor(fields, { f2: 'second' })) as Record<string, any>;

      expect(Object.keys(asJson)).toEqual(['email']);
      expect(entriesOf(asFormData).map(([key]) => key)).toEqual(['doc', 'email']);
    });

    it('does not reserve a name for a file field holding no files', () => {
      const withFile = new FormData();
      withFile.append('other', file('a.pdf'));

      const fields = [fileField('f0', 'doc'), fileField('f1', 'other'), text('f2', 'doc')];

      const result = serializeByNames(contextFor(fields, { f2: 'text-value' }, withFile)) as FormData;

      expect(entriesOf(result).map(([key]) => key).sort()).toEqual(['doc', 'other']);
    });
  });
});

describe('serializeById', () => {
  it('returns the raw value map when no files are present', () => {
    const formData = { f1: 'a@b.c' };

    expect(serializeById(formData, new FormData())).toBe(formData);
  });

  it('merges values and files into FormData when files are present', () => {
    const files = new FormData();
    files.append('doc', file('a.pdf'));

    const result = serializeById({ f1: 'a@b.c' }, files) as FormData;

    expect(result).toBeInstanceOf(FormData);
    expect(result.get('f1')).toBe('a@b.c');
    expect(result.get('doc')).toBeInstanceOf(File);
  });

  it('skips null and undefined values', () => {
    const files = new FormData();
    files.append('doc', file('a.pdf'));

    const result = serializeById({ a: null, b: undefined, c: 'kept' }, files) as FormData;

    expect(result.has('a')).toBe(false);
    expect(result.has('b')).toBe(false);
    expect(result.get('c')).toBe('kept');
  });
});
