import type { FormField } from '@parama-dev/form-builder-types';

/** The subset of a field that drives its responsive width. */
export interface ResponsiveWidths {
  width?: number;
  widthTablet?: number;
  widthMobile?: number;
}

/**
 * Builds the grid column classes for a field.
 *
 * Tailwind's JIT compiler only emits classes it can see as complete strings, so
 * the safelist in `tailwind.config` must cover the `column-span-*` range these
 * template literals produce.
 *
 * @param field - Any object carrying `width` / `widthTablet` / `widthMobile`
 * @returns Space-separated class names, ready for `cn()`
 *
 * @example
 * columnSpanClass({ width: 6, widthMobile: 12 })
 * // "column-span-6 sm:column-span-12"
 */
export function columnSpanClass(field: ResponsiveWidths | FormField): string {
  const { width, widthTablet, widthMobile } = field as ResponsiveWidths;

  return [
    `column-span-${width}`,
    widthTablet ? `md:column-span-${widthTablet}` : '',
    widthMobile ? `sm:column-span-${widthMobile}` : ''
  ]
    .filter(Boolean)
    .join(' ');
}
