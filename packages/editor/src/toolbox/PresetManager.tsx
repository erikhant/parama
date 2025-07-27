import React, { useState, useMemo } from 'react';
import { Input, Button } from '@parama-ui/react';
import { Search, X, Plus, FolderPlus, Tag } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { PresetTypeDef } from '@parama-dev/form-builder-types';

interface PresetManagerProps {
  presets: PresetTypeDef[];
  onFilteredPresets: (presets: PresetTypeDef[]) => void;
  onCreatePreset?: () => void;
  onImportPresets?: () => void;
  showActions?: boolean;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  presets,
  onFilteredPresets,
  onCreatePreset,
  onImportPresets,
  showActions = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories from presets
  const categories = useMemo(() => {
    const cats = new Set(['all']);
    presets.forEach((preset) => {
      if (preset.group) {
        cats.add(preset.group);
      }
    });
    return Array.from(cats);
  }, [presets]);

  // Enhanced search and filter function
  const performFilter = (term: string, category: string) => {
    let filteredPresets = presets;

    // Filter by category
    if (category !== 'all') {
      filteredPresets = filteredPresets.filter((preset) => preset.group === category);
    }

    // Filter by search term
    if (term.trim() !== '') {
      const searchLower = term.toLowerCase();
      filteredPresets = filteredPresets.filter((preset) => {
        return (
          preset.label.toLowerCase().includes(searchLower) ||
          (preset.description && preset.description.toLowerCase().includes(searchLower)) ||
          preset.fields.some(
            (field) =>
              field.type.toLowerCase().includes(searchLower) ||
              (('label' in field ? field.label : field.id) &&
                ('label' in field ? field.label : field.id).toLowerCase().includes(searchLower))
          )
        );
      });
    }

    onFilteredPresets(filteredPresets);
  };

  // Debounced search function
  const debouncedFilter = useDebouncedCallback((term: string, category: string) => {
    performFilter(term, category);
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      performFilter('', selectedCategory);
    } else {
      debouncedFilter(value, selectedCategory);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    performFilter(searchTerm, category);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    performFilter('', selectedCategory);
  };

  return (
    <div className="tw-space-y-3">
      {/* Search Bar */}
      <div className="tw-relative tw-p-4 tw-pb-0">
        <div className="tw-relative">
          <Search className="tw-absolute tw-left-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-gray-400 tw-w-4 tw-h-4 tw-pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search presets..."
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
      </div>

      {/* Category Filters */}
      {categories.length > 1 && (
        <div className="tw-px-4">
          <div className="tw-flex tw-flex-wrap tw-gap-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  tw-inline-flex tw-items-center tw-px-2 tw-py-1 tw-rounded-md tw-text-xs tw-font-medium tw-transition-colors
                  ${
                    selectedCategory === category
                      ? 'tw-bg-blue-100 tw-text-blue-800 tw-border tw-border-blue-200'
                      : 'tw-bg-gray-100 tw-text-gray-700 tw-border tw-border-transparent hover:tw-bg-gray-200'
                  }
                `}>
                <Tag className="tw-w-3 tw-h-3 tw-mr-1" />
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (onCreatePreset || onImportPresets) && (
        <div className="tw-px-4">
          <div className="tw-flex tw-gap-2">
            {onCreatePreset && (
              <Button onClick={onCreatePreset} size="sm" variant="outline" className="tw-flex-1 tw-text-xs tw-h-8">
                <Plus className="tw-w-3 tw-h-3 tw-mr-1" />
                Create Preset
              </Button>
            )}
            {onImportPresets && (
              <Button onClick={onImportPresets} size="sm" variant="outline" className="tw-flex-1 tw-text-xs tw-h-8">
                <FolderPlus className="tw-w-3 tw-h-3 tw-mr-1" />
                Import
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="tw-px-4">
        <div className="text-xs text-gray-500">
          {presets.length === 0
            ? 'No presets available'
            : `${presets.length} preset${presets.length === 1 ? '' : 's'} available`}
        </div>
      </div>
    </div>
  );
};
