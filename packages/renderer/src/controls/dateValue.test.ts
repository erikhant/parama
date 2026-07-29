import { describe, expect, it } from 'vitest';
import { isDateLike, toDate, toDateRange, toDisabledDates, toMultipleDates, toSingleDate } from './dateValue';

describe('isDateLike', () => {
  it.each([
    ['a Date', new Date('2024-01-01'), true],
    ['an ISO string', '2024-01-01', true],
    ['an Invalid Date', new Date('nope'), false],
    ['an unparseable string', 'not-a-date', false],
    ['null', null, false],
    ['undefined', undefined, false]
  ])('reports %s as %s', (_label, value, expected) => {
    expect(isDateLike(value)).toBe(expected);
  });
});

describe('toDate', () => {
  it('passes a valid Date through by reference', () => {
    const date = new Date('2024-01-01');
    expect(toDate(date)).toBe(date);
  });

  it('parses an ISO string', () => {
    expect(toDate('2024-03-15')?.getUTCFullYear()).toBe(2024);
  });

  it('returns undefined for unusable input', () => {
    expect(toDate('garbage')).toBeUndefined();
  });
});

describe('toSingleDate', () => {
  it('reads a single date value', () => {
    expect(toSingleDate('2024-01-01')).toBeInstanceOf(Date);
  });

  it('returns undefined when empty', () => {
    expect(toSingleDate(undefined)).toBeUndefined();
  });
});

describe('toMultipleDates', () => {
  it('maps an array of date-likes', () => {
    expect(toMultipleDates(['2024-01-01', new Date('2024-02-01')])).toHaveLength(2);
  });

  it('drops entries that are not dates', () => {
    expect(toMultipleDates(['2024-01-01', 'garbage', null])).toHaveLength(1);
  });

  it('returns undefined for a non-array', () => {
    expect(toMultipleDates('2024-01-01')).toBeUndefined();
  });
});

describe('toDateRange', () => {
  it('reads both ends of a range', () => {
    const range = toDateRange({ from: '2024-01-01', to: '2024-02-01' });

    expect(range?.from).toBeInstanceOf(Date);
    expect(range?.to).toBeInstanceOf(Date);
  });

  it('tolerates a half-open range', () => {
    const range = toDateRange({ from: '2024-01-01' });

    expect(range?.from).toBeInstanceOf(Date);
    expect(range?.to).toBeUndefined();
  });

  it('returns undefined for an array or a plain date', () => {
    expect(toDateRange(['2024-01-01'])).toBeUndefined();
    expect(toDateRange(new Date())).toBeUndefined();
  });
});

describe('toDisabledDates', () => {
  // BUG 1: both keys were emitted unconditionally. react-day-picker reads an
  // object carrying *both* `before` and `after` as a DateInterval and compares
  // against `undefined`, which is always false — so `disabledPast` on its own
  // disabled nothing at all.
  it('omits the after bound when only past dates are disabled', () => {
    const result = toDisabledDates({ disabledPast: true });

    expect(result).toHaveProperty('before');
    expect(result).not.toHaveProperty('after');
  });

  it('omits the before bound when only future dates are disabled', () => {
    const result = toDisabledDates({ disabledFuture: true });

    expect(result).toHaveProperty('after');
    expect(result).not.toHaveProperty('before');
  });

  it('emits both bounds when both are disabled', () => {
    const result = toDisabledDates({ disabledPast: true, disabledFuture: true });

    expect(result?.before).toBeInstanceOf(Date);
    expect(result?.after).toBeInstanceOf(Date);
  });

  it('returns undefined when nothing is restricted', () => {
    expect(toDisabledDates({})).toBeUndefined();
    expect(toDisabledDates(undefined)).toBeUndefined();
  });

  it('carries disabled weekdays through', () => {
    expect(toDisabledDates({ disabledWeekdays: [0, 6] })).toEqual({ dayOfWeek: [0, 6] });
  });
});
