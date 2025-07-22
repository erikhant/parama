@echo off
REM Publishing script for form-builder packages (Windows)

echo 🚀 Starting form-builder package publishing process...

REM Switch to production workspace (excludes apps)
echo 🔧 Switching to production workspace...
copy pnpm-workspace.prod.yaml pnpm-workspace.yaml

REM 1. Clean everything first
echo 🧹 Cleaning previous builds...
pnpm clean:build

REM 2. Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM 3. Build all packages
echo 🔨 Building all packages...
pnpm build:packages

REM 4. Run tests if available
echo 🧪 Running tests...
pnpm test --if-present

REM 5. Check if user is logged in to npm
echo 🔐 Checking npm login status...
npm whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ You are not logged in to npm. Please run 'npm login' first.
    exit /b 1
)

REM 6. Show packages to be published
echo 📋 About to publish the following packages:
for /f "tokens=*" %%i in ('node -p "require('./packages/types/package.json').version"') do echo   - @form-builder/types@%%i
for /f "tokens=*" %%i in ('node -p "require('./packages/parama-ui/package.json').version"') do echo   - @parama-ui/react@%%i
for /f "tokens=*" %%i in ('node -p "require('./packages/core/package.json').version"') do echo   - @form-builder/core@%%i
for /f "tokens=*" %%i in ('node -p "require('./packages/renderer/package.json').version"') do echo   - @form-builder/renderer@%%i
for /f "tokens=*" %%i in ('node -p "require('./packages/editor/package.json').version"') do echo   - @form-builder/editor@%%i
echo.

set /p confirm=Do you want to continue? (y/N): 
if /i not "%confirm%"=="y" (
    echo ❌ Publishing cancelled.
    exit /b 1
)

REM 7. Publish packages
echo 📤 Publishing packages...
pnpm publish:packages

echo ✅ All packages published successfully!
echo.
echo � Switching back to development workspace...
copy pnpm-workspace.dev.yaml pnpm-workspace.yaml
echo.
echo �📝 Next steps:
echo 1. Test the published packages in the demo app:
echo    cd apps/demo
echo    # Edit package.json to use published versions instead of workspace:*
echo    # Then run: pnpm install ^&^& pnpm dev
echo.
echo 2. Update documentation and create release notes
for /f "tokens=*" %%i in ('node -p "require('./packages/core/package.json').version"') do echo 3. Tag the release: git tag v%%i

pause
