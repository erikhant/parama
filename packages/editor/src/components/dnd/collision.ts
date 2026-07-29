import { closestCorners, rectIntersection } from '@dnd-kit/core';

/** How much a horizontal offset counts relative to a vertical one when ranking. */
const HORIZONTAL_WEIGHT = 0.2;

/**
 * Collision strategy tuned for a column grid.
 *
 * dnd-kit's stock strategies treat both axes equally, which makes a pointer
 * moving down a narrow column snap sideways to whichever field happens to be
 * closest. Weighting vertical distance far more heavily keeps the drop target
 * on the row the pointer is actually over, while the small horizontal term
 * still allows swapping between fields sharing a row.
 *
 * Real rectangle intersections win outright when there are any — they are exact,
 * and the ranking below is only a fallback for pointers in the gaps.
 */
export const verticalGridCollision = (args: any) => {
  const intersections = rectIntersection(args);
  if (intersections.length > 0) return intersections;

  const { droppableContainers, pointerCoordinates } = args;
  if (!pointerCoordinates) return closestCorners(args);

  return droppableContainers
    .map((container: any) => {
      const rect = container.rect.current?.translated ?? container.rect.current;
      if (!rect) return null;

      const dx = Math.abs(pointerCoordinates.x - (rect.left + rect.width / 2));
      const dy = Math.abs(pointerCoordinates.y - (rect.top + rect.height / 2));

      return { id: container.id, score: dy + dx * HORIZONTAL_WEIGHT };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.score - b.score)
    .map((entry: any) => ({ id: entry.id }));
};
