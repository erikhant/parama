import React from 'react';
import DatePicker from 'react-datepicker';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import { useFormBuilder } from '@form-builder/core';
import type { FormField as FormFieldType } from '@form-builder/types';
import 'react-datepicker/dist/react-datepicker.css';

export const FormField: React.FC<{ field: FormFieldType }> = ({ field }) => {
  const { formData, actions } = useFormBuilder();
  const value = formData[field.id] ?? field.defaultValue;

  const handleChange = (value: any) => {
    actions.updateFieldValue(field.id, value);
    actions.validateField(field.id);
  };

  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <input
            id={field.id}
            name={field.name}
            type={field.type}
            defaultValue={value || ''}
            disabled={field.disabled}
            readOnly={field.readOnly}
            placeholder={field.placeholder}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => actions.selectField(field.id)}
            className={`border rounded p-2 w-full ${field.error ? 'border-red-500' : 'border-gray-300'}`}
          />
        );
      case 'textarea':
        return (
          <textarea
            name={field.name}
            defaultValue={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            rows={field.rows || 3}
            className={`w-full p-2 border rounded ${field.error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={field.placeholder}
          />
        );
      case 'date':
        return (
          <DatePicker
            name={field.name}
            selected={value ? new Date(value) : null}
            onChange={(date) => handleChange(date?.toISOString())}
            className={`w-full p-2 border rounded ${field.error ? 'border-red-500' : 'border-gray-300'}`}
          />
        );
      case 'radio':
        return (
          <div
            className={`flex w-full ${field.appearance?.position === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2'}`}>
            {field.items?.map((item) => (
              <label key={item.id} className="flex items-center gap-2">
                <input
                  name={field.name}
                  type="radio"
                  defaultChecked={value === item.value}
                  onChange={() => handleChange(item.value)}
                  className="mr-2"
                />
                {item.label}
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div
            className={`flex w-full ${field.appearance?.position === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2'}`}>
            {field.items?.map((item) => (
              <label key={item.id} className="flex items-center">
                <input
                  name={field.name}
                  type="checkbox"
                  defaultChecked={value?.includes(item.value)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...(value || []), item.value]
                      : (value || []).filter((v: any) => v !== item.value);
                    handleChange(newValue);
                  }}
                  className="mr-2"
                />
                {item.label}
              </label>
            ))}
          </div>
        );
      case 'select':
        return (
          <Select
            name={field.name}
            options={field.options}
            defaultValue={
              Array.isArray(value)
                ? field.options?.filter((opt) => value.includes(opt.value))
                : field.options?.find((opt) => opt.value === value)
            }
            isMulti={field.multiple}
            onChange={(selected) => handleChange(selected)}
            className={`react-select-container ${field.error ? 'border-red-500' : ''}`}
            classNamePrefix="react-select"
          />
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
        return (
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
            {field.label}
          </button>
        );

      default:
        return <div>Unsupported field type</div>;
    }
  };

  return (
    <div className={`column-span-${field.width} flex flex-col`}>
      {field.type !== 'submit' && (
        <label className="block text-sm font-medium mb-1">
          {field.label}
          {field.validation?.required && (
            <span className="text-red-500">*</span>
          )}
        </label>
      )}
      {renderInput()}
      {field.type !== 'submit' && field.error && (
        <span className="text-red-500 text-sm mt-1">{field.error}</span>
      )}
      {field.type !== 'submit' && field.helpText && (
        <span className="text-gray-500 text-sm mt-1">{field.helpText}</span>
      )}
    </div>
  );
};
