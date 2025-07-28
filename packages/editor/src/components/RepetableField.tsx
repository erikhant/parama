import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import React, { cloneElement, ReactElement, useCallback, useState } from 'react';
import { SortableItem } from './SortableItem';
import { SortableList } from './SortableList';
import { Button, cn } from '@parama-ui/react';
import { PlusIcon } from 'lucide-react';

interface RepetableFieldProps<TValue> {
  children:
    | ReactElement
    | ((props: {
        value: TValue;
        onChange: (value: TValue) => void;
        name: string;
        key: string | number;
      }) => ReactElement);
  name: string;
  values?: TValue[];
  onChange?: (value: TValue[]) => void;
  minItems?: number;
  maxItems?: number;
  defaultValue?: TValue;
  renderAddButton?: (onAdd: () => void, canAdd: boolean) => ReactElement;
  className?: string;
}

export function RepetableField<TValue>({
  children,
  name,
  values = [],
  onChange,
  minItems = 0,
  maxItems = Infinity,
  defaultValue,
  renderAddButton,
  className = ''
}: RepetableFieldProps<TValue>) {
  const [items, setItems] = useState(
    values.map((value, index) => ({ id: `${name}-${Date.now()}-${index}`, value }))
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleChange = useCallback(
    (newItems: { id: string; value: TValue }[]) => {
      setItems(newItems);
      onChange?.(newItems.map((item) => item.value));
      console.log(
        `Updated ${name}:`,
        newItems.map((item) => item.value)
      );
    },
    [onChange, name]
  );

  const addItem = useCallback(() => {
    if (items.length < maxItems) {
      const newValue =
        typeof defaultValue === 'object' && defaultValue !== null
          ? { ...(defaultValue as object) }
          : defaultValue;
      const newItems = [
        ...items,
        { id: `${name}-${Date.now()}-${items.length}`, value: newValue as TValue }
      ];
      handleChange(newItems);
    }
  }, [items, maxItems, defaultValue, handleChange, name]);

  const removeItem = useCallback(
    (index: number) => {
      if (items.length > minItems) {
        const newItems = items.filter((_, i) => i !== index);
        handleChange(newItems);
      }
    },
    [items, minItems, handleChange]
  );

  const handleItemChange = useCallback(
    (index: number, newValue: TValue) => {
      console.log(`Item at index ${index} changed to:`, newValue);
      const newItems = [...items];
      newItems[index] = { ...newItems[index], value: newValue };
      handleChange(newItems);
    },
    [items, handleChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      console.log(`Drag ended: ${active.id} over ${over?.id}`);
      if (active.id !== over?.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = arrayMove(items, oldIndex, newIndex);
          handleChange(newItems);
        }
      }
    },
    [items, handleChange]
  );
  const canAdd = items.length < maxItems;
  const canRemove = items.length > minItems;

  const defaultAddButton = (onAdd: () => void, canAddItem: boolean) => (
    <Button
      size="xs"
      variant="ghost"
      color="secondary"
      type="button"
      onClick={onAdd}
      disabled={!canAddItem}>
      <PlusIcon size={16} /> Add option
    </Button>
  );

  const itemIds = items.map((item) => item.id);

  return (
    <>
      <DndContext
        id={name}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}>
        <SortableList
          items={itemIds}
          className={cn('space-y-5', className)}
          useDynamicIndicator={false}>
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              index={index}
              onRemove={() => removeItem(index)}
              removable={canRemove}
              className="gap-x-2"
              handleClassName="opacity-100 bg-transparent ring-0 border-none"
              useDynamicIndicator={false}
              useHandle={true}>
              {typeof children === 'function'
                ? children({
                    value: item.value,
                    onChange: (value) => handleItemChange(index, value),
                    name: `${name}[${index}]`,
                    key: item.id
                  })
                : cloneElementDeep(children, {
                    value: item.value,
                    onChange: (value: TValue) => handleItemChange(index, value),
                    name: `${name}[${index}]`,
                    key: item.id
                  })}
            </SortableItem>
          ))}
        </SortableList>
      </DndContext>

      <div className="flex justify-end">
        {(renderAddButton || defaultAddButton)(addItem, canAdd)}
      </div>
    </>
  );
}

const cloneElementDeep = (element: ReactElement, props: any): ReactElement => {
  if (element.props['data-field']) {
    return cloneElement(element, props);
  }

  if (element.props.children) {
    const children = React.Children.map(element.props.children, (child) => {
      if (React.isValidElement(child)) {
        return cloneElementDeep(child, props);
      }
      return child;
    });

    return cloneElement(element, {}, children);
  }

  return element;
};
