# Block and Spacer Field Implementation

This implementation adds two new field types to the form builder: **Block** and **Spacer** fields.

## Features

### Spacer Field

- **Purpose**: Provides adjustable spacing for form layout
- **Properties**:
  - Width: 1-12 columns (configurable via slider/input)
  - Height: 1-12 units (configurable via slider/input)
- **Appearance**: In editor mode, shows as a dashed border with height indicator
- **Use Case**: Creating visual spacing between form sections

### Block Field

- **Purpose**: Provides custom HTML content blocks
- **Properties**:
  - Width: 1-12 columns (configurable via slider/input)
  - Height: 1-12 units (configurable via slider/input)
  - Content: Custom HTML content (editable via textarea)
- **Features**:
  - Supports any HTML tags and inline styles
  - Content is rendered as-is in both editor and preview modes
  - Includes a content editor with syntax highlighting hints

## Implementation Details

### Type Definitions

Both field types extend the `BlockField` interface:

```typescript
export interface BlockField extends Pick<BaseField, 'id' | 'width' | 'conditions'> {
  type: 'block' | 'spacer';
  height?: number;
  content: any; // Can be a React component or HTML content
}
```

### Components Added

1. **GeneralBlockEditor** (`packages/editor/src/properties/block/GeneralBlockEditor.tsx`)
   - Handles width and height configuration for both field types
   - Uses sliders and numeric inputs for precise control

2. **BlockContentEditor** (`packages/editor/src/properties/block/BlockContentEditor.tsx`)
   - Provides HTML content editing for block fields only
   - Not shown for spacer fields (as they don't need content)

### Editor Integration

- Block and spacer fields are available in the toolbox under the "Fields" category
- Custom property panels with appropriate editors
- No validation, appearance, conditions, or events panels (not applicable for layout elements)

### Renderer Support

The renderer automatically handles both field types:

- **Spacer fields**: Render as empty space with visual indicators in editor mode
- **Block fields**: Render HTML content with configurable minimum height

### Default Content

**Block Field Default**: Comes with a styled placeholder HTML block demonstrating usage:

```html
<div style="padding: 20px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px;">
  <h3>Custom HTML Block</h3>
  <p>Edit this content in the properties panel to add your custom HTML.</p>
</div>
```

**Spacer Field Default**: Empty content, 2 units height by default.

## Usage Examples

### Adding a Spacer

1. Drag "Spacer" from the toolbox to the form
2. Adjust width (columns) and height (spacing units) in the General panel
3. The spacer will create visual space in your form layout

### Adding an HTML Block

1. Drag "HTML Block" from the toolbox to the form
2. Configure width and height in the General panel
3. Edit the HTML content in the Content panel
4. Add any HTML, CSS styles, or even embed elements

### Height Units

- Each height unit equals 24px
- Height range: 1-12 units (24px - 288px)
- Width follows the standard grid system (1-12 columns)

## Best Practices

### For Spacers:

- Use between form sections to improve visual hierarchy
- Adjust height based on content density
- Full width (12 columns) is typical for horizontal spacing

### For HTML Blocks:

- Keep HTML semantic and accessible
- Use inline styles for custom styling
- Test content in both editor and preview modes
- Be mindful of responsive behavior with fixed heights

## Technical Notes

- Both field types are excluded from validation, appearance, conditions, and events panels
- Height utilities are added to the CSS for consistent spacing
- Fields work seamlessly with the existing drag-and-drop editor
- Content is sanitized through React's `dangerouslySetInnerHTML` for block fields
