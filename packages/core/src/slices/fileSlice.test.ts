import { beforeEach, describe, expect, it } from 'vitest';
import { buildSchema, resetFormBuilder, storeActions, storeState } from '../testing/storeHarness';

const file = (name: string) => new File(['x'], name, { type: 'text/plain' });

const fileField = (id: string, name: string, options: Record<string, unknown> = {}) => ({
  id,
  name,
  type: 'file' as const,
  label: name,
  width: 12,
  options: { accept: {}, server: '', ...options }
});

const initWith = (fields: any[]) => {
  storeActions().initialize({ schema: buildSchema(fields) });
};

describe('file field actions', () => {
  beforeEach(() => {
    resetFormBuilder();
  });

  describe('addFileField', () => {
    it('stores a file for a single-file field', () => {
      initWith([fileField('doc', 'document')]);

      expect(storeActions().addFileField('doc', file('a.pdf'))).toBe(true);
      expect(storeActions().getFieldFiles('doc').map((f) => f.name)).toEqual(['a.pdf']);
    });

    it('replaces the existing file on a single-file field', () => {
      initWith([fileField('doc', 'document')]);

      storeActions().addFileField('doc', file('a.pdf'));
      storeActions().addFileField('doc', file('b.pdf'));

      expect(storeActions().getFieldFiles('doc').map((f) => f.name)).toEqual(['b.pdf']);
    });

    it('accumulates files on a multiple-file field', () => {
      initWith([fileField('doc', 'document', { multiple: true })]);

      storeActions().addFileField('doc', file('a.pdf'));
      storeActions().addFileField('doc', file('b.pdf'));

      expect(storeActions().getFieldFiles('doc').map((f) => f.name)).toEqual(['a.pdf', 'b.pdf']);
    });

    it('refuses a file that would exceed maxFiles', () => {
      initWith([fileField('doc', 'document', { multiple: true, maxFiles: 1 })]);

      storeActions().addFileField('doc', file('a.pdf'));

      expect(storeActions().addFileField('doc', file('b.pdf'))).toBe(false);
      expect(storeActions().getFieldFiles('doc')).toHaveLength(1);
    });

    it('returns false for a field that is not a file field', () => {
      initWith([{ id: 'txt', name: 'txt', type: 'text' }]);

      expect(storeActions().addFileField('txt', file('a.pdf'))).toBe(false);
    });
  });

  describe('removeFileField', () => {
    it('removes one file from a multiple-file field', () => {
      initWith([fileField('doc', 'document', { multiple: true })]);
      storeActions().addFileField('doc', file('a.pdf'));
      storeActions().addFileField('doc', file('b.pdf'));

      expect(storeActions().removeFileField('doc', 0)).toBe(true);
      expect(storeActions().getFieldFiles('doc').map((f) => f.name)).toEqual(['b.pdf']);
    });

    // BUG 2: removal routed through `updateFieldValue` with an empty array,
    // which the single-file branch treated as "nothing to set" and ignored, so
    // the last file could never be cleared.
    it('removes the only file from a single-file field', () => {
      initWith([fileField('doc', 'document')]);
      storeActions().addFileField('doc', file('a.pdf'));

      expect(storeActions().removeFileField('doc', 0)).toBe(true);
      expect(storeActions().getFieldFiles('doc')).toEqual([]);
    });

    it('rejects an out-of-range index', () => {
      initWith([fileField('doc', 'document', { multiple: true })]);
      storeActions().addFileField('doc', file('a.pdf'));

      expect(storeActions().removeFileField('doc', 5)).toBe(false);
      expect(storeActions().getFieldFiles('doc')).toHaveLength(1);
    });
  });

  describe('immutability', () => {
    it('publishes a new FormData instance on every write', () => {
      initWith([fileField('doc', 'document', { multiple: true })]);
      const before = storeState().fileData;

      storeActions().addFileField('doc', file('a.pdf'));

      expect(storeState().fileData).not.toBe(before);
    });
  });

  describe('existing files', () => {
    it('exposes pre-existing file metadata by field name', () => {
      storeActions().initialize({
        schema: buildSchema([fileField('doc', 'document')]),
        data: { document: ['https://cdn/a.pdf'] }
      });

      expect(storeActions().getExistingFiles('doc')).toEqual([{ name: 'a.pdf', url: 'https://cdn/a.pdf' }]);
    });

    it('removes one existing file entry by index', () => {
      storeActions().initialize({
        schema: buildSchema([fileField('doc', 'document')]),
        data: { document: ['https://cdn/a.pdf', 'https://cdn/b.pdf'] }
      });

      expect(storeActions().removeExistingFileMeta('doc', 0)).toBe(true);
      expect(storeActions().getExistingFiles('doc').map((f) => f.name)).toEqual(['b.pdf']);
    });
  });
});
