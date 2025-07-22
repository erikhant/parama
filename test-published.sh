#!/bin/bash
# Script to test published packages in the demo app

echo "🧪 Testing published packages in demo app..."

# Navigate to demo app
cd apps/demo

echo "📝 Creating package.json backup..."
cp package.json package.json.backup

echo "🔄 Updating demo dependencies to use published packages..."

# Get the current versions from the workspace packages
TYPES_VERSION=$(node -p "require('../../packages/types/package.json').version")
PARAMA_UI_VERSION=$(node -p "require('../../packages/parama-ui/package.json').version")
CORE_VERSION=$(node -p "require('../../packages/core/package.json').version")
RENDERER_VERSION=$(node -p "require('../../packages/renderer/package.json').version")
EDITOR_VERSION=$(node -p "require('../../packages/editor/package.json').version")

# Update package.json to use published versions
sed -i "s/\"@form-builder\/types\": \"workspace:\*\"/\"@form-builder\/types\": \"^${TYPES_VERSION}\"/g" package.json
sed -i "s/\"@parama-ui\/react\": \"workspace:\*\"/\"@parama-ui\/react\": \"^${PARAMA_UI_VERSION}\"/g" package.json
sed -i "s/\"@form-builder\/core\": \"workspace:\*\"/\"@form-builder\/core\": \"^${CORE_VERSION}\"/g" package.json
sed -i "s/\"@form-builder\/renderer\": \"workspace:\*\"/\"@form-builder\/renderer\": \"^${RENDERER_VERSION}\"/g" package.json
sed -i "s/\"@form-builder\/editor\": \"workspace:\*\"/\"@form-builder\/editor\": \"^${EDITOR_VERSION}\"/g" package.json

echo "📦 Installing published packages..."
pnpm install

echo "🚀 Starting demo app..."
echo "If this works, your packages are successfully published!"
pnpm dev

# Restore original package.json when done
echo ""
echo "🔄 Restoring workspace dependencies..."
cp package.json.backup package.json
rm package.json.backup
