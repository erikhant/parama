import { FormItem, Input, Label, Switch } from '@parama-ui/react';
import type { FormField, ValidationRule } from '@form-builder/types';
import { SectionPanel } from './SectionPanel';
import React, { useMemo, useCallback } from 'react';

type ValidationEditorProps = {
  field: FormField;
  onChange: (updates: Partial<FormField>) => void;
};

export default function ValidationEditor({ field, onChange }: ValidationEditorProps) {
  const validations = useMemo(() => field.validations || [], [field.validations]);

  const getValidation = useCallback(
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
          checked={!!getValidation('required')}
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
    [getValidation, handleValidationChange, removeValidation]
  );

  const renderValidatorTemplate = useMemo(
    () => (
      <SectionPanel title="Custom Validation">
        <FormItem orientation="horizontal">
          <Label className="!col-span-3">Validation Type</Label>
          <Input
            type="text"
            value={getValidation('custom')?.type ?? ''}
            placeholder="Validation type (e.g., custom)"
            className="!col-span-2"
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                removeValidation('custom');
                return;
              }
              handleValidationChange({
                trigger: 'change',
                type: 'custom',
                value: val,
                message: `Custom validation of type ${val}`
              });
            }}
          />
        </FormItem>
      </SectionPanel>
    ),
    [getValidation, handleValidationChange, removeValidation]
  );

  const renderTextValidations = useMemo(
    () => (
      <SectionPanel title="Validation">
        {renderRequiredValidation}
        <FormItem orientation="horizontal">
          <Label className="!col-span-3">Min length</Label>
          <Input
            type="number"
            min={0}
            title="Minimum character length"
            value={getValidation('minLength')?.value ?? ''}
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
            value={getValidation('maxLength')?.value ?? ''}
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
    [getValidation, handleValidationChange, removeValidation]
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
            value={getValidation('min')?.value ?? ''}
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
            value={getValidation('max')?.value ?? ''}
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
    [getValidation, handleValidationChange, removeValidation]
  );

  const renderEmailValidation = useMemo(
    () => (
      <SectionPanel title="Validation">
        {renderRequiredValidation}
        <FormItem orientation="horizontal">
          <Label className="!col-span-4">Enable Email Validation</Label>
          <Switch
            checked={!!getValidation('pattern')}
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
    [getValidation, handleValidationChange, removeValidation]
  );

  switch (field.type) {
    case 'text':
    case 'password':
    case 'textarea':
      return renderTextValidations;
    case 'number':
      return renderNumberValidations;
    case 'email':
      return renderEmailValidation;
    default:
      return null;
  }
}
