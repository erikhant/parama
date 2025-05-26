import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type DraggableItemProps = {
  id: string | number;
  children: React.ReactNode;
  className?: string;
  useHandle?: boolean;
  data?: {
    [x: string]: any;
  };
};

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  children,
  className = '',
  useHandle,
  data
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    cursor: 'grab',
    opacity: isDragging ? 0.3 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative ${className}`}>
      {children}
    </div>
  );
};
