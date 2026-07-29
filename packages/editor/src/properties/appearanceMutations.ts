import type { TextField } from '@parama-dev/form-builder-types';

/**
 * Pure transitions over a text field's `appearance` decoration slots.
 *
 * Every slot edit is a nested spread — `{ appearance: { ...appearance, [slot]:
 * next } }` — which was written out by hand at each of the eight call sites in
 * the appearance panel. One mistyped spread there silently drops the sibling
 * slot, so the shape is defined once here instead.
 */

/** Decoration slots rendered inside the input itself. */
export type AdornmentSlot = 'prefix' | 'suffix';

/** What a slot can hold: literal text, or the name of a Lucide icon. */
export type AdornmentType = 'text' | 'icon';

export interface Adornment {
  type: AdornmentType;
  content: string;
}

type Appearance = TextField['appearance'];
type AppearanceUpdate = Pick<TextField, 'appearance'>;

/**
 * Sets or clears one slot.
 *
 * @param appearance - The field's current appearance, if any
 * @param slot - Which decoration to write
 * @param adornment - The new value, or `undefined` to remove the decoration
 * @returns A field update ready to hand to `onChange`
 */
export function withAdornment(
  appearance: Appearance,
  slot: AdornmentSlot,
  adornment: Adornment | undefined
): AppearanceUpdate {
  return { appearance: { ...appearance, [slot]: adornment } };
}

/**
 * Switches a slot to a different type, discarding its content.
 *
 * An icon slot holds a Lucide icon name and a text slot holds arbitrary text,
 * so carrying content across a type change would leave the slot displaying a
 * value the new type cannot render.
 */
export function withAdornmentType(
  appearance: Appearance,
  slot: AdornmentSlot,
  type: AdornmentType
): AppearanceUpdate {
  return withAdornment(appearance, slot, { type, content: '' });
}

/**
 * Updates a slot's content, keeping its type.
 *
 * Falls back to a text slot when the slot does not exist yet, so a stray edit
 * cannot produce a slot with no type.
 */
export function withAdornmentContent(
  appearance: Appearance,
  slot: AdornmentSlot,
  content: string
): AppearanceUpdate {
  const type = appearance?.[slot]?.type ?? 'text';
  return withAdornment(appearance, slot, { type, content });
}
