import type { DateField, FormField } from '@parama-dev/form-builder-types';
import {
  Badge,
  Button,
  DatePicker,
  DatePickerProps,
  DateRange,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  FormItem,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch
} from '@parama-ui/react';
import { Calendar1Icon, CalendarDaysIcon, CalendarRangeIcon, Plus, XIcon } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { NameField } from '../common/NameField';
import { DATE_FORMAT_OPTIONS, WEEKDAYS } from '../constants';
import { useFieldSettings } from '../hooks/useFieldSettings';
import { SectionPanel } from '../SectionPanel';
import type { SectionProps } from './types';

type DateOptions = NonNullable<DateField['options']>;

/** Reads the stored restricted-month pair back into a picker range. */
function toRestrictedRange(options: DateField['options']): DateRange | undefined {
  const months = options?.restrictedMonths;
  if (!months || months.length < 2) return undefined;

  return { from: new Date(months[0]), to: new Date(months[1]) };
}

/**
 * Properties panel for date fields.
 *
 * Nearly every control here writes into the same nested `options` object, so
 * they all go through one `patchOptions` helper rather than each rebuilding the
 * spread by hand.
 */
export const DateProperties = memo<SectionProps<DateField>>(({ field, onChange }) => {
  const { isReadOnly, isEditable } = useFieldSettings();
  const [restrictedDates, setRestrictedDates] = useState<DateRange | undefined>(() =>
    toRestrictedRange(field.options)
  );

  /** Merges a patch into the field's `options`, leaving the rest intact. */
  const patchOptions = useCallback(
    (patch: Partial<DateOptions>) => onChange({ options: { ...field.options, ...patch } } as Partial<FormField>),
    [field.options, onChange]
  );

  const handleModeChange = useCallback(
    (mode: string) => {
      const isSingle = mode === 'single';
      onChange({
        mode: mode as DatePickerProps['mode'],
        // A value selected under one mode is meaningless under another.
        value: undefined,
        options: {
          ...field.options,
          min: isSingle ? undefined : field.options?.min,
          max: isSingle ? undefined : field.options?.max,
          restrictedMonths: mode !== field.mode ? undefined : field.options?.restrictedMonths
        }
      } as Partial<FormField>);
    },
    [field.mode, field.options, onChange]
  );

  /** Parses a bound, discarding it if it would cross the opposite bound. */
  const handleBoundChange = useCallback(
    (bound: 'min' | 'max') => (event: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = event.target.value ? parseInt(event.target.value, 10) : undefined;
      const opposite = bound === 'min' ? field.options?.max : field.options?.min;
      const crosses =
        parsed !== undefined && opposite !== undefined && (bound === 'min' ? parsed > opposite : parsed < opposite);

      patchOptions({ [bound]: crosses ? undefined : parsed });
    },
    [field.options, patchOptions]
  );

  const handleRestrictedChange = useCallback(
    (dates: unknown) => {
      const range = dates as DateRange;
      setRestrictedDates(range);
      patchOptions({
        restrictedMonths: [range?.from?.toString(), range?.to?.toString()].filter((d): d is string => Boolean(d))
      });
    },
    [patchOptions]
  );

  const handleResetRestricted = useCallback(() => {
    setRestrictedDates(undefined);
    patchOptions({ restrictedMonths: undefined });
  }, [patchOptions]);

  const handleWeekdayToggle = useCallback(
    (day: number, checked: boolean) => {
      const current = field.options?.disabledWeekdays ?? [];
      const next = checked ? [...current, day] : current.filter((entry) => entry !== day);

      // Weekday restrictions and past/future restrictions are mutually
      // exclusive in the picker's matcher, so selecting one clears the other.
      patchOptions({ disabledPast: false, disabledFuture: false, disabledWeekdays: next });
    },
    [field.options?.disabledWeekdays, patchOptions]
  );

  const handleWeekdayRemove = useCallback(
    (day: number) => {
      const next = (field.options?.disabledWeekdays ?? []).filter((entry) => entry !== day);
      patchOptions({ disabledWeekdays: next.length > 0 ? next : undefined });
    },
    [field.options?.disabledWeekdays, patchOptions]
  );

  const isRanged = field.mode === 'range' || field.mode === 'multiple';
  const disabledWeekdays = field.options?.disabledWeekdays ?? [];

  return (
    <SectionPanel title="Properties">
      <FormItem>
        <Label>Placeholder</Label>
        <Input
          type="text"
          placeholder="e.g. Select date"
          value={field.placeholder || ''}
          disabled={isReadOnly}
          onChange={(event) => onChange({ placeholder: event.target.value } as Partial<FormField>)}
        />
      </FormItem>

      <NameField value={field.name || ''} onChange={(name) => onChange({ name } as Partial<FormField>)} />

      <FormItem>
        <Label>Mode</Label>
        <Select value={field.mode} disabled={isReadOnly} onValueChange={handleModeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">
              <Calendar1Icon className="inline mr-2 size-4" />
              Single
            </SelectItem>
            <SelectItem value="multiple">
              <CalendarDaysIcon className="inline mr-2 size-4" />
              Multiple
            </SelectItem>
            <SelectItem value="range">
              <CalendarRangeIcon className="inline mr-2 size-4" />
              Range
            </SelectItem>
          </SelectContent>
        </Select>
      </FormItem>

      <FormItem>
        <Label>Date format</Label>
        <Select
          value={field.options?.dateFormat}
          disabled={isReadOnly}
          onValueChange={(dateFormat) => patchOptions({ dateFormat })}>
          <SelectTrigger defaultValue={field.options?.dateFormat}>
            <SelectValue placeholder="Choose format" />
          </SelectTrigger>
          <SelectContent>
            {DATE_FORMAT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormItem>

      {isRanged && (
        <div className="flex space-x-4">
          <FormItem className="flex-1">
            <Label>Min selected</Label>
            <Input
              type="number"
              min={0}
              max={field.options?.max}
              disabled={isReadOnly}
              value={field.options?.min || ''}
              onChange={handleBoundChange('min')}
            />
          </FormItem>
          <FormItem className="flex-1">
            <Label>Max selected</Label>
            <Input
              type="number"
              min={field.options?.min || 0}
              value={field.options?.max || ''}
              disabled={isReadOnly}
              onChange={handleBoundChange('max')}
            />
          </FormItem>
        </div>
      )}

      <FormItem>
        <div className={`flex items-center justify-between ${!restrictedDates ? 'py-1.5' : ''}`}>
          <Label>Restricted months</Label>
          {restrictedDates && (
            <Button
              variant="ghost"
              size="xs"
              className="text-xs text-gray-600"
              color="secondary"
              onClick={handleResetRestricted}>
              Reset
            </Button>
          )}
        </div>
        <DatePicker
          mode="range"
          disabled={isReadOnly}
          selected={restrictedDates}
          placeholder="Select months"
          onSelect={handleRestrictedChange}
        />
        <p className="form-description">
          This will restrict the date picker to only allow selection within this range.
        </p>
      </FormItem>

      <FormItem orientation="horizontal">
        <div className="form-captions !col-span-4">
          <Label htmlFor="past-dates">Disable past</Label>
          <p className="form-description">Prevent selection of past dates</p>
        </div>
        <div className="col-span-1 flex items-center justify-end">
          <Switch
            id="past-dates"
            disabled={isReadOnly}
            checked={field.options?.disabledPast || false}
            onCheckedChange={(disabledPast) => patchOptions({ disabledPast })}
          />
        </div>
      </FormItem>

      <FormItem orientation="horizontal">
        <div className="form-captions !col-span-4">
          <Label htmlFor="future-dates">Disable future</Label>
          <p className="form-description">Prevent selection of future dates</p>
        </div>
        <div className="col-span-1 flex items-center justify-end">
          <Switch
            id="future-dates"
            disabled={isReadOnly}
            checked={field.options?.disabledFuture || false}
            onCheckedChange={(disabledFuture) => patchOptions({ disabledFuture })}
          />
        </div>
      </FormItem>

      <FormItem orientation="horizontal">
        <div className="form-captions !col-span-4">
          <Label htmlFor="disabled-weekdays">Disable weekdays</Label>
          <p className="form-description">Prevent selection of weekdays</p>

          {disabledWeekdays.length > 0 && (
            <div className="flex items-center gap-0.5 mt-2">
              {WEEKDAYS.filter((day) => disabledWeekdays.includes(day.value)).map((day) => (
                <Badge key={day.value} size="xs" className="pr-0.5">
                  {day.label.substring(0, 3)}
                  <button className="ml-1" onClick={() => handleWeekdayRemove(day.value)}>
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-1 flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="xs" color="secondary" disabled={!isEditable} variant="ghost">
                <Plus size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {WEEKDAYS.map((day) => (
                <DropdownMenuCheckboxItem
                  key={day.value}
                  checked={disabledWeekdays.includes(day.value)}
                  onCheckedChange={(checked) => handleWeekdayToggle(day.value, checked)}>
                  {day.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </FormItem>
    </SectionPanel>
  );
});

DateProperties.displayName = 'DateProperties';
