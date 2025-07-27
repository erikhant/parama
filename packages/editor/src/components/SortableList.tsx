import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DroppableContainer, DroppableIndicator } from '../components';
import { useEditor } from '../store/useEditor';

interface SortableListProps {
  id?: string;
  className?: string;
  classNameIndicator?: string;
  items: string[];
  useDynamicIndicator?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const SortableList: React.FC<SortableListProps> = ({
  id,
  items,
  className = '',
  classNameIndicator = '',
  useDynamicIndicator: isUseDynamic = false,
  disabled = false,
  children
}) => {
  const { canvas } = useEditor();

  return (
    <div id={id} className={className}>
      <SortableContext id={id} items={items} strategy={verticalListSortingStrategy} disabled={disabled}>
        {children}
        {isUseDynamic && canvas.currentInsertionIndex === items.length && (
          <DroppableContainer id="indicator" data={{ indicator: true }} className={classNameIndicator}>
            <DroppableIndicator className="tw-h-full tw-w-full" />
          </DroppableContainer>
        )}
      </SortableContext>
    </div>
  );
};
