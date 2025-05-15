#!/bin/bash
# Custom build script for Railway deployment

echo "Building for production..."

# Build the client
echo "Building client..."
npx vite build

# Create server directory in dist if it doesn't exist
mkdir -p dist/server

# Compile the production server
echo "Building server..."
npx esbuild server/index-prod.ts --platform=node --packages=external --format=esm --outfile=dist/index.js

echo "Build complete! Ready for Railway deployment."