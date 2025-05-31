import * as React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from './calendar';
import { DayPicker } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { FormGroup } from './form-group';
import { Input } from './input';

type DatePickerProps = React.ComponentProps<typeof DayPicker> & {
  container?: Element | DocumentFragment | null | undefined;
  placeholder?: string;
  popoverClassName?: string;
  dateFormat?: string;
  name?: string;
  disabled?: boolean;
};

const DatePicker: React.FC<DatePickerProps> = ({
  container,
  placeholder,
  popoverClassName,
  dateFormat = 'dd/MM/yyyy',
  name,
  disabled = false,
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
            disabled={disabled}
            value={
              props.selected
                ? format(props.selected as Date, dateFormat)
                : (placeholder ?? `Pick a date`)
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
