# Form Builder Monorepo - Production Ready Configuration

Your form builder monorepo has been successfully configured for production publishing! Here's what has been set up:

## 📦 Published Packages

### 1. **@form-builder/types** (v0.1.0)

- Type definitions for the form builder system
- Zero dependencies
- Entry point: `dist/index.d.ts`

### 2. **@parama-ui/react** (v1.0.0)

- Reusable UI component library built with React, TailwindCSS and Radix UI
- Zero dependencies (peer dependencies: react, react-dom)
- Includes CSS styles: `dist/parama-ui.min.css`

### 3. **@form-builder/core** (v0.1.0)

- Core functionality for the form builder system
- Depends on: `@form-builder/types`
- Includes validation engine, workflow management, store management

### 4. **@form-builder/renderer** (v0.1.0)

- React components for rendering forms from schemas
- Depends on: `@form-builder/core`, `@form-builder/types`, `@parama-ui/react`
- Includes file upload support, custom field components

### 5. **@form-builder/editor** (v0.1.0)

- Visual form builder editor with drag-and-drop interface
- Depends on: all above packages
- Includes Monaco Editor, drag-and-drop functionality

## 🚀 Publishing Process

### Quick Start

```bash
# For Windows users
.\publish.bat

# For Unix/Linux/Mac users
chmod +x publish.sh
./publish.sh
```

### Manual Process

```bash
# 1. Install dependencies
pnpm install

# 2. Build all packages
pnpm build:packages

# 3. Publish all packages
pnpm publish:packages
```

## 📋 Package Structure

```
packages/
├── types/          # Type definitions (published)
├── parama-ui/      # UI components (published)
├── core/           # Core logic (published)
├── renderer/       # Form renderer (published)
└── editor/         # Form editor (published)

apps/
└── demo/           # Demo application (not published)
```

## 🔧 Build Order

The packages are built in dependency order:

1. `@form-builder/types` → 2. `@parama-ui/react` → 3. `@form-builder/core` → 4. `@form-builder/renderer` → 5. `@form-builder/editor`

## 📝 Usage Examples

### Installing Individual Packages

```bash
# For just the renderer
npm install @form-builder/renderer @form-builder/core @form-builder/types @parama-ui/react

# For the complete editor
npm install @form-builder/editor @form-builder/renderer @form-builder/core @form-builder/types @parama-ui/react
```

### Using the Renderer

```tsx
import { FormRenderer } from '@form-builder/renderer';
import '@parama-ui/react/styles';

function App() {
  return <FormRenderer schema={yourSchema} onSubmit={(data) => console.log(data)} />;
}
```

### Using the Editor

```tsx
import { FormEditor } from '@form-builder/editor';
import '@parama-ui/react/styles';

function App() {
  return <FormEditor schema={yourSchema} onSaveSchema={(schema) => console.log(schema)} />;
}
```

## 🧪 Testing After Publishing

1. Switch to development workspace:

   ```bash
   cp pnpm-workspace.dev.yaml pnpm-workspace.yaml
   ```

2. Install published packages in demo:

   ```bash
   cd apps/demo
   pnpm add @form-builder/types@latest @form-builder/core@latest @form-builder/renderer@latest @form-builder/editor@latest @parama-ui/react@latest
   ```

3. Test the demo:
   ```bash
   pnpm dev
   ```

## 📚 Documentation

Each package includes:

- ✅ README.md with usage examples
- ✅ TypeScript declarations
- ✅ Proper exports configuration
- ✅ Peer dependency management

## 🔄 Version Management

When updating versions:

1. Update version in each package's `package.json`
2. Update peer dependency versions to match
3. Run `pnpm build:packages`
4. Run `pnpm publish:packages`

## 🐛 Troubleshooting

### Build Issues

- Ensure TypeScript files compile correctly
- Verify all workspace dependencies are resolved
- Check that external dependencies are marked as external in Vite configs

### Publishing Issues

- Make sure you're logged in: `npm login`
- Verify package names are unique and available
- Check that `publishConfig.access` is set to `"public"` for scoped packages

### Import Issues

- Verify the published package exports match your imports
- Ensure peer dependencies are installed
- Check that import paths match the published package structure

## ✅ Ready for Production

Your monorepo is now production-ready with:

- ✅ Proper package.json configurations
- ✅ Correct dependency management
- ✅ Build scripts in proper order
- ✅ Publishing workflow
- ✅ Testing instructions
- ✅ Documentation

Run `./publish.bat` (Windows) or `./publish.sh` (Unix) to publish your packages to npm!
