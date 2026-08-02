import { useEffect, Fragment, useRef } from 'react';
import { useFormBuilder } from '@parama-dev/form-builder-core';
import { FormBuilderProps } from '@parama-dev/form-builder-types';
import { isEqual } from 'lodash-es';

export const FormProvider: React.FC<FormBuilderProps & { children: React.ReactNode }> = ({
  schema,
  validators = {},
  data,
  variables,
  children
}) => {
  const { initialize, changeMode } = useFormBuilder().actions;

  const prevValues = useRef({ schema, validators, data, variables });
  const isFirstRender = useRef(true);

  /*
   * Claim render mode, mirroring the editor claiming `editor` on its own mount.
   *
   * The store is a module singleton, so the two share it. Without this a form
   * mounted after the editor inherits editor mode, in which `useFieldFlags`
   * deliberately ignores conditions — every conditional field would render
   * visible, enabled and writable, with nothing to indicate why.
   *
   * Runs before the initialize effect below so the form never paints a frame
   * under the wrong mode.
   */
  useEffect(() => {
    changeMode('render');
  }, [changeMode]);

  useEffect(() => {
    const currentValues = { schema, validators, data, variables };

    // Always initialize on first render, or if schema reference changed, or if deep comparison shows changes
    const shouldReinitialize =
      isFirstRender.current ||
      prevValues.current.schema !== schema || // Reference comparison for schema
      prevValues.current.data !== data || // Reference comparison for data
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
