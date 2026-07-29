/**
 * Byte-size conversion for the file field's max-size control.
 *
 * The schema always stores `maxSize` in bytes; the panel shows it in whichever
 * unit the author picked. Keeping the conversion here means the stored value
 * and the displayed value can never drift apart through a hand-rolled spread.
 */

export type SizeUnit = 'B' | 'KB' | 'MB' | 'GB';

export interface SizeUnitDef {
  label: string;
  value: SizeUnit;
  multiplier: number;
}

/** Supported units, smallest first. */
export const SIZE_UNITS: SizeUnitDef[] = [
  { label: 'Bytes', value: 'B', multiplier: 1 },
  { label: 'KB', value: 'KB', multiplier: 1024 },
  { label: 'MB', value: 'MB', multiplier: 1024 * 1024 },
  { label: 'GB', value: 'GB', multiplier: 1024 * 1024 * 1024 }
];

const multiplierOf = (unit: SizeUnit): number => SIZE_UNITS.find((u) => u.value === unit)?.multiplier ?? 1;

/** The largest unit that still renders the value as at least 1. */
export function bestUnitFor(bytes: number): SizeUnit {
  for (let i = SIZE_UNITS.length - 1; i > 0; i -= 1) {
    if (bytes >= SIZE_UNITS[i].multiplier) return SIZE_UNITS[i].value;
  }
  return 'B';
}

/**
 * Converts bytes into `unit` for display.
 * Rounded to three decimals so the input does not show floating-point noise.
 */
export function toDisplayValue(bytes: number, unit: SizeUnit): number {
  return Math.round((bytes / multiplierOf(unit)) * 1000) / 1000;
}

/** Converts a value expressed in `unit` back into whole bytes. */
export function toBytes(value: number, unit: SizeUnit): number {
  return Math.round(value * multiplierOf(unit));
}
