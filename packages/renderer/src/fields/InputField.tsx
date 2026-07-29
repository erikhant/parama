import type { FormField, ValidationState } from '@parama-dev/form-builder-types';
import { cn, FormItem, Label } from '@parama-ui/react';
import { memo, useCallback, useMemo } from 'react';
import { resolveControl } from '../controls';
import type { CommonInputProps } from '../controls/types';
import { useFieldFlags, useFieldValidation, useFormActions, useFormMode } from '../hooks/useFieldFlags';
import { useFieldValue } from '../hooks/useFieldValue';
import { columnSpanClass } from '../utils/responsiveClass';

/** Fields that need `name`, `placeholder` etc. — everything but buttons and blocks. */
type InputFieldType = Extract<FormField, { name: string }>;

/** The first validation message, falling back to the field-level error. */
function firstMessage(validation: ValidationState, field: InputFieldType): string | undefined {
  return validation.messages[0] || field.error;
}

/** Label with the required marker. Hidden fields show no label when rendered live. */
const FieldLabel = memo<{ label: string; isRequired: boolean }>(({ label, isRequired }) => (
  <Label className="relative">
    {label}
    {isRequired && <span className="text-red-500 text-xs absolute top-0 -right-2">*</span>}
  </Label>
));
FieldLabel.displayName = 'FieldLabel';

/**
 * Renders one input field: label, control, help text and validation message.
 *
 * The shell owns everything shared across field types and delegates the input
 * itself to a control resolved from the registry. It reads store state through
 * narrow selectors, so typing in one field does not re-render its siblings.
 */
export const InputField = memo<{ field: InputFieldType }>(({ field }) => {
  const actions = useFormActions();
  const mode = useFormMode();
  const value = useFieldValue(field);
  const validation = useFieldValidation(field.id);
  const { isVisible, isDisabled, isReadOnly, isRequired } = useFieldFlags(field);

  const hasError = !validation.isValid || Boolean(field.error);

  const onChange = useCallback(
    (next: any) => actions.updateFieldValue(field.id, next),
    [actions, field.id]
  );

  const commonProps = useMemo<CommonInputProps>(
    () => ({
      id: field.id,
      name: field.name,
      disabled: isDisabled,
      placeholder: field.placeholder,
      required: isRequired,
      className: hasError ? 'border-red-500' : ''
    }),
    [field.id, field.name, field.placeholder, isDisabled, isRequired, hasError]
  );

  if (!isVisible) return null;

  const Control = resolveControl(field.type);
  const isFile = field.type === 'file';
  const showLabel = mode === 'editor' || field.type !== 'hidden';
  const message = firstMessage(validation, field);

  return (
    <FormItem
      id={`item__${field.id}`}
      className={cn(columnSpanClass(field))}
      orientation={
        field.type === 'checkbox' || field.type === 'radio' ? field.appearance?.position : 'vertical'
      }>
      {showLabel && <FieldLabel label={field.label} isRequired={isRequired} />}

      {/* File fields carry their guidance above the drop zone; every other type
          carries it below the input. */}
      {isFile && field.helpText && <p className="form-description">{field.helpText}</p>}
      {isFile && hasError && <p className="text-red-500 text-xs mt-1">{message}</p>}

      {Control ? (
        <Control
          field={field}
          value={value}
          onChange={onChange}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          isRequired={isRequired}
          validation={validation}
          commonProps={commonProps}
        />
      ) : (
        <div>Unsupported field type</div>
      )}

      {!isFile &&
        (hasError ? (
          <span className="text-red-500 text-xs mt-1">{message}</span>
        ) : (
          field.helpText && <span className="form-description">{field.helpText}</span>
        ))}
    </FormItem>
  );
});

InputField.displayName = 'InputField';
