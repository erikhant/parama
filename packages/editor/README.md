# @parama-dev/form-builder-editor

A visual form builder editor with drag-and-drop interface for creating forms.

## Installation

```bash
npm install @parama-dev/form-builder-editor @parama-dev/form-builder-core @parama-dev/form-builder-types @parama-dev/form-builder-renderer @parama-ui/react react react-dom
```

## Usage

### Basic Usage

```tsx
import { FormEditor } from '@parama-dev/form-builder-editor';
// Import the required styles
import '@parama-dev/form-builder-editor/styles';

function App() {
  const handleSave = (schema) => {
    console.log('Form schema:', schema);
  };

  return <FormEditor schema={yourSchema} onSaveSchema={handleSave} />;
}
```

### Alternative CSS Import

If you prefer to import CSS from your bundler configuration or CSS file:

```css
/* In your main CSS file */
@import '@parama-dev/form-builder-editor/dist/styles.css';
```

Or in your bundler (webpack, vite, etc.):

```js
// In your main.js or app.js
import '@parama-dev/form-builder-editor/dist/styles.css';
```

### CSS Integration

For detailed CSS integration options, see [CSS_INTEGRATION.md](./CSS_INTEGRATION.md).

## `FormEditor` props

| Prop            | Type                              | Description                                                         |
| --------------- | --------------------------------- | ------------------------------------------------------------------- |
| `schema`        | `FormSchema`                      | The form to open. Omit to start from a blank schema.                |
| `onSaveSchema`  | `(schema: FormSchema) => void`    | Called when the author clicks Save.                                 |
| `loadPreset`    | `PresetTypeDef[] \| () => …`      | Extra field presets for the toolbox.                                |
| `variables`     | `VariableContext`                 | Values available to conditions and expressions.                     |
| `options`       | `FormEditorOptions`               | Panel visibility and branding — see below.                          |
| `theme`         | `'light' \| 'dark' \| 'system'`   | Initial colour scheme. Defaults to `system`.                        |
| `onThemeChange` | `(theme: ThemeMode) => void`      | Fires when the author uses the toolbar toggle. Not called on mount. |

### `FormEditorOptions`

| Option                | Type                             | Description                                       |
| --------------------- | -------------------------------- | ------------------------------------------------- |
| `brand`               | `string \| ReactNode`            | Replaces the toolbar brand slot.                  |
| `containerClassname`  | `string`                         | Extra classes for the editor shell.               |
| `defaultFieldTab`     | `'fields' \| 'presets'`          | Which toolbox tab opens first.                    |
| `showJsonCode`        | `boolean`                        | Shows the JSON/code editor button.                |
| `variableConfig`      | `VariableEditorConfig`           | Configures the variable editor.                   |
| `generalSettings`     | `'on' \| 'off' \| 'readonly'`    | Visibility of the General properties section.     |
| `propertiesSettings`  | `'on' \| 'off' \| 'readonly'`    | Visibility of the Properties section.             |
| `dataSettings`        | `'on' \| 'off' \| 'readonly'`    | Visibility of the Data section.                   |
| `appearanceSettings`  | `'on' \| 'off' \| 'readonly'`    | Visibility of the Appearance section.             |
| `validationSettings`  | `'on' \| 'off' \| 'readonly'`    | Visibility of the Validation section.             |
| `conditionsSettings`  | `'on' \| 'off' \| 'readonly'`    | Visibility of the Conditions section.             |
| `eventsSettings`      | `'on' \| 'off' \| 'readonly'`    | Visibility of the Events section.                 |

## Theming

The editor ships a three-state theme toggle in its toolbar, cycling
`light → dark → system`. Set the starting point with `theme` and observe changes
with `onThemeChange`:

```tsx
<FormEditor schema={yourSchema} theme="dark" onThemeChange={(theme) => console.log(theme)} />
```

The choice is persisted under the `theme` key in `localStorage`, and a stored
value takes precedence over the `theme` prop — the prop is the default for a
first-time visitor, not a forced setting.

The theme is scoped to the editor's own subtree and never applied to `<html>`,
so an embedded editor cannot fight the host application's theme. Portalled
content — dropdowns, dialogs, the preview sheet — is themed through a host
element the editor maintains on `document.body`.

> **Embedding under your own provider:** if you already wrap your app in
> `ThemeProvider` from `@parama-ui/react`, the editor defers to it, and **both
> `theme` and `onThemeChange` are ignored**. The toolbar toggle keeps working —
> it reaches the outer provider through context — so the editor and the rest of
> your application stay in step. Drive and observe the theme from the provider
> in that case.

## Exports

The package exports a single component, `FormEditor`. It composes the toolbar,
toolbox, canvas, properties panel and preview internally; those parts are not
part of the public API.

## One store per page

The core store is a module-level singleton, so **one page hosts one form**.
`FormEditor` and `FormRenderer` cannot be mounted at the same time — they would
share schema, values and mode. Render one at a time.

`FormEditor` claims `editor` mode on mount, in which conditions are deliberately
ignored so the author can see and edit every field. The built-in preview mounts
the renderer, switches to `render` mode so conditions apply, and hands editor
mode back when it closes.

## Features

- Visual drag-and-drop form builder
- Monaco Editor for advanced schema editing
- Real-time form preview
- Component toolbox with search
- Property panel for field customization
- Validation rules editor
- Conditional logic support
- Light, dark and system themes

## Requirements

- React 18+
- TailwindCSS for styling
- All peer dependencies must be installed

## License

MIT
