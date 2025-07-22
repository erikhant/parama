#!/bin/bash

# Production Testing Script
# This script simulates publishing packages to npm and testing them in a new project

echo "🚀 Parama Production Testing Script"
echo "================================="

echo "📦 Step 1: Building all packages..."
cd "$(dirname "$0")"
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

echo "📋 Step 2: Starting production demo..."
cd apps/demo-production
pnpm run dev &
DEMO_PID=$!

echo "🎯 Production demo is running at: http://localhost:5003"
echo "📝 This demo uses the built packages from dist/ folders"
echo "💡 It simulates how the packages would work when installed from npm"
echo ""
echo "To stop the demo, press Ctrl+C"

# Wait for user to stop the process
wait $DEMO_PID
