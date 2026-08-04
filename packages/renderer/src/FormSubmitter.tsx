import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { FormBuilderProps } from '@parama-dev/form-builder-types';
import { cn, paramaScope } from '@parama-ui/react';
import React, { useCallback } from 'react';
import { FormFieldRenderer } from './FormField';
import { useChangeNotifier } from './hooks/useChangeNotifier';
import { useFormActions } from './hooks/useFieldFlags';

interface FormSubmitterProps extends Omit<FormBuilderProps, 'schema' | 'validators' | 'data'> {
  className?: string;
}

/**
 * The `<form>` element: lays fields out on the schema's grid and owns submission.
 *
 * Submission validates first and only calls `onSubmit` when the form is valid.
 * The submitting flag is always cleared, so a throwing handler cannot leave the
 * form permanently locked.
 *
 * @remarks
 * Subscribes with narrow selectors rather than destructuring the whole store —
 * this component rebuilds every field on each render, so a broad subscription
 * would re-render the entire form on every keystroke.
 */
export const FormSubmitter: React.FC<FormSubmitterProps> = ({ onSubmit, onChange, onCancel, className }) => {
  const actions = useFormActions();
  const fields = useFormBuilder((state) => state.schema.fields);
  const layout = useFormBuilder((state) => state.schema.layout);
  const isSubmitting = useFormBuilder((state) => state.formState.isSubmitting);

  useChangeNotifier(onChange);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        actions.setSubmissionState({ isSubmitting: true });

        const { data, isValid, contentType } = await actions.submitForm();
        if (isValid) await onSubmit?.(data, contentType);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        actions.setSubmissionState({ isSubmitting: false });
      }
    },
    [actions, onSubmit]
  );

  return (
    /*
     * A bare scope marker, not a styled element.
     *
     * The bundled utilities compile to `[data-parama-scope] .grid`, a
     * *descendant* selector — so anything on the marker element itself is never
     * matched. Putting the marker on the `<form>` cost it its own `grid`.
     *
     * `display: contents` is set inline rather than with the `contents` utility
     * for the same reason, and it keeps this wrapper out of the layout, so a
     * host's flex or grid rules still apply to the `<form>` as before.
     */
    <div {...paramaScope} style={{ display: 'contents' }}>
      <form
        className={cn(`grid column-${layout.colSize} gap-size-${layout.gap}`, className)}
        onSubmit={handleSubmit}>
        {fields.map((field) => (
          <FormFieldRenderer key={field.id} field={field} onCancel={onCancel} isDisabled={isSubmitting} />
        ))}
      </form>
    </div>
  );
};
