import type { ButtonField as ButtonFieldType, FormBuilderProps, FormField } from '@parama-dev/form-builder-types';
import { memo } from 'react';
import { BlockField } from './fields/BlockField';
import { ButtonField } from './fields/ButtonField';
import { InputField } from './fields/InputField';

/** Field types that render as presentational blocks rather than inputs. */
const BLOCK_TYPES = new Set<FormField['type']>(['block', 'spacer']);

/** Field types that render as action buttons. */
const BUTTON_TYPES = new Set<FormField['type']>(['submit', 'reset', 'button']);

interface FormFieldRendererProps {
  field: FormField;
  isDisabled?: boolean;
  onCancel?: FormBuilderProps['onCancel'];
}

/**
 * Dispatches a field to the component family that renders it.
 *
 * Three families exist, each with different state needs: presentational blocks
 * (no value), action buttons (no value, but submission-aware) and inputs (value
 * plus validation and conditions). Everything type-specific below the input
 * family lives in `controls/`.
 *
 * @remarks
 * Value changes are not reported through this component. `useChangeNotifier`
 * observes the store instead, so it also catches changes made by the workflow
 * engine rather than by direct user input.
 */
export const FormFieldRenderer = memo<FormFieldRendererProps>(({ field, onCancel, isDisabled }) => {
  if (BLOCK_TYPES.has(field.type)) {
    return <BlockField field={field as Extract<FormField, { type: 'block' | 'spacer' }>} />;
  }

  if (BUTTON_TYPES.has(field.type)) {
    return <ButtonField field={field as ButtonFieldType} onCancel={onCancel} disabled={isDisabled} />;
  }

  return <InputField field={field as Extract<FormField, { name: string }>} />;
});

FormFieldRenderer.displayName = 'FormFieldRenderer';
