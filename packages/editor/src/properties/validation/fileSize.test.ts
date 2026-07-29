import { describe, expect, it } from 'vitest';
import { bestUnitFor, SIZE_UNITS, toBytes, toDisplayValue } from './fileSize';

const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;

describe('SIZE_UNITS', () => {
  it('is ordered from smallest to largest', () => {
    const multipliers = SIZE_UNITS.map((unit) => unit.multiplier);

    expect(multipliers).toEqual([...multipliers].sort((a, b) => a - b));
  });
});

describe('bestUnitFor', () => {
  it.each([
    ['bytes below 1 KB', 512, 'B'],
    ['exactly 1 KB', KB, 'KB'],
    ['a few MB', 5 * MB, 'MB'],
    ['exactly 1 GB', GB, 'GB'],
    ['zero', 0, 'B']
  ])('picks the unit for %s', (_label, bytes, expected) => {
    expect(bestUnitFor(bytes)).toBe(expected);
  });
});

describe('toDisplayValue', () => {
  it('converts bytes into the requested unit', () => {
    expect(toDisplayValue(5 * MB, 'MB')).toBe(5);
  });

  it('rounds to three decimal places', () => {
    expect(toDisplayValue(1536, 'MB')).toBe(0.001);
  });

  it('leaves a byte value alone', () => {
    expect(toDisplayValue(900, 'B')).toBe(900);
  });
});

describe('toBytes', () => {
  it('converts a unit value back into bytes', () => {
    expect(toBytes(5, 'MB')).toBe(5 * MB);
  });

  it('rounds to a whole number of bytes', () => {
    expect(toBytes(1.5, 'KB')).toBe(1536);
  });

  it('round-trips through toDisplayValue', () => {
    expect(toBytes(toDisplayValue(2 * GB, 'GB'), 'GB')).toBe(2 * GB);
  });
});
