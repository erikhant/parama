import { beforeEach, describe, expect, it } from 'vitest';
import { buildSchema, resetFormBuilder, storeActions, storeState } from '../testing/storeHarness';

const required = (message = 'Required') => ({ type: 'required' as const, message });

describe('validation actions', () => {
  beforeEach(() => {
    resetFormBuilder();
  });

  describe('validateField', () => {
    it('records the failure message for an empty required field', async () => {
      storeActions().initialize({
        schema: buildSchema([{ id: 'f1', name: 'email', type: 'text', validations: [required('Email is required')] }])
      });

      const isValid = await storeActions().validateField('f1');

      expect(isValid).toBe(false);
      expect(storeActions().getFieldValidation('f1')).toMatchObject({
        isValid: false,
        isPending: false,
        messages: ['Email is required']
      });
    });

    it('passes once the field holds a value', async () => {
      storeActions().initialize({
        schema: buildSchema([{ id: 'f1', name: 'email', type: 'text', validations: [required()] }])
      });
      storeActions().updateFieldValue('f1', 'a@b.c');

      expect(await storeActions().validateField('f1')).toBe(true);
      expect(storeActions().getFieldValidation('f1').messages).toEqual([]);
    });

    it('passes for a field with no rules', async () => {
      storeActions().initialize({ schema: buildSchema([{ id: 'f1', name: 'email', type: 'text' }]) });

      expect(await storeActions().validateField('f1')).toBe(true);
    });

    it('only runs rules matching the trigger', async () => {
      storeActions().initialize({
        schema: buildSchema([
          {
            id: 'f1',
            name: 'email',
            type: 'text',
            validations: [{ type: 'required', message: 'On blur only', trigger: 'blur' }]
          }
        ])
      });

      expect(await storeActions().validateField('f1', 'change')).toBe(true);
      expect(await storeActions().validateField('f1', 'blur')).toBe(false);
    });

    it('collects a message per failing rule', async () => {
      storeActions().initialize({
        schema: buildSchema([
          {
            id: 'f1',
            name: 'code',
            type: 'text',
            validations: [
              { type: 'minLength', value: 5, message: 'Too short' },
              { type: 'pattern', pattern: /^\d+$/, message: 'Digits only' }
            ]
          }
        ])
      });
      storeActions().updateFieldValue('f1', 'ab');

      await storeActions().validateField('f1');

      expect(storeActions().getFieldValidation('f1').messages).toEqual(['Too short', 'Digits only']);
    });

    it('counts existing files towards a required file field', async () => {
      storeActions().initialize({
        schema: buildSchema([
          {
            id: 'doc',
            name: 'document',
            type: 'file',
            options: { accept: {}, server: '' },
            validations: [required('File is required')]
          }
        ]),
        data: { document: ['https://cdn/a.pdf'] }
      });

      expect(await storeActions().validateField('doc')).toBe(true);
    });

    it('fails a required file field with no files at all', async () => {
      storeActions().initialize({
        schema: buildSchema([
          {
            id: 'doc',
            name: 'document',
            type: 'file',
            options: { accept: {}, server: '' },
            validations: [required('File is required')]
          }
        ])
      });

      expect(await storeActions().validateField('doc')).toBe(false);
    });
  });

  describe('validateForm', () => {
    it('is false when any field fails', async () => {
      storeActions().initialize({
        schema: buildSchema([
          { id: 'f1', name: 'email', type: 'text', validations: [required()] },
          { id: 'f2', name: 'phone', type: 'text' }
        ])
      });

      expect(await storeActions().validateForm()).toBe(false);
    });

    it('is true when every field passes', async () => {
      storeActions().initialize({
        schema: buildSchema([
          { id: 'f1', name: 'email', type: 'text', validations: [required()] },
          { id: 'f2', name: 'phone', type: 'text' }
        ])
      });
      storeActions().updateFieldValue('f1', 'a@b.c');

      expect(await storeActions().validateForm()).toBe(true);
    });
  });

  describe('clearValidation', () => {
    it('resets a single field to pristine', async () => {
      storeActions().initialize({
        schema: buildSchema([{ id: 'f1', name: 'email', type: 'text', validations: [required()] }])
      });
      await storeActions().validateField('f1');

      storeActions().clearValidation('f1');

      expect(storeActions().getFieldValidation('f1').isValid).toBe(true);
    });

    it('resets every field when no id is given', async () => {
      storeActions().initialize({
        schema: buildSchema([
          { id: 'f1', name: 'a', type: 'text', validations: [required()] },
          { id: 'f2', name: 'b', type: 'text', validations: [required()] }
        ])
      });
      await storeActions().validateForm();

      storeActions().clearValidation();

      expect(Object.values(storeState().validation).every((v) => v.isValid)).toBe(true);
    });
  });
});
