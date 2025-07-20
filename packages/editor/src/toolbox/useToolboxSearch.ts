import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface UseToolboxSearchOptions {
  debounceMs?: number;
  searchFields?: string[];
  caseSensitive?: boolean;
}

interface UseToolboxSearchResult<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredItems: T[];
  clearSearch: () => void;
  isSearching: boolean;
}

/**
 * Custom hook for managing toolbox search functionality
 * Provides debounced search with configurable options
 */
export function useToolboxSearch<T extends Record<string, any>>(
  items: T[],
  options: UseToolboxSearchOptions = {}
): UseToolboxSearchResult<T> {
  const { debounceMs = 300, searchFields = ['label', 'description', 'type'], caseSensitive = false } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<T[]>(items);
  const [isSearching, setIsSearching] = useState(false);

  // Update filtered items when items prop changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      performSearch(searchTerm);
    }
  }, [items]);

  // Perform search operation
  const performSearch = (term: string) => {
    if (term.trim() === '') {
      setFilteredItems(items);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const searchValue = caseSensitive ? term : term.toLowerCase();

    const filtered = items.filter((item) => {
      return searchFields.some((field) => {
        const fieldValue = item[field];
        if (!fieldValue) return false;

        const stringValue = String(fieldValue);
        const searchString = caseSensitive ? stringValue : stringValue.toLowerCase();

        return searchString.includes(searchValue);
      });
    });

    setFilteredItems(filtered);
    setIsSearching(false);
  };

  // Debounced search function
  const debouncedSearch = useDebouncedCallback((term: string) => {
    performSearch(term);
  }, debounceMs);

  // Handle search term change
  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredItems(items);
      setIsSearching(false);
    } else {
      debouncedSearch(term);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredItems(items);
    setIsSearching(false);
  };

  return {
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    filteredItems,
    clearSearch,
    isSearching
  };
}
