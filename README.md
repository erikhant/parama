# Parama Form Builder

A schema-driven form builder for React: design forms visually, render them from
JSON, and keep both halves in one type-safe pipeline.

## 📦 Packages

| Package                                                       | Version | Description                                                    |
| ------------------------------------------------------------- | ------- | -------------------------------------------------------------- |
| [`@parama-dev/form-builder-types`](./packages/types)          | 0.4.1   | Type definitions. Types only, zero runtime, zero dependencies.  |
| [`@parama-ui/react`](./packages/parama-ui)                    | 1.5.0   | UI components on React, TailwindCSS and Radix UI. Owns theming. |
| [`@parama-dev/form-builder-core`](./packages/core)            | 0.6.1   | Validation engine, workflow, variables, Zustand store.          |
| [`@parama-dev/form-builder-renderer`](./packages/renderer)    | 0.8.0   | Renders a form from a schema.                                   |
| [`@parama-dev/form-builder-editor`](./packages/editor)        | 0.8.0   | Visual drag-and-drop editor with Monaco and live preview.       |

Dependency order — each depends on the ones above it:

`types` → `parama-ui` → `core` → `renderer` → `editor`

## 🚀 Installation

```bash
# Just the renderer
npm install @parama-dev/form-builder-renderer @parama-dev/form-builder-core @parama-dev/form-builder-types @parama-ui/react

# The full editor
npm install @parama-dev/form-builder-editor @parama-dev/form-builder-renderer @parama-dev/form-builder-core @parama-dev/form-builder-types @parama-ui/react
```

## 📝 Usage

### Rendering a form

```tsx
import { FormRenderer } from '@parama-dev/form-builder-renderer';
import '@parama-ui/react/styles';

function App() {
  return <FormRenderer schema={yourSchema} onSubmit={(data) => console.log(data)} />;
}
```

### Designing a form

```tsx
import { FormEditor } from '@parama-dev/form-builder-editor';
import '@parama-dev/form-builder-editor/styles';

function App() {
  return <FormEditor schema={yourSchema} onSaveSchema={(schema) => console.log(schema)} />;
}
```

> **One page hosts one form.** The core store is a module-level singleton, so
> `FormEditor` and `FormRenderer` cannot be mounted at the same time — they would
> share schema, values and mode. Render one at a time.

## 🌗 Dark mode

Both components accept `theme`, one of `'light' | 'dark' | 'system'`, defaulting
to `system`. The editor also ships a toolbar toggle and an `onThemeChange`
callback.

```tsx
<FormRenderer schema={yourSchema} theme="dark" />
<FormEditor schema={yourSchema} theme="system" onThemeChange={(theme) => save(theme)} />
```

The choice persists under the `theme` key in `localStorage`, and a stored value
outranks the prop — the prop is the default for a first-time visitor, not a
forced setting.

The theme is scoped to the component's own subtree and never applied to `<html>`,
so an embedded form builder cannot fight the host application's theme. Portalled
content (dropdowns, dialogs, the preview sheet) carries the theme on its own
content element, so it is styled wherever it lands.

To theme a whole application, wrap it in `ThemeProvider` from `@parama-ui/react`.
The components then defer to it, and their own `theme` / `onThemeChange` props
are ignored — drive the theme from the provider instead. See the
[`@parama-ui/react` README](./packages/parama-ui/README.md#-dark-mode) for the
full theming API.

## 🤝 Living beside your own UI library

The form builder is built to drop into an application that already has a design
system — including one built on Tailwind and Radix, like shadcn/ui.

**Styles do not leak, in either direction.** Every rule in the bundled stylesheet
is scoped to `data-parama-scope`, which marks only what the library draws. In
place of Tailwind's global preflight it ships a reset confined to the same
subtree, written at zero specificity so any component class of yours still wins.
Your buttons, borders, padding and typography are untouched, and your own
Tailwind utilities keep their values inside your markup.

**Overlays cooperate with your modals.** Mount a form inside a dialog of your own
and its dropdowns and date pickers portal into that dialog, so they sit within its
focus trap, stacking context and pointer-events handling. This matters most when
your copy of Radix is not the same instance as ours — two copies keep separate
focus-scope stacks, and a menu rendered beside your dialog instead of inside it
appears behind it, refuses clicks, and loses keyboard navigation.

**Design tokens are namespaced.** Corner radius is `--parama-radius`, not the bare
`--radius` that shadcn/ui and most Tailwind systems put on `:root`. The rest of
the palette is suffixed (`--primary-default`, not `--primary`) for the same
reason.

`apps/demo-production` runs shadcn/ui and the form builder on one page against the
built packages, which is where these guarantees are exercised.

## 📋 Repository layout

```
packages/
├── types/          # Type definitions (published)
├── parama-ui/      # UI components and theming (published)
├── core/           # Store, validation, workflow (published)
├── renderer/       # Form renderer (published)
└── editor/         # Form editor (published)

apps/
├── demo/             # Runs against package sources, with hot reload
└── demo-production/  # Runs against built dist, to verify what ships
```

## 🛠️ Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Run every package in watch mode
pnpm demo             # Demo against package sources
pnpm demo:prepublish  # Demo against built output
pnpm test             # Run the test suite
pnpm type-check       # Type-check every package
pnpm build:packages   # Build all packages in dependency order
```

## 🔄 Release

Workspace dependencies are declared as `workspace:*` for development and
rewritten to concrete version ranges only for publishing. `publish:prepare` does
the rewrite and builds; `publish:complete` publishes and reverts.

```bash
# 1. Bump the version in each changed package's package.json
# 2. Rewrite workspace deps to concrete ranges, then build
pnpm publish:prepare

# 3. Verify what would ship before doing it for real
pnpm publish:renderer:dry

# 4. Publish in dependency order, then restore workspace:* ranges
pnpm publish:complete
pnpm publish:parama-ui   # not part of publish:complete
```

Check the current state at any time with `pnpm deps:status`.

> Run `pnpm deps:revert` before starting a release if the tree is still in the
> prepared state. `deps:prepare` only rewrites `workspace:*`, so preparing twice
> leaves already-rewritten ranges pointing at the previous versions.

## 🐛 Troubleshooting

**Build issues** — verify workspace dependencies resolve and that externals are
marked external in the Vite configs. Turbo caches aggressively; `pnpm clean:build`
clears stale output.

**Publishing issues** — make sure you are logged in (`npm login`) and that
`publishConfig.access` is `"public"` for scoped packages. Publishing with 2FA
enabled prompts for a one-time password.

**Import issues** — confirm the published exports match your imports and that all
peer dependencies are installed.

## 📄 License

MIT — see [LICENSE](./LICENSE).
