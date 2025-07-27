import { DragOverlay } from '@dnd-kit/core';

type DragPreviewProps = {
  children: React.ReactNode;
};

export const DragPreview: React.FC<DragPreviewProps> = ({ children }) => {
  return (
    <DragOverlay className="tw-border-2 tw-border-blue-500 tw-bg-white tw-rounded-lg tw-shadow-xl tw-overflow-hidden">
      {children}
    </DragOverlay>
  );
};
