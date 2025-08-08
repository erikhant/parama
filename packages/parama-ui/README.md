# @parama-ui/react

A beautiful, modern, and highly customizable React UI component library built with **React**, **TailwindCSS**, and **Radix UI**. Designed for building professional web applications with consistent design patterns and excellent developer experience.

## ✨ Features

- 🎨 **Beautiful Design**: Modern, clean, and professional UI components
- 🎯 **TypeScript First**: Full TypeScript support with comprehensive type definitions
- 🔧 **Highly Customizable**: Extensive theming and styling options
- ♿ **Accessible**: Built on Radix UI primitives for excellent accessibility
- 📱 **Responsive**: Mobile-first design approach
- 🎭 **Variants**: Multiple styling variants for different use cases
- 🚀 **Performance**: Optimized for production with tree-shaking support
- 🔄 **Consistent**: Design system approach for cohesive UI

## 📦 Installation

```bash
npm install @parama-ui/react
# or
yarn add @parama-ui/react
# or
pnpm add @parama-ui/react
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install react react-dom
```

### CSS Import

Import the CSS styles in your main application file:

```javascript
// In your main App.js/App.tsx or _app.tsx (Next.js)
import '@parama-ui/react/styles';
```

Alternative import paths:

```javascript
import '@parama-ui/react/dist/parama-ui.min.css';
// or
import '@parama-ui/react/parama-ui.min.css';
```

## 🚀 Quick Start

```jsx
import React from 'react';
import { Button, Input, Label, FormItem } from '@parama-ui/react';
import '@parama-ui/react/styles';

function App() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Welcome to Parama UI</h1>

      <FormItem>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </FormItem>

      <Button variant="fill" color="primary" size="default">
        Get Started
      </Button>
    </div>
  );
}

export default App;
```

## 🧩 Components

### Form Components

- **Button** - Customizable buttons with multiple variants and colors
- **Input** - Text inputs with validation support
- **Label** - Accessible form labels
- **FormItem** - Form field wrapper with proper spacing
- **FormGroup** - Input groups with prefixes and suffixes
- **Checkbox** - Styled checkboxes
- **RadioGroup** - Radio button groups
- **Switch** - Toggle switches
- **Slider** - Range sliders
- **Select** - Dropdown selects
- **MultiSelect** - Multi-selection dropdown
- **Textarea** - Multi-line text inputs
- **DatePicker** - Date selection component
- **FileUpload** - File upload component with drag & drop

### Layout Components

- **Accordion** - Collapsible content sections
- **Tabs** - Tabbed interfaces
- **Sheet** - Slide-out panels
- **Dialog** - Modal dialogs
- **Popover** - Floating content containers

### Display Components

- **Badge** - Status indicators and labels
- **Calendar** - Date calendar component
- **Separator** - Visual dividers
- **Tooltip** - Helpful tooltips

### Navigation Components

- **DropdownMenu** - Contextual menus
- **Command** - Command palette interface

## 🎨 Theming & Variants

### Button Variants

```jsx
// Fill variants (solid backgrounds)
<Button variant="fill" color="primary">Primary</Button>
<Button variant="fill" color="secondary">Secondary</Button>
<Button variant="fill" color="success">Success</Button>
<Button variant="fill" color="warning">Warning</Button>
<Button variant="fill" color="danger">Danger</Button>

// Outline variants
<Button variant="outline" color="primary">Primary</Button>

// Ghost variants (transparent)
<Button variant="ghost" color="primary">Primary</Button>

// Shadow variants
<Button variant="shadow" color="primary">Primary</Button>

// Sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Badge Variants

```jsx
<Badge variant="fill" color="primary">New</Badge>
<Badge variant="shadow" color="success">Active</Badge>
```

### Form Layouts

```jsx
// Vertical layout (default)
<FormItem orientation="vertical">
  <Label>Username</Label>
  <Input placeholder="Enter username" />
  <p className="form-description">Choose a unique username</p>
</FormItem>

// Horizontal layout
<FormItem orientation="horizontal">
  <Label>Enable notifications</Label>
  <Switch />
</FormItem>
```

## 🔧 Advanced Usage

### Custom Styling with Tailwind

All components are built with Tailwind CSS and can be customized using the `className` prop:

```jsx
<Button
  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
  variant="ghost">
  Custom Gradient Button
</Button>
```

### Form Groups with Prefixes and Suffixes

```jsx
<FormGroup
  prefix={<Mail size={16} />}
  suffix=".com"
  addOnStart={
    <select className="form-select">
      <option>https://</option>
      <option>http://</option>
    </select>
  }
  addOnEnd={<Button size="sm">Submit</Button>}>
  <Input placeholder="example" />
</FormGroup>
```

### File Upload with Validation

```jsx
<FileUpload
  name="files"
  multiple={true}
  maxFiles={5}
  maxSize={5 * 1024 * 1024} // 5MB
  accept={{
    'image/*': ['.jpeg', '.png', '.jpg'],
    'application/pdf': ['.pdf']
  }}
  onFilesChange={(files) => console.log('Files selected:', files)}
  onError={(error) => console.error('Upload error:', error)}
/>
```

### Multi-Select with Custom Options

```jsx
<MultiSelect
  placeholder="Select technologies"
  modalPopover={true}
  color="primary"
  variant="shadow"
  options={[
    { value: 'react', label: 'React', icon: ReactIcon },
    { value: 'vue', label: 'Vue.js', icon: VueIcon },
    { value: 'angular', label: 'Angular', icon: AngularIcon }
  ]}
  onValueChange={(values) => console.log('Selected:', values)}
/>
```

## 🛠️ Development

### Requirements

- React 18.2.0+
- Node.js 16+
- TailwindCSS (for styling)

### Building from Source

```bash
git clone <repository>
cd parama/packages/parama-ui
pnpm install
pnpm build
```

## 📚 Documentation

For detailed component documentation, examples, and API references, visit our [documentation site](https://your-docs-site.com).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the ISC License.

## 🔗 Related Packages

- [@parama-dev/form-builder-core](../core) - Core form building functionality
- [@parama-dev/form-builder-editor](../editor) - Visual form builder editor
- [@parama-dev/form-builder-renderer](../renderer) - Form rendering components
- [@parama-dev/form-builder-types](../types) - TypeScript type definitions

## 🆘 Support

- 📧 Email: support@parama.dev
- 💬 Discord: [Join our community](https://discord.gg/parama)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/parama/issues)

---

Made with ❤️ by the Parama Team
