#!/bin/bash
# Custom build script for Railway deployment

set -e  # Exit immediately if a command exits with a non-zero status

echo "===== Building for Railway production deployment ====="

# Build the client
echo "1. Building client application..."
npm run check
npx vite build

# Ensure client build was successful
if [ ! -f "dist/index.html" ]; then
  echo "ERROR: Client build failed. dist/index.html not found!"
  exit 1
fi

echo "2. Transpiling server code for production..."

# Create a production-ready version of the server
npx tsc --skipLibCheck server/routes.ts --outDir dist-server-temp --module esnext --moduleResolution node16 --target es2020

# Compile the railway entry point
echo "3. Building production entry point..."
npx esbuild railway.js --platform=node --packages=external --format=esm --bundle --outfile=dist/railway-entry.js

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