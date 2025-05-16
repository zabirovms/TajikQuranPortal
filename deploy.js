/**
 * Simple production deployment script for Railway
 */
import { build } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

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

// Execute shell command
const execCommand = (command) => {
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
  
  // Replace any path aliases in main.tsx
  const mainTsxPath = path.join(clientDir, 'src', 'main.tsx');
  if (fs.existsSync(mainTsxPath)) {
    let content = fs.readFileSync(mainTsxPath, 'utf8');
    content = content.replace(/from\s+["']@\/components\//g, 'from "./components/');
    content = content.replace(/from\s+["']@\/hooks\//g, 'from "./hooks/');
    content = content.replace(/from\s+["']@\/lib\//g, 'from "./lib/');
    fs.writeFileSync(mainTsxPath, content);
    console.log('✅ Fixed path aliases in main.tsx');
  }
  
  try {
    // Build with Vite
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

// Create a simple Express server for production
function createProductionServer() {
  console.log('\n🔨 Creating production server...');
  
  const serverContent = `
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import session from 'express-session';
import pgSession from 'connect-pg-simple';

// ESM compatible dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the Express app
const app = express();

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('Connecting to database...');
const sql = postgres(connectionString, { max: 10 });
const db = drizzle(sql);

// Session configuration
const PgStore = pgSession(session);
app.use(session({
  store: new PgStore({
    conString: connectionString,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'tajik-quran-default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Parse JSON request bodies
app.use(express.json());

// Basic API endpoints for the data needed by the frontend
const apiRouter = express.Router();

// API health check
apiRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Get all surahs
apiRouter.get('/surahs', async (req, res) => {
  try {
    console.log('Fetching all surahs...');
    const surahs = await sql\`SELECT * FROM surahs ORDER BY number ASC\`;
    res.json(surahs);
  } catch (error) {
    console.error('Error fetching surahs:', error);
    res.status(500).json({ error: 'Failed to fetch surahs' });
  }
});

// Get verses by surah
apiRouter.get('/surahs/:number/verses', async (req, res) => {
  try {
    const surahNumber = parseInt(req.params.number);
    console.log(\`Fetching verses for surah \${surahNumber}...\`);
    
    // First get the surah
    const surahs = await sql\`SELECT * FROM surahs WHERE number = \${surahNumber}\`;
    
    if (surahs.length === 0) {
      return res.status(404).json({ error: 'Surah not found' });
    }
    
    const surah = surahs[0];
    
    // Then get the verses
    const verses = await sql\`
      SELECT * FROM verses 
      WHERE surah_id = \${surah.id} 
      ORDER BY verse_number ASC
    \`;
    
    res.json(verses);
  } catch (error) {
    console.error('Error fetching verses:', error);
    res.status(500).json({ error: 'Failed to fetch verses' });
  }
});

// Get bookmarks
apiRouter.get('/bookmarks', async (req, res) => {
  try {
    console.log('Fetching bookmarks...');
    
    const bookmarks = await sql\`
      SELECT b.*, v.* FROM bookmarks b
      JOIN verses v ON b.verse_id = v.id
      ORDER BY b.created_at DESC
    \`;
    
    // Format response to match existing API
    const formattedBookmarks = bookmarks.map(item => ({
      bookmark: {
        id: item.id,
        user_id: item.user_id,
        verse_id: item.verse_id,
        created_at: item.created_at
      },
      verse: {
        id: item.verse_id,
        surah_id: item.surah_id,
        verse_number: item.verse_number,
        text_arabic: item.text_arabic,
        text_tajik: item.text_tajik,
        key: item.key
      }
    }));
    
    res.json(formattedBookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Mount API router
app.use('/api', apiRouter);

// Serve static files
app.use(express.static(__dirname));

// Handle SPA routing (for any non-API routes)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running on port \${PORT} in \${process.env.NODE_ENV || 'development'} mode\`);
});
`;

  fs.writeFileSync(path.join(distDir, 'server.js'), serverContent);
  
  // Create package.json for production
  const packageJson = {
    name: "tajik-quran-app",
    version: "1.0.0",
    type: "module",
    scripts: {
      start: "node server.js"
    },
    dependencies: {
      express: "^4.18.2",
      "express-session": "^1.17.3",
      "connect-pg-simple": "^9.0.1",
      "drizzle-orm": "^0.30.0",
      postgres: "^3.4.3"
    }
  };
  
  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  console.log('✅ Production server created!');
  return true;
}

// Main function
async function deploy() {
  console.log('🚀 Starting production deployment...');
  
  const clientSuccess = await buildClient();
  if (!clientSuccess) {
    process.exit(1);
  }
  
  const serverSuccess = createProductionServer();
  if (!serverSuccess) {
    process.exit(1);
  }
  
  console.log('\n✅ Deployment build completed successfully!');
  console.log('The application is ready to run on Railway.');
}

// Run the deployment
deploy().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
