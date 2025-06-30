'use client';

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonSize = 'sm',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonSize?: React.ComponentProps<typeof Button>['size'];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'calendar-base group/calendar',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
        ...formatters
      }}
      classNames={{
        root: cn('calendar-root', defaultClassNames.root),
        months: cn('calendar-months', defaultClassNames.months),
        month: cn('calendar-month', defaultClassNames.month),
        nav: cn('calendar-nav', defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ size: buttonSize }),
          'btn-secondary btn-secondary-ghost',
          'calendar-prev-button',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ size: buttonSize }),
          'btn-secondary btn-secondary-ghost',
          'calendar-next-button',
          defaultClassNames.button_next
        ),
        month_caption: cn('calendar-month-caption', defaultClassNames.month_caption),
        dropdowns: cn('calendar-dropdowns', defaultClassNames.dropdowns),
        dropdown_root: cn('calendar-dropdown-root', defaultClassNames.dropdown_root),
        dropdown: cn('calendar-dropdown', defaultClassNames.dropdown),
        caption_label: cn(
          'calendar-caption-label',
          captionLayout === 'label'
            ? 'calendar-caption-label--text'
            : 'calendar-caption-label--notext',
          defaultClassNames.caption_label
        ),
        table: 'calendar-table',
        weekdays: cn('calendar-weekdays', defaultClassNames.weekdays),
        weekday: cn('calendar-weekday', defaultClassNames.weekday),
        week: cn('calendar-week', defaultClassNames.week),
        week_number_header: cn('calendar-num-header', defaultClassNames.week_number_header),
        week_number: cn('calendar-week-number', defaultClassNames.week_number),
        day: cn('calendar-day group/day', defaultClassNames.day),
        range_start: cn('calendar-range-start', defaultClassNames.range_start),
        range_middle: cn('calendar-range-middle', defaultClassNames.range_middle),
        range_end: cn('calendar-range-end', defaultClassNames.range_end),
        today: cn('calendar-today', defaultClassNames.today),
        outside: cn('calendar-day-outside', defaultClassNames.outside),
        disabled: cn('calendar-day-disabled', defaultClassNames.disabled),
        hidden: cn('calendar-day-hidden', defaultClassNames.hidden),
        ...classNames
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('calendar-arrow-icon', className)} {...props} />;
          }

          if (orientation === 'right') {
            return <ChevronRightIcon className={cn('calendar-arrow-icon', className)} {...props} />;
          }

          return <ChevronDownIcon className={cn('calendar-arrow-icon', className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="calendar-cell">{children}</div>
            </td>
          );
        },
        ...components
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn('calendar-day-button', defaultClassNames.day, className)}
      {...props}
      color="secondary"
    />
  );
}

export { Calendar, CalendarDayButton };
