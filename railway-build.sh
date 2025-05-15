#!/bin/bash
# Custom build script for Railway deployment

set -e  # Exit immediately if a command exits with a non-zero status

echo "===== Building for Railway production deployment ====="

# Increase Node.js memory limit to prevent "JavaScript heap out of memory" errors
export NODE_OPTIONS="--max-old-space-size=4096"

# Build the client with custom config for production and code splitting
echo "1. Building client application..."

# Skip TypeScript check since it's causing memory issues
echo "Skipping TypeScript check to avoid memory issues..."

# Use our custom Vite config for Railway
echo "Using custom Vite config with chunk splitting..."
npx vite build --config vite.railway.config.js

# Ensure client build was successful
if [ ! -f "dist/index.html" ]; then
  echo "ERROR: Client build failed. dist/index.html not found!"
  exit 1
fi

# Skip TypeScript transpilation to avoid memory issues
echo "2. Skipping TypeScript transpilation..."
# npx tsc --skipLibCheck server/routes.ts --outDir dist-server-temp --module esnext --moduleResolution node16 --target es2020

# Use a smaller, more efficient entry point for Railway
echo "3. Building production entry point with esbuild..."
npx esbuild railway-production.js --platform=node --packages=external --format=esm --bundle --minify --outfile=dist/railway-entry.js

# Create a package.json for the dist folder
echo "4. Creating production package.json..."
cat > dist/package.json << 'EOL'
{
  "name": "tajik-quran-app",
  "version": "1.0.0",
  "type": "module",
  "main": "railway-entry.js",
  "scripts": {
    "start": "NODE_ENV=production node railway-entry.js"
  }
}
EOL

echo "===== Build complete! ====="
echo "Ready for Railway deployment."
echo "Run with: NODE_ENV=production node dist/railway-entry.js"