import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useFormBuilder } from '@form-builder/core';
import { useEditor } from './store/useEditor';
import { FieldOverlay, FormCanvas } from './canvas';
import { DragPreview } from './components/DragPreview';
import { ToolboxItemOverlay, ToolboxPanel } from './toolbox';
import type {
  CheckboxField,
  FieldGroupItem,
  FormField as FormFieldType
} from '@form-builder/types';
import { PropertiesPanel } from './properties/PropertiesPanel';

const definedDefaultValue = (type: string): FormFieldType => {
  const newField = {
    id: `field-${Date.now()}`,
    name: `name_${type}`,
    type: type,
    label: `Text label`,
    width: 12
  };

  switch (type) {
    case 'checkbox':
    case 'radio':
      const checkbox: FieldGroupItem[] = [
        {
          id: `field-${Date.now() + 1}`,
          label: 'Option 1',
          value: 'option-1'
        },
        {
          id: `field-${Date.now() + 2}`,
          label: 'Option 2',
          value: 'option-2'
        },
        {
          id: `field-${Date.now() + 3}`,
          label: 'Option 3',
          value: 'option-3'
        }
      ];
      return {
        ...(newField as CheckboxField),
        items: checkbox
      };

    default:
      return newField as FormFieldType;
  }
};

export const FormEditor = () => {
  const { actions, schema } = useFormBuilder();
  const { editor } = useEditor();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor)
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: sortableKeyboardCoordinates
    // })
  );

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
        const shouldInsertAfter =
          event.delta.y > 0 ||
          event.active.rect.current.translated?.top! > midpoint;
        editor.setInsertionIndex(shouldInsertAfter ? overIndex + 1 : overIndex);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    // console.log('active', active);
    // console.log('over', over);

    setActiveId(null);
    editor.setInsertionIndex(null);

    if (!over) return;
    if (active.data.current?.fromToolbox && over.data.current?.fromToolbox)
      return;

    // Handle toolbox -> canvas drop
    if (active.data.current?.fromToolbox) {
      const newField = definedDefaultValue(active.id as string);

      // Insert at position if over existing field
      if (over.data.current?.fromCanvas) {
        const overIndex = schema.fields.findIndex((f) => f.id === over.id);
        actions.insertField(overIndex, newField as FormFieldType);
      } else {
        // Add to end if over empty canvas
        actions.addField(newField as FormFieldType);
      }

      actions.selectField(newField.id as string);
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
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}>
      <div className="editor-container flex h-screen overflow-hidden">
        <ToolboxPanel />
        <FormCanvas />
        <PropertiesPanel />
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
  );
};
