import { useDroppable } from '@dnd-kit/core';

type DroppableContainerProps = {
  id: string;
  accepts?: ('toolbox' | 'sortable')[];
  children: React.ReactNode;
  className?: string;
  data?: {
    [x: string]: any;
  };
};

export const DroppableContainer = ({ id, children, className = '', data }: DroppableContainerProps) => {
  const { setNodeRef } = useDroppable({
    id,
    data
  });

  return (
    <div ref={setNodeRef} data-id="droppable-area" className={`tw-relative ${className}`}>
      {children}
    </div>
  );
};
