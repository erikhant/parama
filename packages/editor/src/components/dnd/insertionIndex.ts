/** The rectangle shape dnd-kit reports for dragged and hovered elements. */
export interface DragRect {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export interface InsertionQuery {
  /** Position of the field currently under the pointer. */
  overIndex: number;
  /** That field's bounding box. */
  overRect: DragRect;
  /** The dragged item's current box; null on the first move event. */
  translated: DragRect | null;
  /** The dragged item's box at drag start. */
  initial: DragRect | null;
}

/** Largest gap, in pixels, still counted as the same grid row. */
const MAX_ROW_TOLERANCE = 12;

/** Fraction of a field's height used as row tolerance when it is short. */
const ROW_TOLERANCE_RATIO = 0.15;

/**
 * Decides where a dragged item should land relative to the field under it.
 *
 * Fields sit on a 12-column grid, so several can share a row. Which comparison
 * applies depends on where the pointer is: inside the hovered field's row the
 * decision is horizontal (before or after its neighbour), and across rows it is
 * vertical.
 *
 * The row test carries a small tolerance so that hovering exactly on a row
 * boundary does not flip the indicator back and forth.
 *
 * @returns The index the dragged item should occupy.
 */
export function resolveInsertionIndex({ overIndex, overRect, translated, initial }: InsertionQuery): number {
  const midpointY = overRect.top + overRect.height / 2;

  // No translated rect yet — dnd-kit has not reported movement, so only the
  // starting position is known and a vertical comparison is all that is left.
  if (!translated) {
    const pointerTop = initial?.top ?? 0;
    return pointerTop > midpointY ? overIndex + 1 : overIndex;
  }

  const pointerX = translated.left + (initial?.width ?? 0) / 2;
  const pointerY = translated.top + (initial?.height ?? 0) / 2;
  const midpointX = overRect.left + overRect.width / 2;

  const tolerance = Math.min(MAX_ROW_TOLERANCE, overRect.height * ROW_TOLERANCE_RATIO);
  const isSameRow = pointerY > overRect.top - tolerance && pointerY < overRect.bottom + tolerance;

  const insertAfter = isSameRow ? pointerX > midpointX : pointerY > midpointY;
  return insertAfter ? overIndex + 1 : overIndex;
}
