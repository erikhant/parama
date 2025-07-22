import { useEffect, Fragment, useRef } from 'react';
import { useFormBuilder } from '@form-builder/core';
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
  const isFirstRender = useRef(true);

  useEffect(() => {
    const currentValues = { schema, validators, data };

    // Always initialize on first render, or if schema reference changed, or if deep comparison shows changes
    const shouldReinitialize =
      isFirstRender.current ||
      prevValues.current.schema !== schema || // Reference comparison for schema
      !isEqual(prevValues.current, currentValues);

    if (shouldReinitialize) {
      initialize({ schema, data });
      prevValues.current = currentValues;
      isFirstRender.current = false;
    }
  }, [schema, data, validators, initialize]);

  return <Fragment>{children}</Fragment>;
};
