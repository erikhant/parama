@echo off
REM Production Testing Script for Windows
REM This script simulates publishing packages to npm and testing them in a new project

echo 🚀 Parama Production Testing Script
echo =================================

echo 📦 Step 1: Building all packages...
pnpm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    exit /b 1
)

echo ✅ Build completed successfully!

echo 📋 Step 2: Starting production demo...
cd apps\demo-production
start "Production Demo" cmd /c "pnpm run dev & pause"

echo 🎯 Production demo should be running at: http://localhost:5003
echo 📝 This demo uses the built packages from dist/ folders
echo 💡 It simulates how the packages would work when installed from npm
echo.
echo Press any key to continue...
pause > nul
