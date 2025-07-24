# Automated Dependency Management

This workspace now includes smart scripts to automatically manage the transition between development (workspace dependencies) and production (semantic version dependencies).

## The Problem

In a monorepo, we want to use `workspace:*` for development to get instant updates when packages change. However, when publishing to npm, we need to use semantic versions like `^0.2.0` so consumers get the correct published versions.

## The Solution

We've created automated scripts that:

- ✅ Automatically detect current package versions
- ✅ Update all dependency sections (dependencies, devDependencies, peerDependencies)
- ✅ Handle the workspace ↔ semantic version conversion intelligently
- ✅ Provide clear feedback on what changed
- ✅ Work on both Windows and Unix systems

## Available Commands

### Quick Commands (npm scripts)

```bash
# Check current dependency status
pnpm deps:status

# Prepare for publishing (workspace:* → ^VERSION)
pnpm deps:prepare

# Revert to development (^VERSION → workspace:*)
pnpm deps:revert

# Complete publish workflow
pnpm publish:prepare    # prepare + build
pnpm publish:complete   # publish all + revert
```

### Direct Script Usage

```bash
# Show current dependency status
node manage-deps.js status

# Convert workspace:* to semantic versions for publishing
node manage-deps.js prepare

# Convert semantic versions back to workspace:*
node manage-deps.js revert
```

### Legacy Scripts (still available)

```bash
# Unix/Linux/Mac
./prepare-for-publish.sh
./revert-to-workspace.sh

# Windows
prepare-for-publish.bat
revert-to-workspace.bat
```

## Typical Workflow

### 1. Development

```bash
# Work with workspace dependencies (default state)
pnpm deps:status   # Verify workspace:* dependencies
pnpm dev          # Develop normally
```

### 2. Preparing for Release

```bash
# Update versions if needed
pnpm version:patch   # or minor/major

# Prepare for publishing
pnpm publish:prepare  # Converts to semantic versions + builds

# Optional: Test before publishing
git diff packages/*/package.json   # Review changes
```

### 3. Publishing

```bash
# Option A: Manual publishing
pnpm publish:types
pnpm publish:core
pnpm publish:renderer
pnpm publish:editor
pnpm deps:revert   # Convert back to workspace:*

# Option B: Automated publishing
pnpm publish:complete   # Publishes all + reverts automatically
```

### 4. Back to Development

```bash
# Should be automatic if using publish:complete
pnpm deps:status   # Verify back to workspace:*
pnpm install      # Update workspace links
```

## Features

### ✨ Automatic Version Detection

- Reads current versions from each package.json
- No hardcoded versions to maintain
- Works with any version (0.1.0, 1.2.3, etc.)

### ✨ Intelligent Updates

- Only updates @parama-dev packages
- Preserves @parama-ui/react as workspace:\* (internal only)
- Handles dependencies, devDependencies, and peerDependencies
- Shows exactly what changed

### ✨ Safety Features

- Only changes workspace:\* ↔ semantic versions
- Won't modify other dependency types
- Clear feedback on all operations
- Reversible operations

### ✨ Cross-Platform

- Works on Windows, Mac, Linux
- Node.js script works everywhere
- Platform-specific shell scripts available

## Example Output

### Status Check

```
🔍 Current dependency status:

📦 Package versions:
   @parama-dev/form-builder-types: 0.2.0
   @parama-dev/form-builder-core: 0.2.0
   @parama-dev/form-builder-renderer: 0.2.0
   @parama-dev/form-builder-editor: 0.2.0

📋 @parama-dev/form-builder-core:
   dependencies:
     🔗 @parama-dev/form-builder-types: workspace:*
   peerDependencies:
     🔗 @parama-dev/form-builder-types: workspace:*
```

### Preparing for Publishing

```
🚀 Preparing packages for production publishing...

📦 Detected versions:
   @parama-dev/form-builder-types: 0.2.0
   @parama-dev/form-builder-core: 0.2.0

🔧 Processing @parama-dev/form-builder-core...
   ✓ dependencies: @parama-dev/form-builder-types: workspace:* → ^0.2.0
   ✓ peerDependencies: @parama-dev/form-builder-types: workspace:* → ^0.2.0
   ✅ Updated @parama-dev/form-builder-core

✅ All packages prepared for publishing!
```

## Benefits

1. **🚀 Faster Development**: No manual version management
2. **🛡️ Error Prevention**: No forgotten workspace:\* in published packages
3. **📊 Clear Visibility**: Always know current state
4. **🔄 Easy Reversibility**: Quick switch between modes
5. **🤖 Automation**: Integrate into CI/CD pipelines
6. **📝 Better Documentation**: Clear workflow for all team members

## Integration with CI/CD

```yaml
# Example GitHub Actions
- name: Prepare for publishing
  run: pnpm deps:prepare

- name: Build packages
  run: pnpm build

- name: Publish packages
  run: pnpm publish -r

- name: Revert to workspace
  run: pnpm deps:revert
```

This automated approach eliminates the tedious manual work of updating versions one by one and ensures consistency across all packages.
