import type { FormField } from '@parama-dev/form-builder-types';
import type { ComponentType } from 'react';
import { CheckboxControl, RadioControl } from './ChoiceControl';
import { DateControl } from './DateControl';
import { FileControl } from './FileControl';
import { AutoCompleteControl, MultiSelectControl, SelectControl } from './SelectControl';
import { HiddenControl, TextareaControl, TextControl } from './TextControl';
import type { ControlProps } from './types';

export type { ControlProps, CommonInputProps } from './types';

/**
 * Maps a field's `type` to the component that renders it.
 *
 * A lookup table rather than a `switch`: adding a field type means adding one
 * entry and one file, with no edit to the rendering shell. Types absent from
 * this table fall through to the shell's unsupported-field placeholder.
 */
export const CONTROL_REGISTRY: Partial<Record<FormField['type'], ComponentType<ControlProps<any>>>> = {
  text: TextControl,
  email: TextControl,
  password: TextControl,
  number: TextControl,
  tel: TextControl,
  url: TextControl,
  textarea: TextareaControl,
  hidden: HiddenControl,
  date: DateControl,
  radio: RadioControl,
  checkbox: CheckboxControl,
  select: SelectControl,
  multiselect: MultiSelectControl,
  autocomplete: AutoCompleteControl,
  file: FileControl
};

/** Resolves the control for a field type, or `undefined` if unsupported. */
export function resolveControl(type: FormField['type']): ComponentType<ControlProps<any>> | undefined {
  return CONTROL_REGISTRY[type];
}
