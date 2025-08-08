import React from 'react';
import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormField } from './FormField';
import { FormBuilderProps } from '@parama-dev/form-builder-types';
import { cn } from '@parama-ui/react';

interface FormSubmitterProps extends Omit<FormBuilderProps, 'schema' | 'validators' | 'data'> {
  className?: string;
}

export const FormSubmitter: React.FC<FormSubmitterProps> = ({ onSubmit, onChange, onCancel, className }) => {
  const { schema, actions, formState } = useFormBuilder();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      actions.setSubmissionState({ isSubmitting: true });

      const { data, isValid, contentType } = await actions.submitForm();

      if (isValid) {
        await onSubmit?.(data, contentType);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      actions.setSubmissionState({ isSubmitting: false });
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
        <FormField
          key={field.id}
          field={field}
          onChange={handleChange}
          onCancel={onCancel}
          isDisabled={formState.isSubmitting}
        />
      ))}
    </form>
  );
};
