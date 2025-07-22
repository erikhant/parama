import React, { useEffect, useRef } from 'react';
import { defaultSchema, useFormBuilder } from '@parama-dev/form-builder-core';
import { FormEditorProps } from '@parama-dev/form-builder-types';
import { isEqual } from 'lodash-es';
import { useEditor } from '../store/useEditor';
import { ErrorBoundary } from 'react-error-boundary';
import { FallbackException } from './FallbackException';

export const EditorProvider: React.FC<FormEditorProps & { children: React.ReactNode }> = (props) => {
  const { initialize: initEditor } = useEditor();
  const {
    actions: { initialize: initBuilder, updateFields }
  } = useFormBuilder();

  const { children, schema, ...editorProps } = props;
  const { onSaveSchema, loadPreset, options } = editorProps;

  const prevValues = useRef({ schema, onSaveSchema, options });
  const isFirstRender = useRef(true);

  useEffect(() => {
    const currentValues = { schema, onSaveSchema, options };

    // Always initialize on first render, or if schema reference changed, or if deep comparison shows changes
    const shouldReinitialize =
      isFirstRender.current ||
      prevValues.current.schema !== schema || // Reference comparison for schema
      !isEqual(prevValues.current, currentValues);

    if (shouldReinitialize) {
      initEditor({ onSaveSchema, loadPreset, options });
      initBuilder({ schema: schema ?? defaultSchema });

      prevValues.current = currentValues;
      isFirstRender.current = false;
    }
  }, [schema, onSaveSchema, loadPreset, options, initEditor, initBuilder]);

  return (
    <ErrorBoundary FallbackComponent={FallbackException} onReset={() => updateFields([])}>
      {children}
    </ErrorBoundary>
  );
};
