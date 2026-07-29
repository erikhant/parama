import type { ButtonField, CheckboxField, DateField, FileField, SelectField } from '@parama-dev/form-builder-types';
import { describe, expect, it } from 'vitest';
import { createField } from './fieldFactory';

describe('createField', () => {
  describe('identity', () => {
    // Ids were previously `field-${Date.now()}`, so two fields dropped inside
    // the same millisecond collided — and `insertField` silently rejects a
    // duplicate id, so the second drop did nothing.
    it('gives consecutive fields distinct ids', () => {
      const ids = Array.from({ length: 50 }, () => createField('text').id);

      expect(new Set(ids).size).toBe(50);
    });

    it('gives nested items distinct ids too', () => {
      const field = createField('checkbox') as CheckboxField;
      const ids = field.items.map((item) => item.id);

      expect(new Set(ids).size).toBe(field.items.length);
    });
  });

  describe('defaults shared by input fields', () => {
    it('spans the full grid', () => {
      expect(createField('text').width).toBe(12);
    });

    it('names the field after its type', () => {
      expect(createField('text')).toMatchObject({ name: 'name_text' });
    });

    it('names a file field plainly', () => {
      expect(createField('file')).toMatchObject({ name: 'file' });
    });

    it('labels a hidden field distinctly, since it has no visible label', () => {
      expect(createField('hidden')).toMatchObject({ label: 'Hidden input' });
      expect(createField('text')).toMatchObject({ label: 'Text label' });
    });
  });

  describe('choice fields', () => {
    it.each(['checkbox', 'radio'])('seeds %s with three items', (type) => {
      const field = createField(type) as CheckboxField;

      expect(field.items).toHaveLength(3);
      expect(field.items[0]).toMatchObject({ label: 'Item 1', value: 'item-1' });
    });
  });

  describe('option fields', () => {
    it.each(['select', 'multiselect', 'autocomplete'])('seeds %s with three options', (type) => {
      const field = createField(type) as SelectField;

      expect(field.options).toHaveLength(3);
      expect(field.options[0]).toMatchObject({ label: 'Option 1', value: 'option-1' });
    });

    it('enables filtering by default', () => {
      expect(createField('autocomplete')).toMatchObject({ shouldFilter: true });
    });
  });

  describe('date fields', () => {
    it('defaults to single selection with a day-first format', () => {
      const field = createField('date') as DateField;

      expect(field.mode).toBe('single');
      expect(field.options?.dateFormat).toBe('dd/MM/yyyy');
    });
  });

  describe('file fields', () => {
    it('defaults to a single 5 MB upload', () => {
      const field = createField('file') as FileField;

      expect(field.options.multiple).toBe(false);
      expect(field.options.maxSize).toBe(5 * 1024 * 1024);
    });

    it('accepts images, PDFs and plain text out of the box', () => {
      const field = createField('file') as FileField;

      expect(Object.keys(field.options.accept).sort()).toEqual(['application/pdf', 'image/*', 'text/plain']);
    });
  });

  describe('buttons', () => {
    it.each(['button', 'submit', 'reset'])('creates %s as a submit action', (type) => {
      const field = createField(type) as ButtonField;

      expect(field).toMatchObject({ label: 'Submit', action: 'submit', width: 2, widthMobile: 4 });
    });

    it('carries no name, since a button submits nothing', () => {
      expect(createField('submit')).not.toHaveProperty('name');
    });
  });

  describe('presentational blocks', () => {
    it('seeds a block with placeholder markup', () => {
      const field = createField('block') as any;

      expect(field.height).toBe(3);
      expect(field.content).toContain('Custom HTML Block');
    });

    it('seeds a spacer with no content', () => {
      const field = createField('spacer') as any;

      expect(field.height).toBe(2);
      expect(field.content).toBe('');
    });
  });

  it('falls back to a plain input for an unknown type', () => {
    expect(createField('exotic')).toMatchObject({ type: 'exotic', width: 12, transformer: '' });
  });
});
