import React from 'react';
import { useFormBuilder } from '@form-builder/core';
import { FormField } from './FormField';

export const FormSubmitter: React.FC<{
  onSubmit?: (data: Record<string, any>) => void;
  onChange?: (data: Record<string, any>) => void;
  onCancel?: () => void;
}> = ({ onSubmit, onChange, onCancel }) => {
  const { schema, actions } = useFormBuilder();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data, isValid } = await actions.submitForm();
    console.log('Form validity:', isValid);
    console.log('Form submitted:', data);
    if (isValid) {
      onSubmit?.(data);
    }
  };

  const handleChange = (data: Record<string, any>) => {
    onChange?.(data);
  };

  return (
    <form className={`grid column-${schema.layout.colSize} gap-size-${schema.layout.gap}`} onSubmit={handleSubmit}>
      {schema.fields.map((field) => (
        <FormField key={field.id} field={field} onChange={handleChange} onCancel={onCancel} />
      ))}
    </form>
  );
};
