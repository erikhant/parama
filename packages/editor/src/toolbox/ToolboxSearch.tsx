import React, { useState } from 'react';
import { Input } from '@parama-ui/react';
import { Search, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { FieldTypeDef, PresetTypeDef } from '@form-builder/types';

interface ToolboxSearchProps {
  items: FieldTypeDef[] | PresetTypeDef[];
  onFilteredItems: (items: FieldTypeDef[] | PresetTypeDef[]) => void;
  placeholder?: string;
}

export const ToolboxSearch: React.FC<ToolboxSearchProps> = ({ items, onFilteredItems, placeholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced search function that searches through multiple fields
  const performSearch = (term: string) => {
    if (term.trim() === '') {
      onFilteredItems(items);
      return;
    }

    const searchLower = term.toLowerCase();
    const filteredItems = items.filter((item) => {
      // Search in label
      if (item.label.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in description
      if (item.description && item.description.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in type
      if (item.type.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search in group if available
      if (item.group && item.group.toLowerCase().includes(searchLower)) {
        return true;
      }

      // For presets, also search in contained fields
      if ('fields' in item && item.fields) {
        const presetItem = item as PresetTypeDef;
        return presetItem.fields.some((field) => {
          return (
            field.type.toLowerCase().includes(searchLower) ||
            (field.label && field.label.toLowerCase().includes(searchLower)) ||
            (field.placeholder && field.placeholder.toLowerCase().includes(searchLower))
          );
        });
      }

      return false;
    });

    onFilteredItems(filteredItems);
  };

  // Debounced search function to avoid excessive filtering
  const debouncedSearch = useDebouncedCallback((term: string) => {
    performSearch(term);
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      // If search is empty, show all items immediately
      onFilteredItems(items);
    } else {
      // Use debounced search for non-empty queries
      debouncedSearch(value);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    onFilteredItems(items);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClearSearch();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="relative p-4 pb-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-9 h-9 text-sm bg-white border border-gray-200 rounded-md focus:border-blue-300 focus:ring-1 focus:ring-blue-300 transition-colors"
          autoComplete="off"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-sm hover:bg-gray-100"
            aria-label="Clear search"
            type="button">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      {searchTerm && (
        <div className="text-xs text-gray-500 mt-1 px-1">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to clear search
        </div>
      )}
    </div>
  );
};
