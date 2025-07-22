@echo off
REM Script to test published packages in the demo app (Windows)

echo 🧪 Testing published packages in demo app...

REM Navigate to demo app  
cd apps\demo

echo 📝 Creating package.json backup...
copy package.json package.json.backup

echo 🔄 Updating demo dependencies to use published packages...

REM Get the current versions from the workspace packages
for /f "tokens=*" %%i in ('node -p "require('../../packages/types/package.json').version"') do set TYPES_VERSION=%%i
for /f "tokens=*" %%i in ('node -p "require('../../packages/parama-ui/package.json').version"') do set PARAMA_UI_VERSION=%%i
for /f "tokens=*" %%i in ('node -p "require('../../packages/core/package.json').version"') do set CORE_VERSION=%%i
for /f "tokens=*" %%i in ('node -p "require('../../packages/renderer/package.json').version"') do set RENDERER_VERSION=%%i
for /f "tokens=*" %%i in ('node -p "require('../../packages/editor/package.json').version"') do set EDITOR_VERSION=%%i

REM Update package.json using PowerShell (more reliable than batch)
powershell -Command "(Get-Content package.json) -replace '\"@form-builder/types\": \"workspace:\*\"', '\"@form-builder/types\": \"^%TYPES_VERSION%\"' | Set-Content package.json"
powershell -Command "(Get-Content package.json) -replace '\"@parama-ui/react\": \"workspace:\*\"', '\"@parama-ui/react\": \"^%PARAMA_UI_VERSION%\"' | Set-Content package.json"
powershell -Command "(Get-Content package.json) -replace '\"@form-builder/core\": \"workspace:\*\"', '\"@form-builder/core\": \"^%CORE_VERSION%\"' | Set-Content package.json"
powershell -Command "(Get-Content package.json) -replace '\"@form-builder/renderer\": \"workspace:\*\"', '\"@form-builder/renderer\": \"^%RENDERER_VERSION%\"' | Set-Content package.json"
powershell -Command "(Get-Content package.json) -replace '\"@form-builder/editor\": \"workspace:\*\"', '\"@form-builder/editor\": \"^%EDITOR_VERSION%\"' | Set-Content package.json"

echo 📦 Installing published packages...
pnpm install

echo 🚀 Starting demo app...
echo If this works, your packages are successfully published!
pnpm dev

REM Restore original package.json when done
echo.
echo 🔄 Restoring workspace dependencies...
copy package.json.backup package.json
del package.json.backup
