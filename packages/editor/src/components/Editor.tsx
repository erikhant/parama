import { DndContext } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useFormBuilder } from '@parama-dev/form-builder-core';
import type { FormEditorProps } from '@parama-dev/form-builder-types';
import { cn } from '@parama-ui/react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { FieldOverlay, FormCanvas } from '../canvas';
import { EditorPanel } from '../properties/EditorPanel';
import { useEditor } from '../store/useEditor';
import { ToolboxItemOverlay, ToolboxPanel } from '../toolbox';
import { verticalGridCollision } from './dnd/collision';
import { useCanvasDnd } from './dnd/useCanvasDnd';
import { DragPreview } from './DragPreview';
import { Toolbar } from './Toolbar';

/**
 * The form editor: toolbox, canvas and properties panel inside one drag context.
 *
 * Layout and wiring only. The drag interaction lives in {@link useCanvasDnd},
 * the drop-target ranking in {@link verticalGridCollision}, and the shape of a
 * newly dropped field in `fieldFactory` — this component previously carried all
 * three inline, which put ~450 lines between the toolbar and the panel it
 * renders.
 */
export const Editor = ({ onSaveSchema }: { onSaveSchema: FormEditorProps['onSaveSchema'] }) => {
  const changeMode = useFormBuilder((state) => state.actions.changeMode);
  const { editor } = useEditor();

  const { sensors, activeId, handleDragStart, handleDragMove, handleDragEnd } = useCanvasDnd();

  // The store defaults to render mode; mounting the editor switches it, which
  // is what makes conditions stop hiding fields the author is editing.
  useEffect(() => {
    changeMode('editor');
  }, [changeMode]);

  return (
    <>
      <Toolbar onSaveSchema={onSaveSchema} />

      <DndContext
        sensors={sensors}
        collisionDetection={verticalGridCollision}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}>
        <div
          className={cn(
            'editor-container flex h-[calc(100vh_-_3rem)] overflow-hidden',
            editor.options?.containerClassname
          )}>
          <ToolboxPanel />
          <FormCanvas />
          <EditorPanel />
        </div>

        {/* Both overlays render; each resolves to null unless the dragged id is
            one of its own, so the same id can come from either source. */}
        {activeId && (
          <>
            <DragPreview>
              <FieldOverlay id={activeId} />
            </DragPreview>
            <DragPreview>
              <ToolboxItemOverlay id={activeId} />
            </DragPreview>
          </>
        )}
      </DndContext>

      <Toaster position="top-center" richColors />
    </>
  );
};
