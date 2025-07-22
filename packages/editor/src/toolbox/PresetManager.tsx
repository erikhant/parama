import React, { useState, useMemo } from 'react';
import { Input, Button } from '@parama-ui/react';
import { Search, X, Plus, FolderPlus, Tag } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { PresetTypeDef } from '@form-builder/types';

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
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative p-4 pb-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search presets..."
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
      </div>

      {/* Category Filters */}
      {categories.length > 1 && (
        <div className="px-4">
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors
                  ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-transparent hover:bg-gray-200'
                  }
                `}>
                <Tag className="w-3 h-3 mr-1" />
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (onCreatePreset || onImportPresets) && (
        <div className="px-4">
          <div className="flex gap-2">
            {onCreatePreset && (
              <Button onClick={onCreatePreset} size="sm" variant="outline" className="flex-1 text-xs h-8">
                <Plus className="w-3 h-3 mr-1" />
                Create Preset
              </Button>
            )}
            {onImportPresets && (
              <Button onClick={onImportPresets} size="sm" variant="outline" className="flex-1 text-xs h-8">
                <FolderPlus className="w-3 h-3 mr-1" />
                Import
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="px-4">
        <div className="text-xs text-gray-500">
          {presets.length === 0
            ? 'No presets available'
            : `${presets.length} preset${presets.length === 1 ? '' : 's'} available`}
        </div>
      </div>
    </div>
  );
};
