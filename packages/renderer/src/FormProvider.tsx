import { useEffect, Fragment, useRef } from 'react';
import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormBuilderProps } from '@parama-dev/form-builder-types';
import { isEqual } from 'lodash-es';

export const FormProvider: React.FC<FormBuilderProps & { children: React.ReactNode }> = ({
  schema,
  validators = {},
  data = {},
  variables,
  children
}) => {
  const { initialize } = useFormBuilder().actions;

  const prevValues = useRef({ schema, validators, data, variables });
  const isFirstRender = useRef(true);

  useEffect(() => {
    const currentValues = { schema, validators, data, variables };

    // Always initialize on first render, or if schema reference changed, or if deep comparison shows changes
    const shouldReinitialize =
      isFirstRender.current ||
      prevValues.current.schema !== schema || // Reference comparison for schema
      prevValues.current.variables !== variables || // Reference comparison for variables
      !isEqual(prevValues.current, currentValues);

    if (shouldReinitialize) {
      initialize({ schema, data, variables, validators });
      prevValues.current = currentValues;
      isFirstRender.current = false;
    }
  }, [schema, data, variables, validators, initialize]);

  return <Fragment>{children}</Fragment>;
};
