import type { DateField } from '@parama-dev/form-builder-types';
import type { DateRange } from '@parama-ui/react';

/** True when `value` can be read as a usable date. */
export function isDateLike(value: unknown): boolean {
  if (!value) return false;
  if (value instanceof Date) return !isNaN(value.getTime());
  if (typeof value === 'string') return !isNaN(Date.parse(value));
  return false;
}

/** Coerces a date-like value into a `Date`, or `undefined` if it is unusable. */
export function toDate(value: unknown): Date | undefined {
  if (!isDateLike(value)) return undefined;
  return value instanceof Date ? value : new Date(value as string);
}

/** Reads a `single`-mode value. */
export function toSingleDate(value: unknown): Date | undefined {
  return toDate(value);
}

/** Reads a `multiple`-mode value, dropping entries that are not dates. */
export function toMultipleDates(value: unknown): Date[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map(toDate).filter((date): date is Date => date !== undefined);
}

/** Reads a `range`-mode value. Either end may be absent. */
export function toDateRange(value: unknown): DateRange | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;

  const candidate = value as { from?: unknown; to?: unknown };
  if (!('from' in candidate) && !('to' in candidate)) return undefined;

  return { from: toDate(candidate.from), to: toDate(candidate.to) };
}

/** Shape consumed by the date picker's `disabled` prop. */
export interface DisabledDates {
  before?: Date;
  after?: Date;
  dayOfWeek?: number[];
}

/**
 * Translates a date field's restriction options into picker `disabled` rules.
 *
 * Only the keys that are actually restricted are emitted. react-day-picker
 * chooses its matcher by inspecting which keys exist: an object carrying *both*
 * `before` and `after` is read as a `DateInterval`, so emitting an undefined
 * `after` alongside a real `before` made every comparison false and disabled
 * nothing at all.
 *
 * @returns The matcher, or `undefined` when no restriction applies.
 */
export function toDisabledDates(options: DateField['options']): DisabledDates | undefined {
  const disabled: DisabledDates = {};

  if (options?.disabledPast) disabled.before = new Date();
  if (options?.disabledFuture) disabled.after = new Date();
  if (options?.disabledWeekdays) disabled.dayOfWeek = options.disabledWeekdays;

  return Object.keys(disabled).length > 0 ? disabled : undefined;
}
