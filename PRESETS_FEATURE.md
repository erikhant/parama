# Presets Feature Implementation

## Overview

The presets feature allows users to create predefined form templates containing multiple fields with their configurations. When a preset is dragged into the editor canvas, it expands all its contained fields at once.

## Implementation Details

### 1. Type System Updates

The preset feature leverages the existing `PresetTypeDef` interface in `packages/types/src/schema.ts`:

```typescript
export interface PresetTypeDef extends FieldTypeDef {
  fields: FormField[];
}
```

### 2. Core Components Modified

#### Editor Component (`packages/editor/src/components/Editor.tsx`)

- Added preset handling logic in `handleDragEnd` function
- When a preset is dropped, it expands all contained fields with new unique IDs
- Supports insertion at specific positions and appending to end
- Automatically selects the first field from the expanded preset

#### ToolboxItemOverlay (`packages/editor/src/toolbox/ToolboxItemOverlay.tsx`)

- Updated to search both `toolbox.fields` and `toolbox.presets`
- Provides proper drag preview for preset items

#### Editor Store (`packages/editor/src/store/useEditor.ts`)

- Already includes `presets` array in toolbox state
- Initialized from `loadPreset` function during editor setup

### 3. Drag & Drop Behavior

**Preset Drop Handling:**

1. When a preset is dragged from the toolbox and dropped on the canvas
2. The system identifies it as a preset type (`active.data.current.type === 'preset'`)
3. Finds the preset definition from `toolbox.presets`
4. Creates new instances of all fields with unique IDs
5. Inserts all fields at the target position
6. Selects the first field for immediate editing

**Position Handling:**

- **Over existing field:** Inserts preset fields at calculated insertion index
- **Over empty canvas:** Appends all preset fields to the end
- **Multiple fields:** All fields are inserted consecutively with proper indexing

### 4. Usage Example

```typescript
<FormEditor
  loadPreset={() => [
    {
      id: uuid(),
      label: 'Contact Form',
      type: 'preset',
      group: 'presets',
      description: 'Basic contact form with name, email, and message',
      icon: Package,
      fields: [
        {
          id: uuid(),
          name: 'full_name',
          type: 'text',
          label: 'Full Name',
          width: 12,
          value: ''
        },
        {
          id: uuid(),
          name: 'email',
          type: 'email',
          label: 'Email Address',
          width: 12,
          value: ''
        },
        {
          id: uuid(),
          name: 'message',
          type: 'textarea',
          label: 'Message',
          width: 12,
          rows: 4,
          value: ''
        }
      ]
    }
  ]}
  schema={existingSchema}
/>
```

### 5. Features

✅ **Drag & Drop Support:** Presets can be dragged from toolbox to canvas
✅ **Field Expansion:** All preset fields are expanded with unique IDs  
✅ **Position Insertion:** Supports inserting at specific positions
✅ **Visual Feedback:** Proper drag overlay and insertion indicators
✅ **Field Selection:** Automatically selects first field after insertion
✅ **Icon Support:** Presets can have custom icons (LucideIcon components)
✅ **Toolbox Integration:** Appears in dedicated "Presets" tab
✅ **Type Safety:** Full TypeScript support with proper typing

### 6. Benefits

1. **Rapid Prototyping:** Quickly build common form structures
2. **Consistency:** Ensure consistent field configurations across forms
3. **User Experience:** Intuitive drag-and-drop interface
4. **Extensibility:** Easy to add new preset templates
5. **Maintainability:** Clean separation of concerns and modular design

### 7. Future Enhancements

**Potential improvements for future versions:**

- Preset categories and grouping
- Dynamic preset loading from API
- Preset preview thumbnails
- Nested preset support
- Preset saving from existing forms
- Import/export preset functionality

## Technical Notes

- All preset fields receive new unique IDs to prevent conflicts
- The implementation preserves existing drag-and-drop behavior for regular fields
- No breaking changes to existing APIs
- Compatible with all existing field types and configurations
- Maintains full undo/redo support through the existing action system

The preset feature integrates seamlessly with the existing form builder architecture while providing significant productivity improvements for form creation workflows.
