import React from 'react';
import { useFormBuilder } from '@form-builder/core';
import { FormField } from './FormField';

export const FormRenderer = () => {
  const { schema, actions } = useFormBuilder();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, isValid } = await actions.submitForm();
    if (isValid) {
      console.log('Form submitted', JSON.stringify(data));
    }
  };

  return (
    <form
      className={`grid column-${schema.layout.colSize} gap-size-${schema.layout.gap}`}
      onSubmit={onSubmit}>
      {schema.fields.map((field) => (
        <FormField key={field.id} field={field} />
      ))}
    </form>
  );
};
