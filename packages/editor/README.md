# @form-builder/editor

A visual form builder editor with drag-and-drop interface for creating forms.

## Installation

```bash
npm install @form-builder/editor @form-builder/core @form-builder/types @form-builder/renderer @parama-ui/react react react-dom
```

## Usage

### Basic Usage

```tsx
import { FormEditor } from '@form-builder/editor';
// Import the required styles
import '@form-builder/editor/styles';

function App() {
  const handleSave = (schema) => {
    console.log('Form schema:', schema);
  };

  return <FormEditor initialSchema={yourSchema} onSave={handleSave} />;
}
```

### Alternative CSS Import

If you prefer to import CSS from your bundler configuration or CSS file:

```css
/* In your main CSS file */
@import '@form-builder/editor/dist/styles.css';
```

Or in your bundler (webpack, vite, etc.):

```js
// In your main.js or app.js
import '@form-builder/editor/dist/styles.css';
```

### CSS Integration

For detailed CSS integration options, see [CSS_INTEGRATION.md](./CSS_INTEGRATION.md).

## Features

- Visual drag-and-drop form builder
- Monaco Editor for advanced schema editing
- Real-time form preview
- Component toolbox with search
- Property panel for field customization
- Validation rules editor
- Conditional logic support

## Components

### FormEditor

Main editor component with full drag-and-drop functionality.

### Editor

Core editor without the wrapper UI.

### EditorProvider

Context provider for editor state management.

### Preview

Form preview component.

### Toolbar

Editor toolbar with actions.

## Requirements

- React 18+
- TailwindCSS for styling
- All peer dependencies must be installed
