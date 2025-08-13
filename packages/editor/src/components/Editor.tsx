import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type {
  BlockField,
  ButtonField,
  CheckboxField,
  FieldGroupItem,
  FormEditorProps,
  FormField as FormFieldType,
  PresetTypeDef
} from '@parama-dev/form-builder-types';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { setupWorkflowDebugger, useFormBuilder } from '@parama-dev/form-builder-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldOverlay, FormCanvas } from '../canvas';
import { EditorPanel } from '../properties/EditorPanel';
import { useEditor } from '../store/useEditor';
import { ToolboxItemOverlay, ToolboxPanel } from '../toolbox';
import { DragPreview } from './DragPreview';
import { Toolbar } from './Toolbar';
import { Toaster } from 'sonner';
import { cn } from '@parama-ui/react';

const defineDefaultValue = (type: string) => {
  const newField = {
    id: `field-${Date.now()}`,
    name: `name_${type}`,
    type: type,
    label: type === 'hidden' ? 'Hidden input' : 'Text label',
    width: 12
  };

  switch (type) {
    case 'checkbox':
    case 'radio':
      const checkbox: FieldGroupItem[] = [
        {
          id: `field-${Date.now() + 1}`,
          label: 'Item 1',
          value: 'item-1'
        },
        {
          id: `field-${Date.now() + 2}`,
          label: 'Item 2',
          value: 'item-2'
        },
        {
          id: `field-${Date.now() + 3}`,
          label: 'Item 3',
          value: 'item-3'
        }
      ];
      return {
        ...(newField as CheckboxField),
        items: checkbox,
        transformer: ''
      };
    case 'date':
      return {
        ...newField,
        transformer: '',
        mode: 'single',
        options: {
          dateFormat: 'dd/MM/yyyy'
        }
      } as FormFieldType;
    case 'file':
      return {
        ...newField,
        options: {
          multiple: false,
          maxFiles: 5,
          maxSize: 5 * 1024 * 1024, // 5MB
          accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.tif'],
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt']
          },
          instantUpload: false,
          bulkUpload: false,
          server: ''
        }
      } as unknown as FormFieldType;
    case 'button':
    case 'submit':
    case 'reset':
      return {
        id: `field-${Date.now()}`,
        label: 'Submit',
        type: type as ButtonField['type'],
        width: 2,
        action: 'submit',
        appearance: {
          color: 'primary',
          variant: 'fill',
          size: 'default'
        }
      } as ButtonField;
    case 'block':
      return {
        id: `field-${Date.now()}`,
        type: 'block',
        width: 12,
        height: 3,
        content:
          '<div style="padding: 20px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px;"><h3>Custom HTML Block</h3><p>Edit this content in the properties panel to add your custom HTML.</p></div>'
      } as BlockField;
    case 'spacer':
      return {
        id: `field-${Date.now()}`,
        type: 'spacer',
        width: 12,
        height: 2,
        content: ''
      } as BlockField;
    case 'autocomplete':
      const autocompleteOptions: FieldGroupItem[] = [
        {
          id: `option-${Date.now() + 1}`,
          label: 'Option 1',
          value: 'option-1'
        },
        {
          id: `option-${Date.now() + 2}`,
          label: 'Option 2',
          value: 'option-2'
        },
        {
          id: `option-${Date.now() + 3}`,
          label: 'Option 3',
          value: 'option-3'
        }
      ];
      return {
        ...newField,
        transformer: '',
        placeholder: 'Search options...',
        shouldFilter: true,
        options: autocompleteOptions
      } as FormFieldType;
    default:
      return { ...newField, transformer: '' } as FormFieldType;
  }
};

export const Editor = ({ onSaveSchema }: { onSaveSchema: FormEditorProps['onSaveSchema'] }) => {
  const { actions, schema } = useFormBuilder();
  const { editor, canvas, toolbox } = useEditor();
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Use ref to track last insertion index to prevent unnecessary updates
  const lastInsertionIndexRef = useRef<number | null>(null);
  
  // Throttled insertion index setter to reduce re-renders
  const setInsertionIndexThrottled = useCallback((index: number | null) => {
    if (lastInsertionIndexRef.current !== index) {
      lastInsertionIndexRef.current = index;
      editor.setInsertionIndex(index);
    }
  }, [editor]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Auto-scroll when dragging near edges of the scroll container
  const autoScrollIfNeeded = useCallback((clientY: number) => {
    const container = document.getElementById('canvas-scroll');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const threshold = 60;
    const scrollSpeed = 18;

    if (clientY < rect.top + threshold) {
      container.scrollTop -= scrollSpeed;
    } else if (clientY > rect.bottom - threshold) {
      container.scrollTop += scrollSpeed;
    }
  }, []);

  useEffect(() => {
    actions.changeMode('editor');
    if (process.env.NODE_ENV !== 'development') return;

    // Enable all debug features (kept disabled by default to avoid perf hit)
    // const cleanupDebugger = setupWorkflowDebugger();

    return () => {
      // Cleanup debugger on unmount
      // cleanupDebugger?.();
    };
  }, []);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
    if (schema.fields.length === 0) {
      editor.setInsertionIndex(0);
    }
  };

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { active, over } = event;

    if (!active) return;

    // Smooth auto-scroll near edges
    const pointerY = active.rect.current.translated?.top ?? active.rect.current.initial?.top ?? 0;
    autoScrollIfNeeded(pointerY);
    
    // If dragging over empty canvas (no items or below the last row), set insertion index to end
    if (!over) {
      setInsertionIndexThrottled(schema.fields.length);
      return;
    }

    // If hovering the synthetic end indicator, force insertion at end
    if (over?.data?.current?.indicator) {
      setInsertionIndexThrottled(schema.fields.length);
      return;
    }

    // Determine insertion position in a grid (horizontal + vertical) while hovering a field
    if (over.data.current?.fromCanvas) {
      const overIndex = schema.fields.findIndex((f) => f.id === over.id);
      const overElement = document.querySelector(`[data-id="${over.id}"]`) as HTMLElement | null;
      if (!overElement) return;

      const rect = overElement.getBoundingClientRect();
      const translated = active.rect.current.translated;
      const initial = active.rect.current.initial;

      let newIndex: number;

      // Fallback to vertical if translated not available
      if (!translated) {
        const midpointY = rect.top + rect.height / 2;
        const pointerTop = initial?.top ?? 0;
        const shouldInsertAfter = pointerTop > midpointY;
        newIndex = shouldInsertAfter ? overIndex + 1 : overIndex;
      } else {
        const pointerX = translated.left + (active.rect.current.initial?.width ?? 0) / 2;
        const pointerY = translated.top + (active.rect.current.initial?.height ?? 0) / 2;
        const midpointX = rect.left + rect.width / 2;
        const midpointY = rect.top + rect.height / 2;

        // If pointer is within the same row vertically, use horizontal decision; otherwise vertical
        // Increase vertical tolerance slightly to avoid jitter when hovering along row boundaries
        const verticalTolerance = Math.min(12, rect.height * 0.15);
        const isSameRow = pointerY > rect.top - verticalTolerance && pointerY < rect.bottom + verticalTolerance;
        const shouldInsertAfter = isSameRow ? pointerX > midpointX : pointerY > midpointY;
        newIndex = shouldInsertAfter ? overIndex + 1 : overIndex;
      }

      setInsertionIndexThrottled(newIndex);
    }
  }, [schema.fields, setInsertionIndexThrottled, autoScrollIfNeeded]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    const insertionIndex = canvas.currentInsertionIndex;
    
    // Reset refs and state
    lastInsertionIndexRef.current = null;
    editor.setInsertionIndex(null);

    // If dropping from toolbox and we have a computed insertion index but not hovering over a specific item,
    // allow inserting at the computed index (e.g., at the end of the list)
    if (!over) {
      // Drop outside any item; use computed insertion index if available
      if (insertionIndex !== null) {
        if (active.data.current?.fromToolbox) {
          const newField = defineDefaultValue(active.data.current.type as string);
          actions.insertField(insertionIndex, newField as FormFieldType);
          actions.selectField(newField.id as string);
        } else if (active.data.current?.fromCanvas) {
          const oldIndex = schema.fields.findIndex((f) => f.id === active.id);
          const target = Math.min(schema.fields.length - 1, insertionIndex);
          const newFields = arrayMove(actions.getFields(), oldIndex, target);
          actions.updateFields(newFields);
          actions.selectField(active.id as string);
        }
      }
      return;
    }
    if (active.data.current?.fromToolbox && over.data.current?.fromToolbox) return;

    // Handle toolbox -> canvas drop
    if (active.data.current?.fromToolbox) {
      // If hovering the end indicator, insert at computed index or at end
      if (over.data.current?.indicator) {
        const newField = defineDefaultValue(active.data.current.type as string);
        const targetIndex = insertionIndex !== null ? insertionIndex : schema.fields.length;
        actions.insertField(targetIndex, newField as FormFieldType);
        actions.selectField(newField.id as string);
        return;
      }
      // Handle preset drop - expand all fields from preset
      if (active.data.current.type === 'preset') {
        const preset = toolbox.presets.find((p) => p.id === active.id) as PresetTypeDef;
        if (preset && preset.fields) {
          const fieldsToAdd = preset.fields;

          // Insert all preset fields
          if (over.data.current?.fromCanvas) {
            const targetIndex =
              insertionIndex !== null ? insertionIndex : schema.fields.findIndex((f) => f.id === over.id);
            fieldsToAdd.forEach((field, index) => {
              actions.insertField(targetIndex + index, field);
            });
          } else {
            // Add all fields to end if over empty canvas
            fieldsToAdd.forEach((field) => {
              actions.addField(field);
            });
          }

          // Select the first field from the preset
          if (fieldsToAdd.length > 0) {
            actions.selectField(fieldsToAdd[0].id);
          }
        }
      } else {
        // Handle regular field drop
        const newField = defineDefaultValue(active.data.current.type as string);

        // Insert at position if over existing field
        if (over.data.current?.fromCanvas || insertionIndex !== null) {
          // Use the insertion index calculated during drag move
          const targetIndex =
            insertionIndex !== null ? insertionIndex : schema.fields.findIndex((f) => f.id === over.id);
          actions.insertField(targetIndex, newField as FormFieldType);
        } else {
          // Add to end if over empty canvas
          actions.addField(newField as FormFieldType);
        }

        actions.selectField(newField.id as string);
      }
    }
    // Handle reordering existing fields
    else if (active.data.current?.fromCanvas) {
      // Dropping over end indicator -> move to end or computed index
      if (over.data.current?.indicator) {
        const oldIndex = schema.fields.findIndex((f) => f.id === active.id);
        const targetIndex = Math.min(schema.fields.length - 1, insertionIndex ?? schema.fields.length - 1);
        const newFields = arrayMove(actions.getFields(), oldIndex, targetIndex);
        actions.updateFields(newFields);
        actions.selectField(active.id as string);
        return;
      }

      if (over.data.current?.fromCanvas) {
      const oldIndex = schema.fields.findIndex((f) => f.id === active.id);
      const newIndex = schema.fields.findIndex((f) => f.id === over.id);
      const newFields = arrayMove(actions.getFields(), oldIndex, newIndex);
      actions.updateFields(newFields);
      actions.selectField(active.id as string);
      }
    }
  };

  return (
    <>
      <Toolbar onSaveSchema={onSaveSchema} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}>
        <div
          className={cn(
            'editor-container flex h-[calc(100vh_-_3rem)] overflow-hidden',
            editor.options?.containerClassname
          )}>
          <ToolboxPanel />
          <FormCanvas />
          <EditorPanel />
        </div>
        {activeId && (
          <DragPreview>
            <FieldOverlay id={activeId} />
          </DragPreview>
        )}
        {activeId && (
          <DragPreview>
            <ToolboxItemOverlay id={activeId} />
          </DragPreview>
        )}
      </DndContext>
      <Toaster position="top-center" richColors />
    </>
  );
};
