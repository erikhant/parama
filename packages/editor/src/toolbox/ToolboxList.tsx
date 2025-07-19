import React from 'react';
import { LucideIcon } from 'lucide-react';
import { SortableItem } from '../components';
import { ToolboxItem } from './ToolboxItem';
import { FieldTypeDef } from '@form-builder/types';

type ToolboxListProps = {
  items: FieldTypeDef[];
  section?: string;
};

export const ToolboxList: React.FC<ToolboxListProps> = ({ items, section }) => {
  const id = `toolbox-${Date.now()}`;

  return (
    <div className="overflow-x-hidden">
      {section && <label className="block font-semibold font-sm p-4 pb-0">{section}</label>}
      <div className="space-y-2 p-4">
        {items.map((type, index) => (
          <SortableItem
            key={type.id}
            id={type.id}
            index={index}
            data={{ fromToolbox: true, id }}
            useDynamicIndicator={false}>
            <ToolboxItem
              id={id}
              name={type.label}
              description={type.description}
              className="flex-row items-center justify-start gap-3 h-auto p-2.5 bg-white rounded-lg border-gray-100 shadow-none hover:border-blue-300 hover:shadow-none leading-none"
              thumbnail={
                typeof type.icon === 'string' ? (
                  type.icon
                ) : (
                  <div className="bg-slate-100 rounded-md p-3">
                    {React.createElement(type.icon as LucideIcon, {
                      className: 'text-gray-600',
                      size: 24
                    })}
                  </div>
                )
              }
            />
          </SortableItem>
        ))}
      </div>
    </div>
  );
};
