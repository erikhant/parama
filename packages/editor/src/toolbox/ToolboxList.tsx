import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { SortableItem } from '../components';
import { ToolboxItem } from './ToolboxItem';
import { ToolboxSearch } from './ToolboxSearch';
import { FieldTypeDef, PresetTypeDef } from '@form-builder/types';
import { ToolboxSearchWithHook } from './ToolboxSearchWithHook';

type ToolboxListProps = {
  items: FieldTypeDef[] | PresetTypeDef[];
  section?: FieldTypeDef['group'];
  showSearch?: boolean;
  searchPlaceholder?: string;
};

export const ToolboxList: React.FC<ToolboxListProps> = ({
  items,
  section,
  showSearch = true,
  searchPlaceholder = 'Search items...'
}) => {
  const id = `toolbox-${Date.now()}`;
  const [filteredItems, setFilteredItems] = useState<FieldTypeDef[] | PresetTypeDef[]>([]);

  // Update filtered items when items prop changes
  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const handleFilteredItems = (filtered: FieldTypeDef[] | PresetTypeDef[]) => {
    setFilteredItems(filtered);
  };

  return (
    <div className="overflow-x-hidden">
      {section && <label className="block font-semibold font-sm p-4 pb-0">{section}</label>}

      {showSearch && (
        <ToolboxSearchWithHook
          items={items}
          onFilteredItems={handleFilteredItems}
          placeholder={searchPlaceholder}
          debounceMs={350}
        />
      )}

      <div className="space-y-2 p-4 pt-2">
        {filteredItems.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            {items.length === 0 ? (
              <div>
                {!section && <div className="text-gray-400 mb-2">No items available</div>}
                <div className="text-xs text-gray-400">
                  {section === 'presets' ? 'No presets have been loaded' : 'No fields are defined'}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-gray-400 mb-2">No items match your search</div>
                <div className="text-xs text-gray-400">Try adjusting your search terms</div>
              </div>
            )}
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              index={index}
              data={{ fromToolbox: true, type: item.type, id }}
              useDynamicIndicator={false}>
              <ToolboxItem
                id={id}
                name={item.label}
                description={item.description}
                className="flex-row items-center justify-start gap-3 h-auto p-2.5 bg-white rounded-lg border-gray-100 shadow-none hover:border-blue-300 hover:shadow-none leading-none transition-colors"
                thumbnail={
                  typeof item.icon === 'string' ? (
                    item.icon
                  ) : (
                    <div className="bg-slate-100 rounded-md p-3">
                      {React.createElement(item.icon as LucideIcon, {
                        className: 'text-gray-600',
                        size: 24
                      })}
                    </div>
                  )
                }
              />
            </SortableItem>
          ))
        )}
      </div>
    </div>
  );
};
