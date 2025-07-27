import React, { useState } from 'react';
import { Input } from '@parama-ui/react';
import { Search, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { FieldTypeDef, PresetTypeDef } from '@parama-dev/form-builder-types';

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
            (('label' in field ? field.label : field.id) &&
              ('label' in field ? field.label : field.id).toLowerCase().includes(searchLower)) ||
            (('placeholder' in field ? field.placeholder : '') &&
              ('placeholder' in field && field.placeholder
                ? field.placeholder.toLowerCase().includes(searchLower)
                : false))
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
    <div className="tw-relative tw-p-4 tw-pb-2">
      <div className="tw-relative">
        <Search className="tw-absolute tw-left-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-gray-400 tw-w-4 tw-h-4 tw-pointer-events-none" />
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="tw-pl-9 tw-pr-9 tw-h-9 tw-text-sm tw-bg-white tw-border tw-border-gray-200 tw-rounded-md focus:tw-border-blue-300 focus:tw-ring-1 focus:tw-ring-blue-300 tw-transition-colors"
          autoComplete="off"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="tw-absolute tw-right-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-gray-400 hover:tw-text-gray-600 tw-transition-colors tw-p-0.5 tw-rounded-sm hover:tw-bg-gray-100"
            aria-label="Clear search"
            type="button">
            <X className="tw-w-3 tw-h-3" />
          </button>
        )}
      </div>
      {searchTerm && (
        <div className="tw-text-xs tw-text-gray-500 tw-mt-1 tw-px-1">
          Press <kbd className="tw-px-1 tw-py-0.5 tw-bg-gray-100 tw-rounded tw-text-xs">Esc</kbd> to clear search
        </div>
      )}
    </div>
  );
};
