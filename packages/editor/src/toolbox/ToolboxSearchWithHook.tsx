import React from 'react';
import { Input } from '@parama-ui/react';
import { Search, X, Loader2 } from 'lucide-react';
import { useToolboxSearch } from '../hooks/useToolboxSearch';
import { FieldTypeDef, PresetTypeDef } from '@form-builder/types';

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
    <div className="relative px-4 py-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-9 h-9 text-sm transition-colors"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isSearching && <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />}
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-sm hover:bg-gray-100"
              aria-label="Clear search"
              type="button">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {searchTerm && (
        <div className="text-xs text-gray-500 mt-1 px-1 flex items-center justify-between">
          <span>
            {filteredItems.length} of {items.length} items found
          </span>
          <span>
            Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to clear
          </span>
        </div>
      )}
    </div>
  );
};
