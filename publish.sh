#!/bin/bash
# Publishing script for form-builder packages
#
# Usage:
#   ./publish.sh           - Publish packages to npm
#   ./publish.sh --dry-run - Test publish without actually publishing
#
# This script will:
# 1. Switch to production workspace
# 2. Clean and rebuild all packages
# 3. Convert workspace dependencies to version numbers
# 4. Validate packages before publishing
# 5. Publish packages to npm with detailed logging
# 6. Verify packages are available on registry
# 7. Restore workspace to development mode

set -e  # Exit on any error

# Check if dry-run mode is requested
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "🧪 Running in DRY-RUN mode - no actual publishing will occur"
    echo ""
fi

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

NPM_USER=$(npm whoami 2>/dev/null)
echo "✅ Logged in as: $NPM_USER"

# 5.5. Pre-publish validation
echo "🔍 Running pre-publish validation..."

# Check if dist directories exist and have files
PACKAGES_DIR="packages"
VALIDATION_FAILED=false

for package_dir in types parama-ui core renderer editor; do
    if [ -d "$PACKAGES_DIR/$package_dir/dist" ]; then
        if [ "$(ls -A $PACKAGES_DIR/$package_dir/dist)" ]; then
            echo "✅ $package_dir: dist directory exists and has files"
        else
            echo "❌ $package_dir: dist directory is empty"
            VALIDATION_FAILED=true
        fi
    else
        echo "❌ $package_dir: dist directory not found"
        VALIDATION_FAILED=true
    fi
done

# Check if package.json files have required fields
for package_dir in types parama-ui core renderer editor; do
    PACKAGE_JSON="$PACKAGES_DIR/$package_dir/package.json"
    if [ -f "$PACKAGE_JSON" ]; then
        # Check for required npm publish fields
        if ! grep -q '"name"' "$PACKAGE_JSON"; then
            echo "❌ $package_dir: Missing 'name' field in package.json"
            VALIDATION_FAILED=true
        fi
        if ! grep -q '"version"' "$PACKAGE_JSON"; then
            echo "❌ $package_dir: Missing 'version' field in package.json"
            VALIDATION_FAILED=true
        fi
        if ! grep -q '"main"\|"module"\|"exports"' "$PACKAGE_JSON"; then
            echo "⚠️  $package_dir: No entry point (main/module/exports) found in package.json"
        fi
    else
        echo "❌ $package_dir: package.json not found"
        VALIDATION_FAILED=true
    fi
done

if [ "$VALIDATION_FAILED" = true ]; then
    echo ""
    echo "❌ Pre-publish validation failed. Please fix the issues above before publishing."
    echo "   Common fixes:"
    echo "   1. Run 'pnpm build:packages' to generate dist files"
    echo "   2. Check package.json files for missing or incorrect fields"
    echo "   3. Ensure all packages have proper entry points configured"
    exit 1
fi

echo "✅ Pre-publish validation passed"

# 5.6. Convert workspace dependencies to version numbers
echo "🔄 Converting workspace dependencies to version numbers..."

# Create backup copies of package.json files
for package_dir in types parama-ui core renderer editor; do
    if [ -f "$PACKAGES_DIR/$package_dir/package.json" ]; then
        cp "$PACKAGES_DIR/$package_dir/package.json" "$PACKAGES_DIR/$package_dir/package.json.backup"
    fi
done

# Function to get package version
get_package_version() {
    local package_name=$1
    local package_path=""
    
    case $package_name in
        "@parama-dev/form-builder-types")
            package_path="packages/types/package.json"
            ;;
        "@parama-ui/react")
            package_path="packages/parama-ui/package.json"
            ;;
        "@parama-dev/form-builder-core")
            package_path="packages/core/package.json"
            ;;
        "@parama-dev/form-builder-renderer")
            package_path="packages/renderer/package.json"
            ;;
        "@parama-dev/form-builder-editor")
            package_path="packages/editor/package.json"
            ;;
    esac
    
    if [ -f "$package_path" ]; then
        node -p "require('./$package_path').version"
    else
        echo "0.1.0"  # fallback
    fi
}

# Replace workspace:* dependencies with actual versions
for package_dir in core renderer editor; do
    PACKAGE_JSON="$PACKAGES_DIR/$package_dir/package.json"
    if [ -f "$PACKAGE_JSON" ]; then
        echo "   Updating dependencies in $package_dir..."
        
        # Use sed to replace workspace:* dependencies
        if grep -q '"@parama-dev/form-builder-types": "workspace:\*"' "$PACKAGE_JSON"; then
            TYPES_VERSION=$(get_package_version "@parama-dev/form-builder-types")
            sed -i "s/\"@parama-dev\/form-builder-types\": \"workspace:\*\"/\"@parama-dev\/form-builder-types\": \"^$TYPES_VERSION\"/" "$PACKAGE_JSON"
            echo "     @parama-dev/form-builder-types: workspace:* → ^$TYPES_VERSION"
        fi
        
        if grep -q '"@parama-ui/react": "workspace:\*"' "$PACKAGE_JSON"; then
            PARAMA_UI_VERSION=$(get_package_version "@parama-ui/react")
            sed -i "s/\"@parama-ui\/react\": \"workspace:\*\"/\"@parama-ui\/react\": \"^$PARAMA_UI_VERSION\"/" "$PACKAGE_JSON"
            echo "     @parama-ui/react: workspace:* → ^$PARAMA_UI_VERSION"
        fi
        
        if grep -q '"@parama-dev/form-builder-core": "workspace:\*"' "$PACKAGE_JSON"; then
            CORE_VERSION=$(get_package_version "@parama-dev/form-builder-core")
            sed -i "s/\"@parama-dev\/form-builder-core\": \"workspace:\*\"/\"@parama-dev\/form-builder-core\": \"^$CORE_VERSION\"/" "$PACKAGE_JSON"
            echo "     @parama-dev/form-builder-core: workspace:* → ^$CORE_VERSION"
        fi
        
        if grep -q '"@parama-dev/form-builder-renderer": "workspace:\*"' "$PACKAGE_JSON"; then
            RENDERER_VERSION=$(get_package_version "@parama-dev/form-builder-renderer")
            sed -i "s/\"@parama-dev\/form-builder-renderer\": \"workspace:\*\"/\"@parama-dev\/form-builder-renderer\": \"^$RENDERER_VERSION\"/" "$PACKAGE_JSON"
            echo "     @parama-dev/form-builder-renderer: workspace:* → ^$RENDERER_VERSION"
        fi
    fi
done

# Function to restore package.json files from backup
restore_package_files() {
    echo "🔄 Restoring original package.json files..."
    for package_dir in types parama-ui core renderer editor; do
        if [ -f "$PACKAGES_DIR/$package_dir/package.json.backup" ]; then
            mv "$PACKAGES_DIR/$package_dir/package.json.backup" "$PACKAGES_DIR/$package_dir/package.json"
            echo "   Restored $package_dir/package.json"
        fi
    done
}

# Set up trap to restore files on exit
trap 'restore_package_files' EXIT

echo "✅ Workspace dependencies converted to version numbers"

# 6. Ask for confirmation
echo "📋 About to publish the following packages:"
echo "  - @parama-dev/form-builder-types@$(node -p "require('./packages/types/package.json').version")"
echo "  - @parama-ui/react@$(node -p "require('./packages/parama-ui/package.json').version")"
echo "  - @parama-dev/form-builder-core@$(node -p "require('./packages/core/package.json').version")"
echo "  - @parama-dev/form-builder-renderer@$(node -p "require('./packages/renderer/package.json').version")"
echo "  - @parama-dev/form-builder-editor@$(node -p "require('./packages/editor/package.json').version")"
echo ""

read -p "Do you want to continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publishing cancelled."
    exit 1
fi

# 7. Publish packages
echo "📤 Publishing packages..."

# Create a temporary file to capture publish output
PUBLISH_LOG=$(mktemp)
PUBLISH_SUMMARY=$(mktemp)

echo "📝 Publishing with detailed logging..."
echo "   Log file: $PUBLISH_LOG"

# Determine publish command based on dry-run mode
if [ "$DRY_RUN" = true ]; then
    PUBLISH_CMD="pnpm -r --filter='!apps/*' publish --dry-run --access public --report-summary"
    echo "🧪 Dry-run mode: $PUBLISH_CMD"
else
    PUBLISH_CMD="pnpm publish:packages"
    echo "🚀 Live mode: $PUBLISH_CMD"
fi

# Run publish command with detailed logging
if $PUBLISH_CMD > "$PUBLISH_LOG" 2>&1; then
    echo "✅ Publish command completed successfully!"
    echo ""
    echo "📄 Publish output:"
    cat "$PUBLISH_LOG"
    
    # Check if packages were actually published by examining the output
    if [ "$DRY_RUN" = true ]; then
        echo ""
        echo "🧪 Dry-run completed successfully!"
        echo "   The packages would be published with these configurations."
        echo "   Run without --dry-run to actually publish."
    elif grep -q "Successfully published" "$PUBLISH_LOG" || grep -q "packages published" "$PUBLISH_LOG"; then
        echo ""
        echo "🎉 All packages published successfully!"
        
        # Extract and show published package info
        echo ""
        echo "📦 Published packages summary:"
        grep -E "(Successfully published|published.*to.*registry)" "$PUBLISH_LOG" || echo "   (No detailed publish info found in output)"
        
    else
        echo ""
        echo "⚠️  Publish command ran but packages may not have been published."
        echo "   Please check the output above for details."
        echo "   Common issues:"
        echo "   - Packages already exist with the same version"
        echo "   - Network connectivity issues"
        echo "   - NPM authentication problems"
        echo "   - Package validation errors"
    fi
    
    # Verify packages are available on npm registry (skip for dry-run)
    if [ "$DRY_RUN" = false ]; then
        echo ""
        echo "🔍 Verifying packages are available on npm registry..."
        PACKAGES=(
            "@parama-dev/form-builder-types"
            "@parama-ui/react" 
            "@parama-dev/form-builder-core"
            "@parama-dev/form-builder-renderer"
            "@parama-dev/form-builder-editor"
        )
        
        VERIFICATION_FAILED=false
        for package in "${PACKAGES[@]}"; do
            echo -n "   Checking $package... "
            if npm view "$package" version > /dev/null 2>&1; then
                PUBLISHED_VERSION=$(npm view "$package" version 2>/dev/null)
                echo "✅ Available (v$PUBLISHED_VERSION)"
            else
                echo "❌ Not found on registry"
                VERIFICATION_FAILED=true
            fi
            sleep 1  # Small delay to avoid rate limiting
        done
        
        if [ "$VERIFICATION_FAILED" = true ]; then
            echo ""
            echo "⚠️  Some packages were not found on npm registry."
            echo "   This might be due to:"
            echo "   - Registry propagation delay (try again in a few minutes)"
            echo "   - Publishing errors that weren't detected"
            echo "   - Package name or scope issues"
            echo "   - Registry authentication problems"
        fi
    fi
else
    echo "❌ Publishing failed!"
    echo ""
    echo "🔍 Error details:"
    cat "$PUBLISH_LOG"
    echo ""
    echo "🛠️  Common solutions:"
    echo "1. Check if you're logged in: npm whoami"
    echo "2. Verify package versions aren't already published"
    echo "3. Check network connectivity to npm registry"
    echo "4. Ensure all package.json files have correct configuration"
    echo "5. Verify build artifacts exist in dist/ directories"
    echo ""
    
    # Clean up temp files
    rm -f "$PUBLISH_LOG" "$PUBLISH_SUMMARY"
    
    # Restore development workspace before exiting
    echo "🔄 Restoring development workspace due to error..."
    cp pnpm-workspace.dev.yaml pnpm-workspace.yaml
    
    # Restore package.json files (trap will also do this, but let's be explicit)
    restore_package_files
    exit 1
fi

# Clean up temp files
rm -f "$PUBLISH_LOG" "$PUBLISH_SUMMARY"
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
