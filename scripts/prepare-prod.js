/**
 * This script helps prepare the project for production deployment
 * It creates a modified version of the server code that works in production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the server directory
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const indexPath = path.join(serverDir, 'index.ts');

// Read the index.ts file
console.log('Reading server code...');
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Create a production-ready version with proper ESM path handling
const prodIndexContent = `// Production version with ESM path handling
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for ESM in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Original server code follows
${indexContent}
`;

// Write the production version
const prodDir = path.join(rootDir, 'dist');
if (!fs.existsSync(prodDir)) {
  fs.mkdirSync(prodDir, { recursive: true });
}

const prodIndexPath = path.join(prodDir, 'index-prod.js');
fs.writeFileSync(prodIndexPath, prodIndexContent);

console.log('Production server file created at:', prodIndexPath);
console.log('');
console.log('To deploy to Railway:');
console.log('1. Change your start script to: "NODE_ENV=production node dist/index-prod.js"');
console.log('2. Make sure you have the DATABASE_URL environment variable set');
console.log('3. Deploy your application');