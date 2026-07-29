/** Id of the canvas' scroll container. */
const CANVAS_SCROLL_ID = 'canvas-scroll';

/** Distance from an edge, in pixels, at which scrolling kicks in. */
const EDGE_THRESHOLD = 60;

/** Pixels scrolled per drag-move event while inside the threshold. */
const SCROLL_STEP = 18;

/**
 * Scrolls the canvas when a drag approaches its top or bottom edge.
 *
 * Without this a long form cannot be reordered end to end: the pointer reaches
 * the edge of the viewport with the drop target still off-screen.
 *
 * @param pointerY - The dragged item's current viewport Y position
 */
export function autoScrollCanvas(pointerY: number): void {
  const container = document.getElementById(CANVAS_SCROLL_ID);
  if (!container) return;

  const { top, bottom } = container.getBoundingClientRect();

  if (pointerY < top + EDGE_THRESHOLD) {
    container.scrollTop -= SCROLL_STEP;
  } else if (pointerY > bottom - EDGE_THRESHOLD) {
    container.scrollTop += SCROLL_STEP;
  }
}
