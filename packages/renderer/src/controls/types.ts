import type { FormField, ValidationState } from '@parama-dev/form-builder-types';

/**
 * The contract every field control implements.
 *
 * A control renders exactly one input. It receives its value and interaction
 * flags from the shell and reports changes back through `onChange`; it never
 * reaches into the store to write. Keeping controls value-in / event-out is
 * what allows them to be rendered in isolation and tested without a store.
 */
export interface ControlProps<TField extends FormField = FormField> {
  field: TField;
  /** Current value from the store, already unwrapped for this field type. */
  value: any;
  /** Commits a new value. Debouncing, if any, is the control's concern. */
  onChange: (value: any) => void;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  validation: ValidationState;
  /** Props shared by the plain HTML-backed inputs (id, name, disabled, …). */
  commonProps: CommonInputProps;
}

export interface CommonInputProps {
  id: string;
  name: string;
  disabled: boolean;
  placeholder?: string;
  required: boolean;
  className: string;
}
