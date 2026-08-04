# @parama-dev/form-builder-renderer

React components for rendering forms from the form builder.

## Installation

```bash
npm install @parama-dev/form-builder-renderer @parama-dev/form-builder-core @parama-dev/form-builder-types @parama-ui/react react react-dom
```

## Usage

```tsx
import { FormRenderer } from '@parama-dev/form-builder-renderer';
import '@parama-ui/react/styles';

function App() {
  return <FormRenderer schema={yourSchema} onSubmit={(data) => console.log(data)} />;
}
```

## `FormRenderer` props

| Prop         | Type                                                                | Description                                                     |
| ------------ | ------------------------------------------------------------------- | --------------------------------------------------------------- |
| `schema`     | `FormSchema`                                                        | Required. The form to render.                                    |
| `data`       | `Record<string, any>`                                               | Seeds initial field values.                                      |
| `variables`  | `VariableContext`                                                   | Values available to conditions and expressions.                  |
| `validators` | `ValidatorRegistry`                                                 | Custom validators, keyed by name.                                |
| `theme`      | `'light' \| 'dark' \| 'system'`                                     | Initial colour scheme. Defaults to `system`.                     |
| `onSubmit`   | `(data, contentType) => void \| Promise<void>`                      | `contentType` is `application/json` unless the form has files.   |
| `onChange`   | `(data: Record<string, any>) => void`                               | Fires on user edits. Not called for the initial value.           |
| `onCancel`   | `() => void`                                                        | Invoked by a `cancel` button field.                              |

## Theming

Pass `theme` to choose the colour scheme. `system` follows the OS preference and
reacts to changes at runtime.

```tsx
<FormRenderer schema={yourSchema} theme="dark" />
```

The theme is scoped to the renderer's own subtree — it is applied to a wrapper
element, never to `<html>` — so an embedded form cannot fight the host
application's own theme.

Three things follow from that, and they matter when embedding:

- **A choice the user has already made wins.** The mode is persisted under the
  `theme` key in `localStorage`. If a value is present, it takes precedence over
  the `theme` prop, which acts as the default for a first-time visitor rather
  than a forced setting.
- **Portalled content is themed too.** Dropdowns and date pickers render through a
  portal, outside the wrapper, so each one carries the theme on its own content
  element rather than inheriting it.
- **The form works inside your modal.** Mount `FormRenderer` in a dialog of your
  own and its dropdowns portal into that dialog, so they stay inside its focus
  trap and stacking context. Rendered beside it instead, a menu appears behind the
  dialog, refuses clicks, and loses keyboard navigation and hover highlighting.
- **An outer provider wins.** If you already wrap your app in `ThemeProvider`
  from `@parama-ui/react`, the renderer defers to it and the `theme` prop is
  ignored. Drive the theme from the provider in that case.

```tsx
import { ThemeProvider } from '@parama-ui/react';

// The form follows the app's theme; `theme` on FormRenderer would be inert here.
<ThemeProvider theme="dark">
  <YourApp>
    <FormRenderer schema={yourSchema} />
  </YourApp>
</ThemeProvider>;
```

Painting the page itself is the host's job, since the renderer deliberately does
not touch `<html>` or `<body>`. Read the resolved theme with `useTheme()` and
apply it however your application does.

## One store per page

The core store is a module-level singleton, so **one page hosts one form**.
Rendering two `FormRenderer`s at once makes them share schema, values and mode.
To show a designer and a form in the same application, render one at a time.

`FormRenderer` claims `render` mode on mount, and the editor claims `editor` mode
on its own mount. This is what lets a form mounted after the editor still apply
its conditions — in editor mode conditions are deliberately ignored so the author
can see and edit every field.

## Features

- Complete form rendering from schema
- Built-in validation
- File upload support
- Custom field components
- Light, dark and system themes

## License

MIT
