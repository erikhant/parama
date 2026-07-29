import type { FormSchema } from '@parama-dev/form-builder-types';
import { describe, expect, it } from 'vitest';
import { hydrateInitialData, toFileDescriptors } from './hydration';

const schema = (fields: any[]): FormSchema => ({
  id: 's',
  version: '1.0.0',
  title: 'T',
  layout: { colSize: 12, gap: 4 },
  fields
});

const textField = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
  id,
  name,
  type: 'text',
  label: name,
  width: 12,
  value: undefined,
  ...extra
});

describe('hydrateInitialData', () => {
  describe('with no data payload', () => {
    it('seeds from each field value', () => {
      const result = hydrateInitialData(schema([textField('f1', 'email', { value: 'a@b.c' })]), {});

      expect(result.formData).toEqual({ f1: 'a@b.c' });
    });

    it('falls back to defaultValue when value is absent', () => {
      const result = hydrateInitialData(schema([textField('f1', 'email', { defaultValue: 'fallback' })]), {});

      expect(result.formData).toEqual({ f1: 'fallback' });
    });

    it('prefers value over defaultValue', () => {
      const field = textField('f1', 'email', { value: 'chosen', defaultValue: 'ignored' });

      expect(hydrateInitialData(schema([field]), {}).formData).toEqual({ f1: 'chosen' });
    });

    it('omits fields with neither value nor defaultValue', () => {
      expect(hydrateInitialData(schema([textField('f1', 'email')]), {}).formData).toEqual({});
    });
  });

  describe('with a data payload', () => {
    it('keys the payload value by field id', () => {
      const result = hydrateInitialData(schema([textField('f1', 'email')]), { email: 'from@data.com' });

      expect(result.formData.f1).toBe('from@data.com');
    });

    it('uses defaultValue when the payload has no matching key', () => {
      const field = textField('f1', 'email', { defaultValue: 'fallback' });

      const result = hydrateInitialData(schema([field]), { unrelated: 1 });

      expect(result.formData.f1).toBe('fallback');
    });

    it('matches a payload key whose id prefix differs but GUID agrees', () => {
      const field = textField('f1', 'email__attr_9f3c');

      const result = hydrateInitialData(schema([field]), { 'email__tax_9f3c': 'matched' });

      expect(result.formData.f1).toBe('matched');
    });

    it('falls back to any key containing the GUID when the base name changed', () => {
      const field = textField('f1', 'email__attr_9f3c');

      const result = hydrateInitialData(schema([field]), { 'renamed__tax_9f3c': 'matched' });

      expect(result.formData.f1).toBe('matched');
    });

    it('prefers an exact name match over a GUID match', () => {
      const field = textField('f1', 'email__attr_9f3c');

      const result = hydrateInitialData(schema([field]), {
        'email__attr_9f3c': 'exact',
        'email__tax_9f3c': 'fuzzy'
      });

      expect(result.formData.f1).toBe('exact');
    });
  });

  describe('file fields', () => {
    const fileField = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
      id,
      name,
      type: 'file',
      label: name,
      width: 12,
      value: undefined,
      options: { accept: {}, server: '' },
      ...extra
    });

    it('collects descriptors under the field name, not its id', () => {
      const result = hydrateInitialData(schema([fileField('f1', 'attachment')]), {
        attachment: [{ url: 'https://cdn/x.pdf', name: 'x.pdf' }]
      });

      expect(result.existingFiles).toEqual({
        attachment: [{ id: undefined, name: 'x.pdf', url: 'https://cdn/x.pdf', size: undefined, type: undefined }]
      });
    });

    it('keeps the value map free of the file placeholder', () => {
      const result = hydrateInitialData(schema([fileField('f1', 'attachment')]), {
        attachment: ['https://cdn/x.pdf']
      });

      expect(result.formData).not.toHaveProperty('f1');
    });

    it('records no existing files when the payload has none', () => {
      expect(hydrateInitialData(schema([fileField('f1', 'attachment')]), { other: 1 }).existingFiles).toEqual({});
    });
  });

  it('produces no values for a schema with no fields', () => {
    expect(hydrateInitialData(schema([]), { loose: 'value' }).formData).toEqual({});
  });
});

describe('toFileDescriptors', () => {
  it('derives a name from the last URL segment of a string', () => {
    expect(toFileDescriptors('https://cdn.example.com/files/report.pdf')).toEqual([
      { name: 'report.pdf', url: 'https://cdn.example.com/files/report.pdf' }
    ]);
  });

  it('passes descriptor-like objects through with defaults', () => {
    expect(toFileDescriptors({ url: 'https://cdn/a', id: '7', size: 12, type: 'image/png' })).toEqual([
      { id: '7', name: 'file', url: 'https://cdn/a', size: 12, type: 'image/png' }
    ]);
  });

  it('maps arrays and drops unusable entries', () => {
    expect(toFileDescriptors(['https://cdn/a.pdf', null, 42])).toEqual([{ name: 'a.pdf', url: 'https://cdn/a.pdf' }]);
  });

  it('returns an empty list for nullish input', () => {
    expect(toFileDescriptors(undefined)).toEqual([]);
    expect(toFileDescriptors(null)).toEqual([]);
  });
});
