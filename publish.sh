#!/bin/bash
# Publishing script for form-builder packages

set -e  # Exit on any error

echo "🚀 Starting form-builder package publishing process..."

# Switch to production workspace (excludes apps)
echo "🔧 Switching to production workspace..."
cp pnpm-workspace.prod.yaml pnpm-workspace.yaml

# 1. Clean everything first
echo "🧹 Cleaning previous builds..."
pnpm clean:build

# 2. Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# 3. Build all packages
echo "🔨 Building all packages..."
pnpm build:packages

# 4. Run tests if available
echo "🧪 Running tests..."
pnpm test --if-present

# 5. Check if user is logged in to npm
echo "🔐 Checking npm login status..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ You are not logged in to npm. Please run 'npm login' first."
    exit 1
fi

# 6. Ask for confirmation
echo "📋 About to publish the following packages:"
echo "  - @form-builder/types@$(node -p "require('./packages/types/package.json').version")"
echo "  - @parama-ui/react@$(node -p "require('./packages/parama-ui/package.json').version")"
echo "  - @form-builder/core@$(node -p "require('./packages/core/package.json').version")"
echo "  - @form-builder/renderer@$(node -p "require('./packages/renderer/package.json').version")"
echo "  - @form-builder/editor@$(node -p "require('./packages/editor/package.json').version")"
echo ""

read -p "Do you want to continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publishing cancelled."
    exit 1
fi

# 7. Publish packages
echo "📤 Publishing packages..."
pnpm publish:packages

echo "✅ All packages published successfully!"
echo ""
echo "� Switching back to development workspace..."
cp pnpm-workspace.dev.yaml pnpm-workspace.yaml
echo ""
echo "�📝 Next steps:"
echo "1. Test the published packages in the demo app:"
echo "   cd apps/demo"
echo "   # Edit package.json to use published versions instead of workspace:*"
echo "   # Then run: pnpm install && pnpm dev"
echo ""
echo "2. Update documentation and create release notes"
echo "3. Tag the release: git tag v$(node -p "require('./packages/core/package.json').version")"
