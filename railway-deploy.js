/**
 * Custom build and deploy script for Railway deployment
 * This provides a more reliable approach than bash scripts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Handle ESM module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const clientRoot = path.join(__dirname, 'client');
const distFolder = path.join(__dirname, 'dist');
const serverEntryPoint = path.join(__dirname, 'railway-production.js');

// Enhance memory allocation for the build process
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Utility function to run commands and log output
function runCommand(command, description) {
  console.log(`\n${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed at: ${description}`);
    console.error(error.message);
    return false;
  }
}

// Ensure dist directory exists and is empty
function prepareDistDirectory() {
  console.log('Preparing output directory...');
  if (fs.existsSync(distFolder)) {
    fs.rmSync(distFolder, { recursive: true, force: true });
  }
  fs.mkdirSync(distFolder, { recursive: true });
}

// Build client application
function buildClient() {
  console.log('\n=== BUILDING CLIENT APPLICATION ===');
  const command = `npx vite build ${clientRoot} --outDir ${distFolder} --emptyOutDir`;
  
  return runCommand(command, 'Building client application');
}

// Build server code
function buildServer() {
  console.log('\n=== BUILDING SERVER ===');
  const command = `npx esbuild ${serverEntryPoint} --platform=node --packages=external --bundle --minify --format=esm --outfile=${path.join(distFolder, 'server.js')}`;
  
  return runCommand(command, 'Building server-side code');
}

// Create a package.json for production
function createProductionPackageJson() {
  console.log('\n=== CREATING PRODUCTION PACKAGE.JSON ===');
  
  const packageJson = {
    name: 'tajik-quran-app',
    version: '1.0.0',
    type: 'module',
    scripts: {
      start: 'NODE_ENV=production node server.js'
    }
  };
  
  fs.writeFileSync(
    path.join(distFolder, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  console.log('Created production package.json');
  return true;
}

// Main build function
async function main() {
  console.log('=== STARTING RAILWAY DEPLOYMENT BUILD ===');
  
  // Prepare directory
  prepareDistDirectory();
  
  // Build steps
  const clientSuccess = buildClient();
  if (!clientSuccess) {
    process.exit(1);
  }
  
  const serverSuccess = buildServer();
  if (!serverSuccess) {
    process.exit(1);
  }
  
  createProductionPackageJson();
  
  console.log('\n=== BUILD COMPLETED SUCCESSFULLY ===');
  console.log('The application is ready for Railway deployment.');
}

// Run the build process
main().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});