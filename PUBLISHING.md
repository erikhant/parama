# Publishing Guide

This guide explains how to build and publish the form builder packages.

## Prerequisites

1. Make sure you have `pnpm` installed
2. Make sure you're logged in to npm: `npm login`
3. Ensure all packages have unique, valid names

## Development vs Publishing Workspace

This monorepo uses different workspace configurations:

- **Development** (`pnpm-workspace.yaml`): Includes `apps/*` for testing with workspace dependencies
- **Production** (`pnpm-workspace.prod.yaml`): Only includes `packages/*` for clean publishing

## Publishing Process

### Method 1: Automated Publishing (Recommended)

```bash
# For Windows
.\publish.bat

# For Unix/Linux/Mac
chmod +x publish.sh
./publish.sh
```

### Method 2: Manual Publishing

### Method 2: Manual Publishing

#### 1. Switch to Production Workspace

```bash
cp pnpm-workspace.prod.yaml pnpm-workspace.yaml
```

#### 2. Install Dependencies

```bash
pnpm install
```

##### 3. Build All Packages

```bash
pnpm build:packages
```

This will build packages in the correct order:

1. `@form-builder/types` - Type definitions
2. `@parama-ui/react` - UI component library
3. `@form-builder/core` - Core logic
4. `@form-builder/renderer` - React form components
5. `@form-builder/editor` - Visual form builder editor

#### 4. Test the Build

Before publishing, make sure all packages build successfully and have no errors.

#### 5. Publish Packages

To publish all packages at once:

```bash
pnpm publish:packages
```

Or publish individually:

```bash
# Publish types first
cd packages/types && npm publish

# Then parama-ui
cd ../parama-ui && npm publish

# Then core
cd ../core && npm publish

# Then renderer
cd ../renderer && npm publish

# Finally editor
cd ../editor && npm publish
```

#### 6. Switch Back to Development Workspace

```bash
cp pnpm-workspace.dev.yaml pnpm-workspace.yaml
```

### 5. Test Installation

After publishing, test the packages by installing them in the demo app:

```bash
# For Windows
.\test-published.bat

# For Unix/Linux/Mac
chmod +x test-published.sh
./test-published.sh
```

This script will:

1. Temporarily replace workspace dependencies with published package versions
2. Install the published packages
3. Run the demo app to verify everything works
4. Restore the workspace dependencies

## Package Dependencies

The packages have the following dependency relationships:

```
@form-builder/types (no dependencies)
├── @parama-ui/react (no dependencies)
├── @form-builder/core (depends on types)
├── @form-builder/renderer (depends on types, core, parama-ui)
└── @form-builder/editor (depends on types, core, renderer, parama-ui)
```

## Versioning

When updating versions:

1. Update the version in each package's `package.json`
2. Update peer dependency versions to match
3. Build and test
4. Publish in dependency order

## Troubleshooting

### Build Errors

- Check that all TypeScript files compile correctly
- Ensure all dependencies are properly installed
- Verify that workspace dependencies are resolved

### Publishing Errors

- Make sure you're logged in to npm
- Check that package names are unique
- Ensure `publishConfig.access` is set to `"public"` for scoped packages

### Demo App Issues

- Make sure published packages are the correct versions
- Check that all peer dependencies are installed
- Verify import paths match the published package exports
