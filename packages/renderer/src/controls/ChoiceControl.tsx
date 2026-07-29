import type { CheckboxField, FieldGroupItem, RadioField } from '@parama-dev/form-builder-types';
import { Checkbox, Label, RadioGroup, RadioGroupItem } from '@parama-ui/react';
import { memo, useCallback } from 'react';
import type { ControlProps } from './types';

/** Items missing an id, value or label cannot be rendered. */
const isRenderable = (item: FieldGroupItem) => Boolean(item.id && item.value && item.label);

/** Single-choice radio list. */
export const RadioControl = memo<ControlProps<RadioField>>(
  ({ field, value, onChange, isDisabled, isRequired }) => {
    const selected = (value as string) ?? '';

    return (
      <RadioGroup
        name={field.name}
        defaultValue={selected}
        disabled={isDisabled}
        required={isRequired}
        onValueChange={onChange}
        orientation={field.appearance?.position}>
        {(field.items || []).filter(isRenderable).map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <RadioGroupItem value={item.value} id={item.id as string} checked={item.value === selected} />
            <Label htmlFor={item.id as string}>{item.label}</Label>
          </div>
        ))}
      </RadioGroup>
    );
  }
);
RadioControl.displayName = 'RadioControl';

/**
 * Multi-choice checkbox list.
 *
 * The value is an array of the checked items' values; toggling rebuilds that
 * array rather than mutating it, so the store always receives a fresh
 * reference.
 */
export const CheckboxControl = memo<ControlProps<CheckboxField>>(
  ({ field, value, onChange, isDisabled }) => {
    const selected: string[] = Array.isArray(value) ? value : [];

    const toggle = useCallback(
      (item: FieldGroupItem) => (checked: boolean | 'indeterminate') => {
        const without = selected.filter((entry) => entry !== item.value);
        onChange(checked === true ? [...without, item.value] : without);
      },
      [selected, onChange]
    );

    return (
      <>
        {(field.items || []).filter(isRenderable).map((item) => (
          <div className="flex items-center space-x-2" key={item.id}>
            <Checkbox
              id={item.id as string}
              name={field.name}
              disabled={isDisabled || item.disabled}
              value={item.value}
              checked={selected.includes(item.value)}
              onCheckedChange={toggle(item)}
              className="mr-2"
            />
            <Label htmlFor={item.id as string}>{item.label}</Label>
          </div>
        ))}
      </>
    );
  }
);
CheckboxControl.displayName = 'CheckboxControl';
