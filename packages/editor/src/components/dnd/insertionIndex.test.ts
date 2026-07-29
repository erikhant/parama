import { describe, expect, it } from 'vitest';
import { resolveInsertionIndex, type DragRect } from './insertionIndex';

/** A 100×40 field sitting at (0, 100) — midpoint (50, 120). */
const overRect: DragRect = { left: 0, top: 100, width: 100, height: 40, right: 100, bottom: 140 };

const pointer = (left: number, top: number): DragRect => ({
  left,
  top,
  width: 20,
  height: 20,
  right: left + 20,
  bottom: top + 20
});

describe('resolveInsertionIndex', () => {
  describe('within the same row', () => {
    // Fields sit side by side on a grid row, so a horizontal comparison decides
    // whether the drop lands before or after the hovered field.
    it('inserts before when the pointer is left of centre', () => {
      const index = resolveInsertionIndex({ overIndex: 2, overRect, translated: pointer(0, 110), initial: pointer(0, 0) });

      expect(index).toBe(2);
    });

    it('inserts after when the pointer is right of centre', () => {
      const index = resolveInsertionIndex({
        overIndex: 2,
        overRect,
        translated: pointer(80, 110),
        initial: pointer(0, 0)
      });

      expect(index).toBe(3);
    });

    it('treats a pointer just above the row as still in it', () => {
      // Tolerance is min(12, height * 0.15) = 6px here.
      const index = resolveInsertionIndex({
        overIndex: 2,
        overRect,
        translated: pointer(80, 87),
        initial: pointer(0, 0)
      });

      expect(index).toBe(3);
    });
  });

  describe('across rows', () => {
    it('inserts before when the pointer sits above the field', () => {
      const index = resolveInsertionIndex({ overIndex: 2, overRect, translated: pointer(0, 0), initial: pointer(0, 0) });

      expect(index).toBe(2);
    });

    it('inserts after when the pointer sits below the field', () => {
      const index = resolveInsertionIndex({
        overIndex: 2,
        overRect,
        translated: pointer(0, 300),
        initial: pointer(0, 0)
      });

      expect(index).toBe(3);
    });
  });

  describe('without a translated rect', () => {
    // dnd-kit has no translated rect on the first move event; falling back to a
    // vertical comparison keeps the indicator from jumping to index 0.
    it('compares the initial position vertically', () => {
      expect(resolveInsertionIndex({ overIndex: 2, overRect, translated: null, initial: pointer(0, 200) })).toBe(3);
      expect(resolveInsertionIndex({ overIndex: 2, overRect, translated: null, initial: pointer(0, 10) })).toBe(2);
    });

    it('treats a missing initial rect as the top of the document', () => {
      expect(resolveInsertionIndex({ overIndex: 2, overRect, translated: null, initial: null })).toBe(2);
    });
  });
});
