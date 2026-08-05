# CSS Integration Guide for @parama-dev/form-builder-editor

The editor ships pre-built CSS. Nothing is injected by the JavaScript bundle, so
these files have to be included by your application.

## The files

Two imports are required, and they are not interchangeable:

| Import | Size | Contains |
| ------ | ---- | -------- |
| `@parama-ui/react/styles` | 116 kB (12 kB gzipped) | Design tokens — including `--parama-radius` — and the component classes: inputs, selects, dialogs, sheets. |
| `@parama-dev/form-builder-editor/styles` | 47 kB (6.5 kB gzipped) | The editor's scoped utilities, its layout classes, and the reset they depend on. Resolves to `dist/editor.css`. |

The editor stylesheet *references* the tokens the parama-ui stylesheet
*defines*. Load only one and you get either unstyled layout or colours that
resolve to nothing. Order between them does not matter.

There is a third file, exported as `@parama-dev/form-builder-editor/styles/layout`
(`dist/styles.css`, 6 kB). It holds only the grid classes a rendered form emits —
`column-span-*`, `gap-size-*`, `height-*`. It is for a host that renders **only**
`FormRenderer` and generates the remaining utilities with its own Tailwind build.
It is not a smaller version of the editor stylesheet and will not style the
editor.

## Integration methods

### Import in JavaScript/TypeScript

```tsx
import '@parama-ui/react/styles';
import '@parama-dev/form-builder-editor/styles';

import { FormEditor } from '@parama-dev/form-builder-editor';

function App() {
  return <FormEditor />;
}
```

### Import in your main CSS file

```css
@import '@parama-ui/react/styles';
@import '@parama-dev/form-builder-editor/styles';
```

### Bundler configuration

#### Vite

```js
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      css: {
        additionalData: `
          @import '@parama-ui/react/styles';
          @import '@parama-dev/form-builder-editor/styles';
        `
      }
    }
  }
};
```

#### Webpack

```js
// webpack.config.js
module.exports = {
  entry: {
    main: [
      '@parama-ui/react/styles',
      '@parama-dev/form-builder-editor/styles',
      './src/index.js'
    ]
  }
};
```

## Living beside your own Tailwind build

The editor's stylesheet is compiled with Tailwind v3, and it is safe next to a
host running its own Tailwind — including v4 — because nothing in it is global:

- Every rule is scoped to `data-parama-scope`, an attribute that appears only on
  elements the library renders. Your `.flex` and `.rounded-lg` keep your values;
  the editor's keep its own.
- In place of Tailwind's preflight it ships a reset confined to the same scope,
  written at zero specificity so any component class of yours still wins. Your
  buttons, borders and typography are untouched.
- Tokens are namespaced. Corner radius is `--parama-radius`, not the bare
  `--radius` that shadcn/ui and most Tailwind design systems define on `:root`.

You do not need Tailwind installed to use these files. They are plain compiled
CSS.

## Troubleshooting

**Nothing is styled.** Check that both imports are present. Importing only the
editor stylesheet is the usual cause.

**Colours are missing but layout is right.** `@parama-ui/react/styles` is not
loaded — that file defines the tokens everything else reads.

**Corners look wrong next to another design system.** Something else on the page
is defining `--parama-radius`, or you are overriding the old `--radius` name.
That token was renamed in `@parama-ui/react` 1.5.0.

**Module not found.** Confirm the package name — it is
`@parama-dev/form-builder-editor`, and `@parama-ui/react` must be installed
alongside it:

```bash
pnpm add @parama-dev/form-builder-editor @parama-ui/react
```

**Content Security Policy.** The files are static CSS with no inline styles of
their own, but Radix sets inline styles for positioning overlays, so a strict
policy needs:

```
Content-Security-Policy: style-src 'self' 'unsafe-inline';
```
