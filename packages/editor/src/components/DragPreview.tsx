import { DragOverlay } from '@dnd-kit/core';

type DragPreviewProps = {
  children: React.ReactNode;
};

export const DragPreview: React.FC<DragPreviewProps> = ({ children }) => {
  return (
    <DragOverlay className="border-2 border-blue-500 bg-white rounded-lg shadow-xl overflow-hidden">
      {children}
    </DragOverlay>
  );
};
