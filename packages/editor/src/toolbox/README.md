# Toolbox Search Feature

This feature implements comprehensive search functionality for the form builder toolbox, including both field and preset search capabilities with debounced input handling.

## Components

### ToolboxSearch

The main search component with built-in search logic and debouncing.

**Features:**

- Debounced search input (300ms default)
- Searches across multiple fields: label, description, type, group
- For presets, also searches within contained fields
- Keyboard shortcuts (ESC to clear)
- Clear search button
- Enhanced UX with search hints

**Usage:**

```tsx
import { ToolboxSearch } from './ToolboxSearch';

<ToolboxSearch items={toolbox.fields} onFilteredItems={setFilteredItems} placeholder="Search fields..." />;
```

### ToolboxSearchWithHook

Alternative search component using the custom `useToolboxSearch` hook for better separation of concerns.

**Features:**

- Same search capabilities as ToolboxSearch
- Uses custom hook for state management
- Loading indicator during search
- Results counter
- More flexible and reusable

**Usage:**

```tsx
import { ToolboxSearchWithHook } from './ToolboxSearchWithHook';

<ToolboxSearchWithHook
  items={toolbox.fields}
  onFilteredItems={setFilteredItems}
  placeholder="Search fields..."
  searchFields={['label', 'description', 'type']}
  debounceMs={300}
/>;
```

### PresetManager

Advanced preset management component with search, filtering, and category support.

**Features:**

- Search functionality
- Category-based filtering
- Action buttons (Create, Import)
- Statistics display
- Tag-based category selection

**Usage:**

```tsx
import { PresetManager } from './PresetManager';

<PresetManager
  presets={toolbox.presets}
  onFilteredPresets={setFilteredPresets}
  onCreatePreset={handleCreatePreset}
  onImportPresets={handleImportPresets}
  showActions={true}
/>;
```

### ToolboxList (Updated)

Enhanced list component with integrated search support.

**New Features:**

- Optional search integration
- Better empty state messaging
- Support for both fields and presets
- Customizable search placeholders
- Improved transitions and hover effects

**Usage:**

```tsx
import { ToolboxList } from './ToolboxList';

<ToolboxList items={filteredItems} showSearch={true} searchPlaceholder="Search fields..." />;
```

## Custom Hook

### useToolboxSearch

Reusable hook for implementing search functionality across different components.

**Features:**

- Configurable debounce timing
- Customizable search fields
- Case-sensitive/insensitive search
- Loading state management
- Automatic filtering

**Usage:**

```tsx
import { useToolboxSearch } from './useToolboxSearch';

const { searchTerm, setSearchTerm, filteredItems, clearSearch, isSearching } = useToolboxSearch(items, {
  debounceMs: 300,
  searchFields: ['label', 'description', 'type'],
  caseSensitive: false
});
```

## Implementation Details

### Search Algorithm

The search functionality implements a comprehensive multi-field search:

1. **Basic Fields**: Searches through `label`, `description`, `type`, and `group`
2. **Preset Fields**: For presets, also searches within contained field definitions
3. **Case-Insensitive**: All searches are case-insensitive by default
4. **Partial Matching**: Uses `includes()` for partial string matching

### Debouncing

- Default debounce time: 300ms
- Immediate response for empty search (no debounce)
- Configurable debounce timing via props/options

### Performance Optimizations

- Efficient filtering algorithms
- Debounced search to reduce excessive filtering
- Memoized category calculations in PresetManager
- Automatic cleanup of search state

## Best Practices

### When to Use Which Component

1. **ToolboxSearch**: Use for simple, straightforward search needs
2. **ToolboxSearchWithHook**: Use when you need more control or want to reuse search logic
3. **PresetManager**: Use specifically for preset management with advanced filtering needs

### Configuration Guidelines

1. **Debounce Timing**:
   - 300ms: Good default for most use cases
   - 150ms: For faster, more responsive search
   - 500ms: For expensive search operations

2. **Search Fields**:
   - Include relevant fields only to improve performance
   - Consider user expectations (what they would search for)

3. **Placeholders**:
   - Be specific and helpful
   - Examples: "Search fields...", "Find presets by name or type..."

## Dependencies

- `@parama-ui/react`: Input component and other UI components
- `use-debounce`: Debounced callback functionality
- `lucide-react`: Search icons
- `@form-builder/types`: Type definitions for FieldTypeDef and PresetTypeDef

## Future Enhancements

1. **Fuzzy Search**: Implement fuzzy search for better matching
2. **Search History**: Add search history and suggestions
3. **Advanced Filters**: Add more filtering options (date created, author, etc.)
4. **Keyboard Navigation**: Add arrow key navigation through search results
5. **Search Analytics**: Track popular search terms for UX improvements
