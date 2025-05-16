/**
 * Simple build script for Railway deployment
 * Handles both client and server builds
 */
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';

// Fix for ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure paths
const clientDir = path.join(__dirname, 'client');
const distDir = path.join(__dirname, 'dist');
const serverEntryPath = path.join(__dirname, 'server', 'index.ts');
const distServerDir = path.join(distDir, 'server');

// Ensure directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(distServerDir)) {
  fs.mkdirSync(distServerDir, { recursive: true });
}

// Helper for running shell commands
const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      resolve();
    });
  });
};

// Build the client application
async function buildClient() {
  console.log('\n🔨 Building client application...');
  try {
    await build({
      root: clientDir,
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'client/src'),
          '@components': path.resolve(__dirname, 'client/src/components'),
          '@lib': path.resolve(__dirname, 'client/src/lib'),
          '@hooks': path.resolve(__dirname, 'client/src/hooks'),
          '@assets': path.resolve(__dirname, 'attached_assets')
        }
      },
      build: {
        outDir: distDir,
        emptyOutDir: true,
        minify: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks: {
              react: ['react', 'react-dom'],
              radix: [
                '@radix-ui/react-accordion',
                '@radix-ui/react-alert-dialog',
                '@radix-ui/react-avatar',
                '@radix-ui/react-dialog',
                '@radix-ui/react-dropdown-menu',
                '@radix-ui/react-label',
                '@radix-ui/react-popover',
                '@radix-ui/react-select',
                '@radix-ui/react-switch',
                '@radix-ui/react-tabs',
                '@radix-ui/react-toast'
              ],
              utilities: ['clsx', 'class-variance-authority', 'date-fns', 'tailwind-merge'],
              query: ['@tanstack/react-query']
            }
          }
        }
      }
    });
    console.log('✅ Client build completed successfully!');
  } catch (error) {
    console.error('❌ Client build failed:', error);
    process.exit(1);
  }
}

// Build the server using our simpler production server
async function buildServer() {
  console.log('\n🔨 Building server...');
  try {
    // Copy the simplified server-prod.js file to the dist directory as server.js
    fs.copyFileSync(
      path.join(__dirname, 'server-prod.js'),
      path.join(distDir, 'server.js')
    );
    
    // Copy necessary server files
    const serverDir = path.join(distDir, 'server');
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }
    
    // Copy routes.js to dist/server
    const routesContent = fs.readFileSync(path.join(__dirname, 'server', 'routes.ts'), 'utf8');
    // Convert any import.meta references and TypeScript syntax to ESM compatible code
    const processedContent = routesContent
      .replace(/import\.meta\.dirname/g, 'import.meta.url')
      .replace(/import\s+\{\s*([^{}]+)\s*\}\s+from\s+["']([^"']+)["'];?/g, (match, imports, source) => {
        // Convert TypeScript imports to ESM
        if (source.endsWith('.ts')) {
          source = source.replace('.ts', '.js');
        }
        return `import { ${imports} } from "${source}";`;
      });
    
    fs.writeFileSync(path.join(serverDir, 'routes.js'), processedContent);
    
    console.log('✅ Server files copied successfully!');
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

// Create a production package.json
function createProductionPackageJson() {
  console.log('\n📦 Creating production package.json...');
  const packageJson = {
    name: 'tajik-quran-app',
    version: '1.0.0',
    type: 'module',
    scripts: {
      start: 'NODE_ENV=production node server.js'
    },
    dependencies: {
      express: '*',
      'express-session': '*',
      'connect-pg-simple': '*',
      'drizzle-orm': '*',
      postgres: '*'
    }
  };

  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

// Run the build process
async function main() {
  console.log('🚀 Starting build process for production...');
  
  try {
    await buildClient();
    await buildServer();
    createProductionPackageJson();
    
    console.log('\n✨ Build process completed successfully!');
    console.log('📂 Output directory: ' + distDir);
  } catch (error) {
    console.error('\n💥 Build process failed:', error);
    process.exit(1);
  }
}

// Execute the build
main();
