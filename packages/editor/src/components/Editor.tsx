import {
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
import { useEffect, useState } from 'react';
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
        items: checkbox
      };
    case 'date':
      return {
        ...newField,
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
    default:
      return newField as FormFieldType;
  }
};

export const Editor = ({ onSaveSchema }: { onSaveSchema: FormEditorProps['onSaveSchema'] }) => {
  const { actions, schema } = useFormBuilder();
  const { editor, canvas, toolbox } = useEditor();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Enable all debug features
    const cleanupDebugger = setupWorkflowDebugger();

    return () => {
      // Cleanup debugger on unmount
      cleanupDebugger?.();
    };
  }, []);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
    if (schema.fields.length === 0) {
      editor.setInsertionIndex(0);
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;

    if (!over || !active) return;

    if (active.data.current?.fromToolbox && over.data.current?.fromCanvas) {
      const overIndex = schema.fields.findIndex((f) => f.id === over.id);
      const overElement = document.querySelector(`[data-id="${over.id}"]`);
      if (overElement) {
        const rect = overElement.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const shouldInsertAfter = event.delta.y > 0 || event.active.rect.current.translated?.top! > midpoint;
        editor.setInsertionIndex(shouldInsertAfter ? overIndex + 1 : overIndex);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    const insertionIndex = canvas.currentInsertionIndex;
    editor.setInsertionIndex(null);

    if (!over) return;
    if (active.data.current?.fromToolbox && over.data.current?.fromToolbox) return;

    // Handle toolbox -> canvas drop
    if (active.data.current?.fromToolbox) {
      // Handle preset drop - expand all fields from preset
      if (active.data.current.type === 'preset') {
        const preset = toolbox.presets.find((p) => p.id === active.id) as PresetTypeDef;
        if (preset && preset.fields) {
          const fieldsToAdd = preset.fields.map((field: FormFieldType) => ({
            ...field,
            id: `field-${Date.now()}-${Math.random()}`
          })) as FormFieldType[];

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
        if (over.data.current?.fromCanvas) {
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
    else if (active.data.current?.fromCanvas && over.data.current?.fromCanvas) {
      const oldIndex = schema.fields.findIndex((f) => f.id === active.id);
      const newIndex = schema.fields.findIndex((f) => f.id === over.id);
      const newFields = arrayMove(actions.getFields(), oldIndex, newIndex);
      actions.updateFields(newFields);
      actions.selectField(active.id as string);
    }
  };

  return (
    <>
      <Toolbar onSaveSchema={onSaveSchema} />
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
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
