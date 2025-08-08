import React from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical, MoveIcon, Trash2 } from 'lucide-react';
import { useEditor } from '../store/useEditor';
import { DroppableIndicator } from './DroppableIndicator';
import { cn } from '@parama-ui/react';

export type SortableItemProps = {
  id: string | number;
  children: React.ReactNode;
  className?: string;
  classNameIndicator?: string;
  handleClassName?: string;
  useHandle?: boolean;
  removable?: boolean;
  index: number | null;
  useDynamicIndicator?: boolean;
  onRemove?: (id: string | number) => void;
  data?: {
    [x: string]: any;
  };
};

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  data,
  useHandle = false,
  removable = false,
  index = null,
  className = '',
  classNameIndicator = '',
  handleClassName = '',
  useDynamicIndicator = true,
  onRemove
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data
  });
  const { canvas } = useEditor();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1
  };

  const attrs = !useHandle ? { ...listeners, ...attributes } : {};
  const isUseDynamic = useDynamicIndicator && canvas.currentInsertionIndex !== null;

  return (
    <React.Fragment>
      {isUseDynamic && canvas.currentInsertionIndex === index && (
        <div className={classNameIndicator}>
          <DroppableIndicator className="h-full w-full" />
        </div>
      )}
      <div
        ref={setNodeRef}
        style={style}
        {...attrs}
        className={`relative group ${!useHandle ? ' cursor-grab ' : ' '}${className}`}>
        <div
          className={cn(
            'absolute top-1 right-1 z-10 flex items-center justify-end w-auto gap-1 transition-opacity duration-200 bg-gray-50/50',
            !useHandle
              ? 'w-0 opacity-0'
              : 'border-none ring-1 ring-gray-200 opacity-0 group-hover:opacity-100 shrink-0',
            handleClassName
          )}>
          {useHandle && (
            <button {...listeners} {...attributes} className="p-1 text-gray-500 cursor-grab">
              <MoveIcon size={16} />
            </button>
          )}
          {removable && (
            <button className="p-1 text-gray-500 cursor-pointer" onClick={onRemove ? () => onRemove(id) : undefined}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
        {children}
      </div>
    </React.Fragment>
  );
};
