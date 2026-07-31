import type { DateField } from '@parama-dev/form-builder-types';
import { DatePicker, DatePickerProps, DateRange, Skeleton } from '@parama-ui/react';
import { memo, useMemo } from 'react';
import { useDatePickerContainer } from '../hooks/useDatePickerContainer';
import { useFormMode } from '../hooks/useFieldFlags';
import { toDateRange, toDisabledDates, toMultipleDates, toSingleDate } from './dateValue';
import type { ControlProps } from './types';

/**
 * Date input supporting single, multiple and range selection.
 *
 * The displayed dates are derived from the store value rather than mirrored in
 * local state, so an external write (a `setValue` event, a form reset) is
 * reflected without a sync effect.
 */
export const DateControl = memo<ControlProps<DateField>>(({ field, value, onChange, isDisabled, isRequired, validation }) => {
  const mode = useFormMode();
  const container = useDatePickerContainer(field.id, true);

  const disabledDates = useMemo(() => toDisabledDates(field.options), [field.options]);

  const commonProps = useMemo(
    () => ({
      name: field.name,
      disabledInput: isDisabled,
      placeholder: field.placeholder,
      dateFormat: field.options?.dateFormat,
      disabled: disabledDates as DatePickerProps['disabled'],
      modalPopover: false,
      startMonth: field.options?.restrictedMonths?.[0] ? new Date(field.options.restrictedMonths[0]) : undefined,
      endMonth: field.options?.restrictedMonths?.[1] ? new Date(field.options.restrictedMonths[1]) : undefined,
      captionLayout: field.options?.dropdownType as DatePickerProps['captionLayout'],
      className: !validation.isValid ? 'border-red-500' : 'border-stroke-strong'
    }),
    [field.name, field.placeholder, field.options, isDisabled, disabledDates, validation.isValid]
  );

  // The popover portals into the field's own wrapper, which only exists after
  // the first commit. In the editor the picker never opens, so it can render
  // immediately.
  if (!container && mode !== 'editor') {
    return <Skeleton className="h-12">Loading date picker...</Skeleton>;
  }

  if (field.mode === 'single') {
    return (
      <DatePicker
        mode="single"
        required={isRequired}
        selected={toSingleDate(value)}
        onSelect={(date: Date | undefined) => onChange(date)}
        {...commonProps}
        container={container}
      />
    );
  }

  if (field.mode === 'multiple') {
    return (
      <DatePicker
        mode="multiple"
        required
        selected={toMultipleDates(value)}
        onSelect={(dates: Date[]) => onChange(dates)}
        min={field.options?.min}
        max={field.options?.max}
        {...commonProps}
        container={container}
      />
    );
  }

  const range = toDateRange(value);

  return (
    <DatePicker
      mode="range"
      required
      defaultMonth={range?.from}
      selected={range}
      min={field.options?.min}
      max={field.options?.max}
      onSelect={(next: DateRange) => onChange(next)}
      {...commonProps}
      container={container}
    />
  );
});

DateControl.displayName = 'DateControl';
