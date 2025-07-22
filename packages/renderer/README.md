# @form-builder/renderer

React components for rendering forms from the form builder.

## Installation

```bash
npm install @form-builder/renderer @form-builder/core @form-builder/types @parama-ui/react react react-dom
```

## Usage

```tsx
import { FormRenderer } from '@form-builder/renderer';
import '@parama-ui/react/styles';

function App() {
  return <FormRenderer schema={yourSchema} onSubmit={(data) => console.log(data)} />;
}
```

## Features

- Complete form rendering from schema
- Built-in validation
- File upload support
- Custom field components
