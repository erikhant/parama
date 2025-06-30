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
};

const DatePicker: React.FC<DatePickerProps> = ({
  container,
  placeholder,
  popoverClassName,
  dateFormat = 'dd/MM/yyyy',
  name,
  disabledInput = false,
  ...props
}: DatePickerProps) => {
  return (
    <Popover>
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
      <PopoverContent
        container={container}
        align="start"
        className={cn('datepicker', popoverClassName)}>
        <Calendar {...props} />
      </PopoverContent>
    </Popover>
  );
};

DatePicker.displayName = 'DatePicker';

export { DatePicker, DatePickerProps };
