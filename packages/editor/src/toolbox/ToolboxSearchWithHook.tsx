import React from 'react';
import { FormGroup, Input } from '@parama-ui/react';
import { Search, X, Loader2 } from 'lucide-react';
import { useToolboxSearch } from '../hooks/useToolboxSearch';
import { FieldTypeDef, PresetTypeDef } from '@parama-dev/form-builder-types';

interface ToolboxSearchHookProps {
  items: FieldTypeDef[] | PresetTypeDef[];
  onFilteredItems: (items: FieldTypeDef[] | PresetTypeDef[]) => void;
  placeholder?: string;
  searchFields?: string[];
  debounceMs?: number;
}

/**
 * Alternative ToolboxSearch component using the custom hook
 * This version provides a cleaner separation of concerns
 */
export const ToolboxSearchWithHook: React.FC<ToolboxSearchHookProps> = ({
  items,
  onFilteredItems,
  placeholder = 'Search...',
  searchFields = ['label', 'description', 'type', 'group'],
  debounceMs = 300
}) => {
  const { searchTerm, setSearchTerm, filteredItems, clearSearch, isSearching } = useToolboxSearch(items, {
    debounceMs,
    searchFields,
    caseSensitive: false
  });

  // Update parent component with filtered items
  React.useEffect(() => {
    onFilteredItems(filteredItems);
  }, [filteredItems, onFilteredItems]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      clearSearch();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="tw-relative tw-px-4 tw-py-2">
      <div className="tw-relative">
        <FormGroup prefix={<Search className="tw-w-4 tw-h-4 tw-pointer-events-none" />}>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="tw-pr-9 tw-h-9 tw-text-sm tw-transition-colors"
            autoComplete="off"
          />
          <div className="toolbox-search-x">
            {isSearching && <Loader2 className="tw-w-3 tw-h-3 tw-text-gray-400 tw-animate-spin" />}
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="tw-text-gray-400 hover:tw-text-gray-600 tw-transition-colors tw-p-0.5 tw-rounded-sm hover:tw-bg-gray-100"
                aria-label="Clear search"
                type="button">
                <X className="tw-w-3 tw-h-3" />
              </button>
            )}
          </div>
        </FormGroup>
      </div>
      {searchTerm && (
        <div className="tw-text-xs tw-text-gray-500 tw-mt-1 tw-px-1 tw-flex tw-items-center tw-justify-between">
          <span>
            {filteredItems.length} of {items.length} items found
          </span>
          <span>
            Press <kbd className="tw-px-1 tw-py-0.5 tw-bg-gray-100 tw-rounded tw-text-xs">Esc</kbd> to clear
          </span>
        </div>
      )}
    </div>
  );
};
