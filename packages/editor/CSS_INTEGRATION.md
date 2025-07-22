# CSS Integration Guide for @form-builder/editor

This package provides pre-built CSS files that need to be included in your application for the editor to work properly.

## Available CSS Files

After installation, the following CSS files are available:

- `@form-builder/editor/dist/styles.css` - Complete styles for the editor
- `@form-builder/editor/styles` - Convenience export for the styles

## Integration Methods

### Method 1: Import in JavaScript/TypeScript

```tsx
import { FormEditor } from '@form-builder/editor';
// Import the styles
import '@form-builder/editor/styles';

function App() {
  return <FormEditor />;
}
```

### Method 2: Import the CSS file directly

```tsx
import { FormEditor } from '@form-builder/editor';
// Import the CSS file directly
import '@form-builder/editor/dist/styles.css';

function App() {
  return <FormEditor />;
}
```

### Method 3: In your main CSS file

```css
/* In your main.css or app.css */
@import '@form-builder/editor/styles';

/* Or */
@import '@form-builder/editor/dist/styles.css';
```

### Method 4: HTML Link Tag

```html
<!-- In your HTML file -->
<link rel="stylesheet" href="node_modules/@form-builder/editor/dist/styles.css" />
```

### Method 5: Bundler Configuration

#### Webpack

```js
// webpack.config.js
module.exports = {
  entry: {
    main: ['@form-builder/editor/dist/styles.css', './src/index.js']
  }
  // ... rest of config
};
```

#### Vite

```js
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `@import '@form-builder/editor/dist/styles.css';`
      }
    }
  }
};
```

## CSS Dependencies

The editor styles include:

- Tailwind CSS utilities for layout and styling
- Custom component styles for the drag-and-drop interface
- Monaco Editor theme integration
- Animation and transition styles

## Production Considerations

- The CSS file is optimized and minified for production
- Total CSS size: ~25KB (5.35KB gzipped)
- No external dependencies required at runtime
- Works with all major bundlers (Webpack, Vite, Rollup, Parcel)

## Troubleshooting

### Styles not loading

Ensure you've imported the CSS file before using any editor components:

```tsx
// ✅ Correct - Import CSS first
import '@form-builder/editor/styles';
import { FormEditor } from '@form-builder/editor';

// ❌ Incorrect - Components imported before styles
import { FormEditor } from '@form-builder/editor';
import '@form-builder/editor/styles';
```

### CSP (Content Security Policy) Issues

If you're using CSP, make sure to allow inline styles or add the necessary style sources:

```
Content-Security-Policy: style-src 'self' 'unsafe-inline';
```

### CSS Not Found Error

If you get a "module not found" error, ensure the package is properly installed:

```bash
npm install @form-builder/editor
# or
yarn add @form-builder/editor
# or
pnpm add @form-builder/editor
```
