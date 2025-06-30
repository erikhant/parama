import { useEffect, useMemo, Fragment, useRef } from 'react';
import { createValidatorRegistry, useFormBuilder } from '@form-builder/core';
import { FormBuilderProps } from '@form-builder/types';
import { isEqual } from 'lodash-es';

export const FormProvider: React.FC<FormBuilderProps & { children: React.ReactNode }> = ({
  schema,
  validators = {},
  data = {},
  children
}) => {
  const { initialize } = useFormBuilder().actions;

  const prevValues = useRef({ schema, validators, data });

  // const mergedValidators = useMemo(() => createValidatorRegistry(validators), [validators]);

  useEffect(() => {
    const currentValues = { schema, validators, data };

    if (!isEqual(prevValues.current, currentValues)) {
      initialize({ schema, data });
      prevValues.current = currentValues;
    }
  }, [schema, data, validators, initialize]);

  return <Fragment>{children}</Fragment>;
};
