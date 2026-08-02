# @parama-dev/form-builder-core

Core functionality for the form builder system.

## Installation

```bash
npm install @parama-dev/form-builder-core @parama-dev/form-builder-types
```

## Usage

State lives in a Zustand store. Subscribe with a selector — reading the whole
store re-renders on every unrelated change:

```tsx
import { useFormBuilder } from '@parama-dev/form-builder-core';

function ValueCount() {
  const formData = useFormBuilder((state) => state.formData);

  return <span>{Object.keys(formData).length} values</span>;
}
```

Actions live under `actions`, and that reference is stable for the store's
lifetime:

```tsx
const { setValue, validateForm } = useFormBuilder((state) => state.actions);
```

Outside React, reach the same store through `getState()`:

```typescript
useFormBuilder.getState().actions.changeMode('render');
```

## One store per page

The store is a **module-level singleton**, so one page hosts one form. Mounting
two renderers, or a renderer and an editor at the same time, makes them share
schema, values and mode. Render one at a time.

`mode` (`'editor' | 'render'`) decides whether conditions apply: in `editor` mode
they are deliberately ignored so an author can see and edit every field. The
renderer and the editor each claim their own mode on mount.

## Features

- Form validation engine
- Schema processing
- Workflow management (conditions, dependencies)
- Variable resolution and interpolation
- Store management with Zustand

## License

MIT
