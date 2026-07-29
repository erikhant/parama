import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { ButtonField as ButtonFieldType, FormBuilderProps } from '@parama-dev/form-builder-types';
import { Button, cn } from '@parama-ui/react';
import { Loader2Icon } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useFormActions, useFormMode } from '../hooks/useFieldFlags';
import { columnSpanClass } from '../utils/responsiveClass';

interface ButtonFieldProps {
  field: ButtonFieldType;
  onCancel: FormBuilderProps['onCancel'];
  disabled?: boolean;
}

/**
 * Form action button: submit, reset or cancel.
 *
 * A submit button shows a spinner and locks itself while the form is in flight.
 * `stickyAtBottom` pins the button to the viewport bottom in a live form, with
 * a fade strip above it; the editor renders it inline so it does not float over
 * the canvas.
 */
export const ButtonField = memo<ButtonFieldProps>(({ field, onCancel, disabled }) => {
  const actions = useFormActions();
  const mode = useFormMode();
  const isSubmitting = useFormBuilder((state) => state.formState.isSubmitting);

  const handleReset = useCallback(() => actions.resetForm(), [actions]);

  const isRendered = mode === 'render';
  const isSticky = isRendered && Boolean(field.appearance?.stickyAtBottom);
  const isSubmitAction = field.action === 'submit';
  const isDisabled = disabled || (isSubmitAction && isSubmitting);

  const onClick =
    field.action === 'cancel' ? onCancel : field.action === 'reset' ? handleReset : undefined;

  return (
    <>
      {isSticky && <div className="bg-fade column-span-12" />}
      <div className={cn(columnSpanClass(field), isSticky && 'sticky-btn')}>
        <Button
          type={field.type}
          color={field.appearance?.color}
          size={field.appearance?.size}
          variant={field.appearance?.variant}
          className="w-full"
          disabled={isDisabled}
          onClick={onClick}>
          {isSubmitAction && isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              {field.loadingText || null}
            </>
          ) : (
            field.label
          )}
        </Button>
      </div>
    </>
  );
});

ButtonField.displayName = 'ButtonField';
