/**
 * Simplified deployment script for Railway
 * Builds the client and sets up a production-ready server
 */
import { build } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set directories
const clientDir = path.join(__dirname, 'client');
const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build the client application
async function buildClient() {
  console.log('\n🔨 Building client application...');
  
  try {
    await build({
      root: clientDir,
      build: {
        outDir: distDir,
        emptyOutDir: true
      }
    });
    console.log('✅ Client build successful!');
    return true;
  } catch (error) {
    console.error('❌ Client build failed:', error);
    return false;
  }
}

// Setup production files
function setupProduction() {
  console.log('\n🔧 Setting up production environment...');
  
  // Copy production server to dist
  fs.copyFileSync(
    path.join(__dirname, 'production-server.js'),
    path.join(distDir, 'server.js')
  );
  
  // Create package.json for production
  const packageJson = {
    name: "tajik-quran-app",
    version: "1.0.0",
    type: "module",
    engines: {
      "node": ">=18.0.0"
    },
    scripts: {
      start: "node server.js"
    },
    dependencies: {
      express: "^4.18.2",
      "express-session": "^1.17.3",
      "connect-pg-simple": "^9.0.1",
      postgres: "^3.4.3"
    }
  };
  
  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  console.log('✅ Production setup completed!');
  return true;
}

// Main deployment function
async function deploy() {
  console.log('🚀 Starting simplified deployment...');
  
  const clientBuildSuccess = await buildClient();
  if (!clientBuildSuccess) {
    console.error('❌ Deployment failed: Client build error');
    process.exit(1);
  }
  
  const setupSuccess = setupProduction();
  if (!setupSuccess) {
    console.error('❌ Deployment failed: Production setup error');
    process.exit(1);
  }
  
  console.log('\n✨ Deployment build completed successfully!');
  console.log('The application is ready to run on Railway.');
}

// Run deployment
deploy().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
