# Demo Production - Form Builder Package Testing

This project tests the Parama Form Builder packages **as if they were installed from npm**. It uses the compiled packages from the `dist/` folders instead of the source code, simulating a real-world usage scenario.

## Purpose

- ✅ **Validate published packages**: Ensure the built packages work correctly
- ✅ **Test import paths**: Verify all imports resolve properly
- ✅ **Check styling**: Confirm CSS and TailwindCSS integration works
- ✅ **Simulate npm installation**: Use dist builds instead of workspace source

## Architecture

This demo project uses:

### Package Structure

```
@form-builder/types      → ../../packages/types/dist/index.js
@form-builder/core       → ../../packages/core/dist/index.es.js
@form-builder/renderer   → ../../packages/renderer/dist/index.es.js
@form-builder/editor     → ../../packages/editor/dist/index.es.js
@parama-ui/react         → ../../packages/parama-ui/dist/index.es.js
@parama-ui/css           → ../../packages/parama-ui/dist/parama-ui.min.css
```

### Key Differences from Development Demo

| Aspect          | Development Demo            | Production Demo               |
| --------------- | --------------------------- | ----------------------------- |
| **Source**      | Uses `src/` files           | Uses `dist/` files            |
| **Imports**     | Direct package references   | Compiled bundle references    |
| **TypeScript**  | Source `.ts/.tsx` files     | Compiled `.d.ts` declarations |
| **CSS**         | Source styles + PostCSS     | Pre-compiled CSS bundles      |
| **Build Speed** | Slower (compilation needed) | Faster (pre-compiled)         |

## Running the Demo

### Method 1: Direct Command

```bash
cd apps/demo-production
pnpm install
pnpm run dev
```

### Method 2: Root Script

```bash
# From project root
pnpm run build              # Build all packages first
./test-production.sh        # Linux/macOS
# OR
test-production.bat         # Windows
```

## Testing Scenarios

This demo tests:

1. **Package Imports** - All form builder packages load correctly
2. **Type Definitions** - TypeScript declarations work properly
3. **CSS Styling** - Parama UI styles are applied correctly
4. **Form Functionality** - FormEditor components work as expected
5. **Build Output** - Dist files contain everything needed

## Troubleshooting

### Common Issues

**Import Errors**: Check that all packages have been built (`pnpm run build` from root)

**CSS Not Loading**: Verify `parama-ui.min.css` exists in the parama-ui dist folder

**TypeScript Errors**: Ensure `.d.ts` declaration files are generated correctly

**Runtime Errors**: Check browser console - may indicate missing dependencies in built packages

### Build Dependencies

Before running this demo, ensure all packages are built:

```bash
# From project root
pnpm run build:types
pnpm run build:core
pnpm run build:parama-ui
pnpm run build:renderer
pnpm run build:editor
```

Or simply:

```bash
pnpm run build
```

## Deployment Simulation

This project structure mimics how the packages would be used after:

1. Publishing to npm: `npm publish` for each package
2. Installing in a new project: `npm install @form-builder/editor @parama-ui/react`
3. Importing in application code: `import { FormEditor } from '@form-builder/editor'`

The aliases in `vite.config.ts` simulate the node_modules resolution that would happen in a real npm installation.
