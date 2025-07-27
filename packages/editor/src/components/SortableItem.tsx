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
          <DroppableIndicator className="tw-h-full tw-w-full" />
        </div>
      )}
      <div
        ref={setNodeRef}
        style={style}
        {...attrs}
        className={`tw-relative tw-group ${!useHandle ? ' tw-cursor-grab ' : ' '}${className}`}>
        <div
          className={cn(
            'tw-absolute tw-top-1 tw-right-1 tw-z-10 tw-flex tw-items-center tw-justify-end tw-w-auto tw-gap-1 tw-transition-opacity tw-duration-200 tw-bg-gray-50/50',
            !useHandle
              ? 'tw-w-0 tw-opacity-0'
              : 'tw-border-none tw-ring-1 tw-ring-gray-200 tw-opacity-0 group-hover:tw-opacity-100 tw-shrink-0',
            handleClassName
          )}>
          {useHandle && (
            <button {...listeners} {...attributes} className="tw-p-1 tw-text-gray-500 tw-cursor-grab">
              <MoveIcon size={16} />
            </button>
          )}
          {removable && (
            <button
              className="tw-p-1 tw-text-gray-500 tw-cursor-pointer"
              onClick={onRemove ? () => onRemove(id) : undefined}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
        {children}
      </div>
    </React.Fragment>
  );
};
