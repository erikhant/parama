import React from 'react';
import { createValidatorRegistry, useFormBuilder } from '@form-builder/core';
import { FormBuilderProps } from '@form-builder/types';

export const FormProvider: React.FC<FormBuilderProps & { children: React.ReactNode }> = ({
  schema,
  validators = {},
  data = {},
  templates = [],
  children
}) => {
  const { initialize } = useFormBuilder().actions;

  React.useEffect(() => {
    const mergedValidators = createValidatorRegistry(validators);
    initialize({ schema, validators: mergedValidators, data, templates });
  }, [schema, validators, data, templates]);

  return <React.Fragment>{children}</React.Fragment>;
};
