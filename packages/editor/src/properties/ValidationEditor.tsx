import {
  Button,
  FormItem,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch
} from '@parama-ui/react';
import type { FormField, ValidationRule } from '@form-builder/types';
import { SectionPanel } from './SectionPanel';
import React, { useMemo, useCallback } from 'react';
import { builtInValidatorTemplate, useFormBuilder } from '@form-builder/core';
import { useEditor } from '../store/useEditor';

type ValidationEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export default function ValidationEditor({ field, onChange }: ValidationEditorProps) {
  const { editor } = useEditor();
  const { getFieldValue } = useFormBuilder().actions;
  const validations = useMemo(() => field.validations || [], [field.validations]);
  const builtInTextValidatorTemplate = useMemo(
    () => builtInValidatorTemplate.filter((r) => r.name !== 'passwordStrength'),
    []
  );
  const builtInPasswordValidatorTemplate = useMemo(
    () => builtInValidatorTemplate.filter((r) => r.name === 'passwordStrength')[0],
    []
  );

  const getValidationByType = useCallback(
    (type: ValidationRule['type']) => validations.find((v) => v.type === type),
    [validations]
  );

  const handleValidationChange = useCallback(
    (rule: ValidationRule) => {
      const idx = validations.findIndex((v) => v.type === rule.type);
      if (idx !== -1) {
        const updated = [...validations];
        updated[idx] = { ...updated[idx], ...rule };
        onChange({ validations: updated });
      } else {
        if (rule.type === 'required') {
          onChange({ validations: [{ ...rule }, ...validations] });
        } else {
          onChange({ validations: [...validations, { ...rule }] });
        }
      }
    },
    [onChange, validations]
  );

  const removeValidation = useCallback(
    (type: string) => {
      const filtered = validations.filter((v) => v.type !== type);
      if (filtered.length !== validations.length) {
        onChange({ validations: filtered });
      }
    },
    [onChange, validations]
  );

  const renderRequiredValidation = useMemo(
    () => (
      <FormItem orientation="horizontal">
        <Label className="!col-span-4">Required field</Label>
        <Switch
          className="!col-span-1"
          checked={!!getValidationByType('required')}
          disabled={editor.options?.validationSettings === 'readonly'}
          onCheckedChange={(checked) => {
            if (checked) {
              handleValidationChange({
                trigger: 'change',
                type: 'required',
                message: 'This field is required'
              });
            } else {
              removeValidation('required');
            }
          }}
        />
      </FormItem>
    ),
    [getValidationByType, handleValidationChange, removeValidation]
  );
  const renderPasswordValidation = useMemo(
    () => (
      <SectionPanel title="Validation">
        {renderRequiredValidation}
        <FormItem orientation="horizontal">
          <Label className="!col-span-4">Enable strength password</Label>
          <Switch
            className="!col-span-1"
            checked={!!getValidationByType('pattern')}
            disabled={editor.options?.validationSettings === 'readonly'}
            onCheckedChange={(checked) => {
              if (checked) {
                handleValidationChange({
                  ...builtInPasswordValidatorTemplate,
                  value: getFieldValue(field.id)
                });
              } else {
                removeValidation('pattern');
              }
            }}
          />
        </FormItem>
      </SectionPanel>
    ),
    [getValidationByType, handleValidationChange, removeValidation, validations]
  );

  const renderTextValidatorTemplate = useMemo(
    () => (
      <FormItem className="py-2">
        <div className="flex items-center justify-between h-7">
          <Label>Validation template</Label>
          {getValidationByType('pattern') && (
            <Button
              color="secondary"
              variant="ghost"
              size="xs"
              className="text-xs text-gray-500"
              disabled={editor.options?.validationSettings === 'readonly'}
              onClick={() => removeValidation('pattern')}>
              Remove
            </Button>
          )}
        </div>
        <Select
          value={getValidationByType('pattern')?.name || ''}
          disabled={editor.options?.validationSettings === 'readonly'}
          onValueChange={(value) => {
            const rule = builtInTextValidatorTemplate.find((rule) => rule.name === value);
            if (!rule) return;
            handleValidationChange({ ...rule, value: getFieldValue(field.id) });
          }}>
          <SelectTrigger className="whitespace-nowrap capitalize">
            <SelectValue className="!text-gray-500 dark:text-gray-600" placeholder="Choose template" />
          </SelectTrigger>
          <SelectContent>
            {builtInTextValidatorTemplate.map((option) => (
              <SelectItem key={option.name} value={option.name as string} className="capitalize">
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="form-description">Choose validation template </p>
      </FormItem>
    ),
    [getValidationByType, handleValidationChange, removeValidation, validations]
  );

  const renderTextValidations = useMemo(
    () => (
      <SectionPanel title="Validation">
        {renderRequiredValidation}
        {renderTextValidatorTemplate}
        <FormItem orientation="horizontal">
          <Label className="!col-span-3">Min length</Label>
          <Input
            type="number"
            min={0}
            title="Minimum character length"
            value={getValidationByType('minLength')?.value ?? ''}
            disabled={editor.options?.validationSettings === 'readonly'}
            placeholder="Minimum character length"
            className="!col-span-2"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                removeValidation('minLength');
                return;
              }
              const minLength = Number(val);
              if (!isNaN(minLength) && minLength >= 0) {
                handleValidationChange({
                  trigger: 'change',
                  type: 'minLength',
                  value: minLength,
                  message: `Minimum length is ${minLength}`
                });
              }
            }}
          />
        </FormItem>
        <FormItem orientation="horizontal">
          <Label className="!col-span-3">Max length</Label>
          <Input
            type="number"
            min={0}
            title="Maximum character length"
            value={getValidationByType('maxLength')?.value ?? ''}
            disabled={editor.options?.validationSettings === 'readonly'}
            placeholder="Maximum character length"
            className="!col-span-2"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                removeValidation('maxLength');
                return;
              }
              const maxLength = Number(val);
              if (!isNaN(maxLength) && maxLength >= 0) {
                handleValidationChange({
                  trigger: 'change',
                  type: 'maxLength',
                  value: maxLength,
                  message: `Maximum length is ${maxLength}`
                });
              }
            }}
          />
        </FormItem>
      </SectionPanel>
    ),
    [getValidationByType, handleValidationChange, removeValidation]
  );

  const renderNumberValidations = useMemo(
    () => (
      <SectionPanel title="Validation">
        {renderRequiredValidation}
        <FormItem orientation="horizontal">
          <Label className="!col-span-3">Min</Label>
          <Input
            type="number"
            min={0}
            title="Minimum value"
            value={getValidationByType('min')?.value ?? ''}
            disabled={editor.options?.validationSettings === 'readonly'}
            placeholder="Minimum value"
            className="!col-span-2"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                removeValidation('min');
                return;
              }
              const min = Number(val);
              if (!isNaN(min) && min >= 0) {
                handleValidationChange({
                  trigger: 'change',
                  type: 'min',
                  value: min,
                  message: `Minimum value is ${min}`
                });
              }
            }}
          />
        </FormItem>
        <FormItem orientation="horizontal">
          <Label className="!col-span-3">Max</Label>
          <Input
            type="number"
            min={0}
            title="Maximum value"
            value={getValidationByType('max')?.value ?? ''}
            disabled={editor.options?.validationSettings === 'readonly'}
            placeholder="Maximum value"
            className="!col-span-2"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                removeValidation('max');
                return;
              }
              const max = Number(val);
              if (!isNaN(max) && max >= 0) {
                handleValidationChange({
                  trigger: 'change',
                  type: 'max',
                  value: max,
                  message: `Maximum value is ${max}`
                });
              }
            }}
          />
        </FormItem>
      </SectionPanel>
    ),
    [getValidationByType, handleValidationChange, removeValidation]
  );

  const renderEmailValidation = useMemo(
    () => (
      <SectionPanel title="Validation">
        {renderRequiredValidation}
        <FormItem orientation="horizontal">
          <Label className="!col-span-4">Enable Email Validation</Label>
          <Switch
            checked={!!getValidationByType('pattern')}
            disabled={editor.options?.validationSettings === 'readonly'}
            onCheckedChange={(checked) => {
              if (checked) {
                handleValidationChange({
                  trigger: 'change',
                  type: 'pattern',
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email must be in a valid format'
                });
              } else {
                removeValidation('pattern');
              }
            }}
          />
        </FormItem>
      </SectionPanel>
    ),
    [getValidationByType, handleValidationChange, removeValidation]
  );

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'email':
      return renderTextValidations;
    case 'number':
      return renderNumberValidations;
    case 'password':
      return renderPasswordValidation;
    default:
      return null;
  }
}
