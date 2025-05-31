import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
// import Select from 'react-select';
import { useFormBuilder } from '@form-builder/core';
import {
  Button,
  Checkbox,
  DatePicker,
  FormItem,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@parama-ui/react';
import type { FormField as FormFieldType } from '@form-builder/types';
import '../../parama-ui/dist/parama-ui.min.css';

export const FormField: React.FC<{ field: FormFieldType }> = ({ field }) => {
  const { formData, actions } = useFormBuilder();
  const value = formData[field.id] ?? field.defaultValue;
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
    actions.updateFieldValue(
      field.id,
      date ? date.toLocaleDateString() : undefined
    );
    actions.validateField(field.id);
  };
  const handleChange = (value: any) => {
    actions.updateFieldValue(field.id, value);
    actions.validateField(field.id);
  };

  const getValidationValue = (validationName: string) => {
    if (field.type === 'submit') return false;
    if (!field.validation) return false;
    if (
      typeof (field.validation as Record<string, unknown>)?.[validationName] ===
      'boolean'
    ) {
      return (
        (field.validation as Record<string, unknown>)[validationName] === true
      );
    } else {
      return (
        field.validation as Record<string, { value: unknown; message: string }>
      )[validationName]?.value;
    }
  };

  const evaluateVisibility = (field: FormFieldType) => {
    if (!field.conditions?.visibility) return true;
    const { dependsOn, operator, value } = field.conditions.visibility;
    const dependentValue = formData[dependsOn];
    switch (operator) {
      case 'Equals':
        return dependentValue === value;
      case 'NotEqual':
        return dependentValue !== value;
      case 'GreaterThan':
        return dependentValue > value;
      case 'LessThan':
        return dependentValue < value;
      case 'LessOrEqual':
        return dependentValue <= value;
      case 'GreaterOrEqual':
        return dependentValue >= value;
      default:
        return true;
    }
  };

  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <Input
            id={field.id}
            name={field.name}
            type={field.type}
            defaultValue={value || ''}
            disabled={field.disabled}
            readOnly={field.readOnly}
            placeholder={field.placeholder}
            required={getValidationValue('required') as boolean}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => actions.selectField(field.id)}
            className={`${field.error ? 'border-red-500' : ''}`}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            name={field.name}
            defaultValue={value || ''}
            required={getValidationValue('required') as boolean}
            rows={field.rows || 3}
            className={`${field.error ? 'border-red-500' : ''}`}
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={field.readOnly}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => actions.selectField(field.id)}
          />
        );
      case 'date':
        return (
          <DatePicker
            {...(field.mode === 'single' ? { mode: 'single' } : {})}
            required={getValidationValue('required') as boolean}
            disabled={field.disabled}
            placeholder={field.placeholder}
            name={field.name}
            selected={date}
            container={document.getElementById(`item__${field.id}`)}
            onSelect={handleDateChange}
            className={`w-full p-2 border rounded ${field.error ? 'border-red-500' : 'border-gray-300'}`}
          />
        );
      case 'radio':
        return (
          <RadioGroup
            name={field.name}
            defaultValue={field.defaultValue}
            disabled={field.disabled}
            required={getValidationValue('required') as boolean}
            onValueChange={(value) => handleChange(value)}
            orientation={field.appearance?.position}>
            {field.items?.map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <RadioGroupItem value={item.value} id={item.id as string} />
                <Label htmlFor={item.id as string}>{item.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <>
            {field.items?.map((item) => (
              <div className="flex items-center space-x-2" key={item.id}>
                <Checkbox
                  id={item.id as string}
                  name={field.name}
                  required={getValidationValue('required') as boolean}
                  disabled={item.disabled}
                  value={item.value}
                  defaultChecked={value?.includes(item.value)}
                  onCheckedChange={(e) => {
                    const newValue = e
                      ? [...(value || []), item.value]
                      : (value || []).filter((v: any) => v !== item.value);
                    handleChange(newValue);
                  }}
                  className="mr-2"
                />
                <Label htmlFor={item.id as string}>{item.label}</Label>
              </div>
            ))}
          </>
        );
      case 'select':
        return (
          <Select
            name={field.name}
            defaultValue={value}
            disabled={field.disabled}
            required={getValidationValue('required') as boolean}
            onValueChange={(selectedValue) => {
              handleChange(selectedValue);
            }}>
            <SelectTrigger
              className="w-full"
              onFocus={() => actions.selectField(field.id)}>
              <SelectValue
                className="text-slate-400"
                placeholder={field.placeholder || 'Select an option'}
              />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
              </SelectGroup> */}
              {field.options?.map((opt) => (
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'file':
        <Dropzone
          accept={field.validation?.accept}
          disabled={field.disabled}
          maxFiles={field.validation?.maxFiles}
          maxSize={field.validation?.maxSize}
          multiple={field.multiple}>
          {({ getRootProps, getInputProps, acceptedFiles }) => (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-md p-4 ${field.error ? 'border-red-500' : 'border-gray-300'}`}>
              <input {...getInputProps()} name={field.name} />
              <p className="text-center">
                {field.label ?? 'Drag & drop files here, or click to browse'}
              </p>
              <ul>
                {acceptedFiles.map((file, index) => (
                  <li key={`${file.name}_${index}`}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </Dropzone>;

      case 'submit':
        return <Button type="submit">{field.label}</Button>;

      default:
        return <div>Unsupported field type</div>;
    }
  };

  return (
    evaluateVisibility(field) && (
      <FormItem
        id={`item__${field.id}`}
        className={`column-span-${field.width}`}
        orientation={
          field.type === 'checkbox' || field.type === 'radio'
            ? field.appearance?.position
            : 'vertical'
        }>
        {field.type !== 'submit' && (
          <Label>
            {field.label}
            {/* {field.validation?.required && (
            <span className="text-red-500">*</span>
          )} */}
          </Label>
        )}
        {renderInput()}
        {field.type !== 'submit' && field.error && (
          <span className="text-red-500 text-sm mt-1">{field.error}</span>
        )}
        {field.type !== 'submit' && field.helpText && (
          <span className="form-description">{field.helpText}</span>
        )}
      </FormItem>
    )
  );
};
