import React from 'react';
import { FormBuilderProps } from '@form-builder/types';
import { FormProvider } from './FormProvider';
import { TemplateSelector } from './TemplateSelector';
import { FormRenderer } from './FormRenderer';

export const FormBuilder: React.FC<FormBuilderProps> = (props) => {
  return (
    <FormProvider {...props}>
      <div className="form-builder-container p-4">
        <TemplateSelector />
        <FormRenderer />
      </div>
    </FormProvider>
  );
};
