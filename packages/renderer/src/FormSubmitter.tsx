import React from 'react';
import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormField } from './FormField';
import { FormBuilderProps } from '@parama-dev/form-builder-types';
import { cn } from '@parama-ui/react';

interface FormSubmitterProps extends Omit<FormBuilderProps, 'schema' | 'validators' | 'data'> {
  className?: string;
}

export const FormSubmitter: React.FC<FormSubmitterProps> = ({ onSubmit, onChange, onCancel, className }) => {
  const { schema, actions } = useFormBuilder();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data, isValid, contentType } = await actions.submitForm();

    if (isValid) {
      onSubmit?.(data, contentType);
    }
  };

  const handleChange = (data: Record<string, any>) => {
    onChange?.(data);
  };

  return (
    <form
      className={cn(`grid column-${schema.layout.colSize} gap-size-${schema.layout.gap}`, className)}
      onSubmit={handleSubmit}>
      {schema.fields.map((field) => (
        <FormField key={field.id} field={field} onChange={handleChange} onCancel={onCancel} />
      ))}
    </form>
  );
};
