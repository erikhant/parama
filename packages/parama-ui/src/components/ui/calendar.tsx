import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('calendar', className)}
      classNames={{
        months: 'calendar-months',
        month: 'calendar-month',
        caption: 'calendar-caption',
        caption_label: 'calendar-caption-label',
        nav: 'calendar-nav',
        nav_button: cn('btn', 'btn-secondary-outline', 'calendar-nav-button'),
        nav_button_previous: 'calendar-prev-button',
        nav_button_next: 'calendar-next-button',
        table: 'calendar-table',
        head_row: 'calendar-head-row',
        head_cell: 'calendar-head-cell',
        row: 'calendar-row',
        cell: 'calendar-cell',
        day: cn('btn', 'btn-secondary-outline', 'calendar-day'),
        day_range_end: 'day-range-end',
        day_selected: 'calendar-day-selected',
        day_today: 'calendar-today',
        day_outside: 'day-outside calendar-day-outside',
        day_disabled: 'calendar-day-disabled',
        day_range_middle: 'calendar-day-range-mid',
        day_hidden: 'calendar-day-hidden',
        ...classNames
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft
            className={cn('calendar-arrow-icon', className)}
            {...props}
          />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight
            className={cn('calendar-arrow-icon', className)}
            {...props}
          />
        )
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
