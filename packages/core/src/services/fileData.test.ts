import { describe, expect, it } from 'vitest';
import { cloneFormData, hasEntries, readFiles, toFileList, withFiles, withoutKey } from './fileData';

const file = (name: string) => new File(['x'], name, { type: 'text/plain' });

const formDataWith = (entries: Array<[string, File]>): FormData => {
  const data = new FormData();
  entries.forEach(([key, value]) => data.append(key, value));
  return data;
};

describe('fileData', () => {
  describe('withoutKey', () => {
    it('drops every entry under the given key', () => {
      const source = formDataWith([
        ['avatar', file('a.txt')],
        ['docs', file('b.txt')],
        ['docs', file('c.txt')]
      ]);

      const result = withoutKey(source, 'docs');

      expect(readFiles(result, 'docs')).toEqual([]);
      expect(readFiles(result, 'avatar')).toHaveLength(1);
    });

    it('returns a new instance without mutating the source', () => {
      const source = formDataWith([['docs', file('a.txt')]]);

      const result = withoutKey(source, 'docs');

      expect(result).not.toBe(source);
      expect(readFiles(source, 'docs')).toHaveLength(1);
    });
  });

  describe('withFiles', () => {
    it('replaces the key contents rather than appending to them', () => {
      const source = formDataWith([['docs', file('old.txt')]]);

      const result = withFiles(source, 'docs', [file('new.txt')]);

      expect(readFiles(result, 'docs').map((f) => f.name)).toEqual(['new.txt']);
    });

    it('clears the key when given an empty list', () => {
      const source = formDataWith([['docs', file('old.txt')]]);

      expect(readFiles(withFiles(source, 'docs', []), 'docs')).toEqual([]);
    });

    it('leaves other keys untouched', () => {
      const source = formDataWith([
        ['avatar', file('a.txt')],
        ['docs', file('b.txt')]
      ]);

      const result = withFiles(source, 'docs', [file('c.txt')]);

      expect(readFiles(result, 'avatar').map((f) => f.name)).toEqual(['a.txt']);
    });
  });

  describe('readFiles', () => {
    it('returns files under the key in insertion order', () => {
      const source = formDataWith([
        ['docs', file('1.txt')],
        ['docs', file('2.txt')]
      ]);

      expect(readFiles(source, 'docs').map((f) => f.name)).toEqual(['1.txt', '2.txt']);
    });

    it('returns an empty array for an unknown key', () => {
      expect(readFiles(new FormData(), 'nope')).toEqual([]);
    });
  });

  describe('hasEntries', () => {
    it('is false for an empty container', () => {
      expect(hasEntries(new FormData())).toBe(false);
    });

    it('is true once a file is present', () => {
      expect(hasEntries(formDataWith([['docs', file('a.txt')]]))).toBe(true);
    });
  });

  describe('toFileList', () => {
    it('wraps a lone File', () => {
      const single = file('a.txt');
      expect(toFileList(single)).toEqual([single]);
    });

    it('filters non-File entries out of an array', () => {
      const keep = file('a.txt');
      expect(toFileList([keep, 'not-a-file', null, undefined])).toEqual([keep]);
    });

    it('returns an empty list for nullish input', () => {
      expect(toFileList(undefined)).toEqual([]);
      expect(toFileList(null)).toEqual([]);
    });
  });

  describe('cloneFormData', () => {
    it('copies all entries into a detached instance', () => {
      const source = formDataWith([['docs', file('a.txt')]]);

      const result = cloneFormData(source);

      expect(result).not.toBe(source);
      expect(readFiles(result, 'docs')).toHaveLength(1);
    });
  });
});
