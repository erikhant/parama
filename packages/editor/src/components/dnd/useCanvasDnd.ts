import type { DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core';
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { FormField, PresetTypeDef } from '@parama-dev/form-builder-types';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useEditor } from '../../store/useEditor';
import { createField } from '../fieldFactory';
import { autoScrollCanvas } from './autoScroll';
import { resolveInsertionIndex } from './insertionIndex';

/** Pixels the pointer must travel before a drag begins, so clicks still register. */
const DRAG_ACTIVATION_DISTANCE = 5;

/**
 * Owns the canvas drag-and-drop interaction.
 *
 * Two kinds of drag land here and they mean different things: an item from the
 * toolbox *creates* a field (or a preset's worth of fields), while an item from
 * the canvas *reorders* one. Both resolve to a target index first, then act —
 * previously each of the six drop paths recomputed that index and re-inlined
 * the insertion logic, so the preset branch alone existed in triplicate.
 */
export function useCanvasDnd() {
  const actions = useFormBuilder((state) => state.actions);
  const fields = useFormBuilder((state) => state.schema.fields);
  const { editor, canvas, toolbox } = useEditor();

  const [activeId, setActiveId] = useState<string | null>(null);

  // Mirrors the store value so a drag move that resolves to the same index
  // does not publish a no-op update on every pointer event.
  const lastIndexRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const setInsertionIndex = useCallback(
    (index: number | null) => {
      if (lastIndexRef.current === index) return;
      lastIndexRef.current = index;
      editor.setInsertionIndex(index);
    },
    [editor]
  );

  /**
   * Inserts a preset's fields at `index`.
   * Fields whose ids already exist are skipped, and a preset that adds nothing
   * reports why rather than failing silently.
   */
  const insertPreset = useCallback(
    (presetId: string, index: number | null) => {
      const preset = toolbox.presets.find((entry) => entry.id === presetId) as PresetTypeDef | undefined;
      if (!preset?.fields?.length) return;

      const existingIds = new Set(fields.map((field) => field.id));
      const additions = preset.fields.filter((field) => !existingIds.has(field.id));

      if (additions.length === 0) {
        toast.warning('Preset fields already exist in the canvas');
        return;
      }

      if (index === null) {
        additions.forEach((field) => actions.addField(field));
      } else {
        additions.forEach((field, offset) => actions.insertField(index + offset, field));
      }

      actions.selectField(additions[0].id);
    },
    [toolbox.presets, fields, actions]
  );

  /** Creates one field of `type` at `index`, or appends it when there is no index. */
  const insertNewField = useCallback(
    (type: string, index: number | null) => {
      const field = createField(type);

      if (index === null) {
        actions.addField(field);
      } else {
        actions.insertField(index, field);
      }

      actions.selectField(field.id);
    },
    [actions]
  );

  /** Moves an existing field to `targetIndex`, clamped inside the list. */
  const moveField = useCallback(
    (fieldId: string, targetIndex: number) => {
      const fromIndex = fields.findIndex((field) => field.id === fieldId);
      if (fromIndex === -1) return;

      const toIndex = Math.max(0, Math.min(fields.length - 1, targetIndex));
      actions.updateFields(arrayMove(actions.getFields(), fromIndex, toIndex) as FormField[]);
      actions.selectField(fieldId);
    },
    [fields, actions]
  );

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      setActiveId(active.id as string);

      const data = active.data?.current;
      editor.setDragSource(data?.fromToolbox ? 'toolbox' : data?.fromCanvas ? 'canvas' : null);

      // An empty canvas has no field to hover, so the only valid target is index 0.
      if (fields.length === 0) editor.setInsertionIndex(0);
    },
    [editor, fields.length]
  );

  const handleDragMove = useCallback(
    ({ active, over }: DragMoveEvent) => {
      if (!active) return;

      autoScrollCanvas(active.rect.current.translated?.top ?? active.rect.current.initial?.top ?? 0);

      // Reordering uses dnd-kit's own sorting, so only toolbox drags need an
      // insertion indicator.
      if (!active.data.current?.fromToolbox) return;

      // Past the last field, or over the end marker: append.
      if (!over || over.data?.current?.indicator) {
        setInsertionIndex(fields.length);
        return;
      }

      if (!over.data.current?.fromCanvas) return;

      const overElement = document.querySelector(`[data-id="${over.id}"]`);
      if (!overElement) return;

      setInsertionIndex(
        resolveInsertionIndex({
          overIndex: fields.findIndex((field) => field.id === over.id),
          overRect: overElement.getBoundingClientRect(),
          translated: active.rect.current.translated ?? null,
          initial: active.rect.current.initial ?? null
        })
      );
    },
    [fields, setInsertionIndex]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      const insertionIndex = canvas.currentInsertionIndex;
      const data = active.data.current;

      setActiveId(null);
      lastIndexRef.current = null;
      editor.setInsertionIndex(null);
      editor.setDragSource(null);

      // Toolbox items dropped back on the toolbox are a cancelled drag.
      if (over?.data.current?.fromToolbox && data?.fromToolbox) return;

      if (data?.fromToolbox) {
        // Resolve the target once: the drag-move indicator wins, then the
        // hovered field's position, and appending is the last resort.
        const overIndex = over?.data.current?.fromCanvas
          ? fields.findIndex((field) => field.id === over.id)
          : null;
        const targetIndex =
          insertionIndex ?? (over?.data.current?.indicator ? fields.length : (overIndex ?? null));

        if (data.type === 'preset') {
          insertPreset(active.id as string, targetIndex);
        } else {
          insertNewField(data.type as string, targetIndex);
        }
        return;
      }

      if (!data?.fromCanvas) return;

      if (over?.data.current?.fromCanvas) {
        moveField(active.id as string, fields.findIndex((field) => field.id === over.id));
        return;
      }

      // Dropped on the end marker or outside any field: fall back to the
      // indicator's index, otherwise leave the field where it is.
      if (insertionIndex !== null) moveField(active.id as string, insertionIndex);
    },
    [canvas.currentInsertionIndex, editor, fields, insertPreset, insertNewField, moveField]
  );

  return { sensors, activeId, handleDragStart, handleDragMove, handleDragEnd };
}
