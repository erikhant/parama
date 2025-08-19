import React from 'react';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { DroppableContainer, DroppableIndicator } from '../components';
import { useEditor } from '../store/useEditor';

interface SortableListProps {
  id?: string;
  className?: string;
  classNameIndicator?: string;
  items: string[];
  useDynamicIndicator?: boolean;
  disabled?: boolean;
  strategy?: 'vertical' | 'grid';
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const SortableList: React.FC<SortableListProps> = ({
  id,
  items,
  className = '',
  classNameIndicator = '',
  useDynamicIndicator: isUseDynamic = false,
  disabled = false,
  strategy = 'vertical',
  style,
  children
}) => {
  const { canvas } = useEditor();

  return (
    <div id={id} className={className} style={style}>
      <SortableContext
        id={id}
        items={items}
        strategy={strategy === 'vertical' ? verticalListSortingStrategy : rectSortingStrategy}
        disabled={disabled}>
        {children}
        {isUseDynamic && canvas.dragSource === 'toolbox' && canvas.currentInsertionIndex === items.length && (
          <DroppableContainer
            id="indicator"
            data={{ indicator: true }}
            className={classNameIndicator}>
            <DroppableIndicator className="h-full w-full" />
          </DroppableContainer>
        )}
      </SortableContext>
    </div>
  );
};
