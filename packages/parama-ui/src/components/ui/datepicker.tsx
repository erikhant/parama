import * as React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from './calendar';
import { Input } from './input';
import { FormGroup } from './form-group';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

type DatePickerProps = React.ComponentProps<typeof Calendar> & {
  container?: Element | DocumentFragment | null | undefined;
  placeholder?: string;
  popoverClassName?: string;
  dateFormat?: string;
  name?: string;
  disabledInput?: boolean;
  modalPopover?: boolean; // If true, use Popover for modal behavior
};

/**
 * The month a calendar should open on, given whatever is selected.
 *
 * Covers all three selection modes, and tolerates the values a form actually
 * carries — a date-like value can arrive as a string from a JSON payload, and
 * an `Invalid Date` must not be handed to the calendar.
 */
function monthOfSelection(selected: unknown): Date | undefined {
  const first =
    selected instanceof Date || typeof selected === 'string'
      ? selected
      : Array.isArray(selected)
        ? selected[0]
        : selected && typeof selected === 'object' && 'from' in selected
          ? (selected as { from?: unknown }).from
          : undefined;

  if (first === undefined || first === null) return undefined;

  const date = first instanceof Date ? first : new Date(first as string);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  container,
  placeholder,
  popoverClassName,
  dateFormat = 'dd/MM/yyyy',
  name,
  modalPopover = true,
  disabledInput = false,
  ...props
}: DatePickerProps) => {
  /*
   * Open on the selected date's month rather than today's. Without this, editing
   * a record with a 1998 birth date opens the calendar on the current month and
   * the user navigates back two decades to see what is already selected.
   *
   * `defaultMonth` is uncontrolled, so the user can still page away freely; an
   * explicit `defaultMonth` or a controlled `month` from the caller still wins.
   */
  const defaultMonth =
    props.defaultMonth ?? monthOfSelection('selected' in props ? props.selected : undefined);

  return (
    <Popover modal={modalPopover}>
      <PopoverTrigger asChild>
        <FormGroup prefix={(<CalendarIcon size={16} />) as any}>
          <Input
            name={name}
            type="text"
            readOnly
            disabled={disabledInput}
            value={
              props.mode == 'single'
                ? props.selected
                  ? format(props.selected as Date, dateFormat)
                  : (placeholder ?? `Pick a date`)
                : props.mode == 'multiple'
                  ? props.selected && Array.isArray(props.selected)
                    ? (props.selected as Date[]).map((date) => format(date, dateFormat)).join(', ')
                    : (placeholder ?? `Pick multiple dates`)
                  : props.mode == 'range'
                    ? props.selected && props.selected.from && props.selected.to
                      ? `${format(props.selected.from as Date, dateFormat)} - ${format(props.selected.to as Date, dateFormat)}`
                      : (placeholder ?? `Pick a date range`)
                    : ''
            }
          />
        </FormGroup>
      </PopoverTrigger>
      <PopoverContent container={container} align="start" className={cn('datepicker', popoverClassName)}>
        <Calendar {...props} defaultMonth={defaultMonth} />
      </PopoverContent>
    </Popover>
  );
};

DatePicker.displayName = 'DatePicker';

export { DatePicker, DatePickerProps };
