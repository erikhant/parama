# @parama-dev/form-builder-types

Type definitions for the form builder system.

## Installation

```bash
npm install @parama-dev/form-builder-types
```

## Usage

```typescript
import type { FormField, FormSchema, ThemeMode } from '@parama-dev/form-builder-types';

const schema: FormSchema = {
  id: 'user-form',
  version: '1.0.0',
  title: 'User',
  layout: { colSize: 12, gap: 4 },
  fields: []
};
```

The package is types only — it emits no runtime code, so import from it with
`import type`.

## Key types

| Type                | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `FormSchema`        | A whole form: metadata, layout and fields.               |
| `FormField`         | Union of every field type.                               |
| `FormBuilderProps`  | Props accepted by `FormRenderer`.                        |
| `FormEditorProps`   | Props accepted by `FormEditor`.                          |
| `FormEditorOptions` | Panel visibility and branding for the editor.            |
| `ValidationRule`    | A single validation rule and its trigger.                |
| `FieldConditions`   | Conditional visibility, disabled and read-only rules.    |
| `ThemeMode`         | `'light' \| 'dark' \| 'system'`.                         |
| `VariableContext`   | Values available to conditions and expressions.          |

## Features

- Complete TypeScript definitions for form schemas
- Validation types and interfaces
- Field type definitions
- Form configuration types

## License

MIT
