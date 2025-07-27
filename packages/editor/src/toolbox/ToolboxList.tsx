import React, { useState, useEffect } from 'react';
import { SortableItem } from '../components';
import { ToolboxItem } from './ToolboxItem';
import { FieldTypeDef, PresetTypeDef } from '@parama-dev/form-builder-types';
import { ToolboxSearchWithHook } from './ToolboxSearchWithHook';
import { ToolboxItemThumbnail } from './ToolboxItemThumbnail';

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
  const [filteredItems, setFilteredItems] = useState<FieldTypeDef[] | PresetTypeDef[]>([]);

  // Update filtered items when items prop changes
  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  const handleFilteredItems = (filtered: FieldTypeDef[] | PresetTypeDef[]) => {
    setFilteredItems(filtered);
  };

  return (
    <div className="tw-overflow-x-hidden">
      {section && <label className="tw-block tw-font-semibold tw-font-sm tw-p-4 tw-pb-0">{section}</label>}

      {showSearch && (
        <ToolboxSearchWithHook
          items={items}
          onFilteredItems={handleFilteredItems}
          placeholder={searchPlaceholder}
          debounceMs={350}
        />
      )}

      <div className="tw-space-y-2 tw-p-4 tw-pt-2">
        {filteredItems.length === 0 ? (
          <div className="tw-text-center tw-text-gray-500 tw-text-sm tw-py-8">
            {items.length === 0 ? (
              <div>
                {!section && <div className="tw-text-gray-400 tw-mb-2">No items available</div>}
                <div className="tw-text-xs tw-text-gray-400">
                  {section === 'presets' ? 'No presets have been loaded' : !section ? 'No fields are defined' : null}
                </div>
              </div>
            ) : (
              <div>
                <div className="tw-text-gray-400 tw-mb-2">No items match your search</div>
                <div className="tw-text-xs tw-text-gray-400">Try adjusting your search terms</div>
              </div>
            )}
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              index={index}
              data={{ fromToolbox: true, type: item.type, id: item.id }}
              useDynamicIndicator={false}>
              <ToolboxItem
                id={item.id}
                name={item.label}
                description={item.description}
                className="tw-flex-row tw-items-center tw-justify-start tw-gap-3 tw-h-auto tw-p-2.5 tw-bg-white tw-rounded-lg tw-border-gray-100 tw-shadow-none hover:tw-border-blue-300 hover:tw-shadow-none tw-leading-none tw-transition-colors"
                thumbnail={<ToolboxItemThumbnail item={item} size={24} className="tw-shrink-0" />}
              />
            </SortableItem>
          ))
        )}
      </div>
    </div>
  );
};
