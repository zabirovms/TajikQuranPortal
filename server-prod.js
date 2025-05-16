/**
 * Production-ready Express server with API endpoints
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import session from 'express-session';
import pgSession from 'connect-pg-simple';

// Handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express application
const app = express();

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Initialize SQL client with error handling
console.log('Connecting to database...');
let sql;
try {
  sql = postgres(connectionString, { 
    max: 10,
    idle_timeout: 30,
    ssl: { rejectUnauthorized: false }, // Add SSL support for Supabase
    connect_timeout: 30,
    connection: {
      application_name: 'tajik-quran-railway-app'
    }
  });
  
  // Test database connection
  console.log('Testing database connection...');
  const testConnection = async () => {
    try {
      const result = await sql`SELECT 1 as connection_test`;
      console.log('✅ Database connection successful:', result);
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      console.error('Please check your DATABASE_URL environment variable');
    }
  };
  
  testConnection();
} catch (error) {
  console.error('❌ Failed to initialize database connection:', error);
  process.exit(1);
}

// Body parser middleware
app.use(express.json());

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

// API endpoints
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development' 
  });
});

// Get all surahs
apiRouter.get('/surahs', async (req, res) => {
  try {
    console.log('Fetching all surahs...');
    const surahs = await sql`SELECT * FROM surahs ORDER BY number ASC`;
    console.log(`Found ${surahs.length} surahs`);
    res.json(surahs);
  } catch (error) {
    console.error('Error fetching surahs:', error);
    res.status(500).json({ error: 'Failed to fetch surahs' });
  }
});

// Get a specific surah by number
apiRouter.get('/surahs/:number', async (req, res) => {
  try {
    const surahNumber = parseInt(req.params.number);
    console.log(`Fetching surah ${surahNumber}...`);
    
    const surahs = await sql`SELECT * FROM surahs WHERE number = ${surahNumber}`;
    
    if (surahs.length === 0) {
      return res.status(404).json({ error: 'Surah not found' });
    }
    
    res.json(surahs[0]);
  } catch (error) {
    console.error('Error fetching surah:', error);
    res.status(500).json({ error: 'Failed to fetch surah' });
  }
});

// Get verses for a specific surah
apiRouter.get('/surahs/:number/verses', async (req, res) => {
  try {
    const surahNumber = parseInt(req.params.number);
    console.log(`Fetching verses for surah ${surahNumber}...`);
    
    // First get the surah
    const surahs = await sql`SELECT * FROM surahs WHERE number = ${surahNumber}`;
    
    if (surahs.length === 0) {
      return res.status(404).json({ error: 'Surah not found' });
    }
    
    const surah = surahs[0];
    
    // Then get the verses
    const verses = await sql`
      SELECT * FROM verses 
      WHERE surah_id = ${surah.id} 
      ORDER BY verse_number ASC
    `;
    
    console.log(`Found ${verses.length} verses for surah ${surahNumber}`);
    res.json(verses);
  } catch (error) {
    console.error('Error fetching verses:', error);
    res.status(500).json({ error: 'Failed to fetch verses' });
  }
});

// Get a specific verse by key
apiRouter.get('/verses/:key', async (req, res) => {
  try {
    const key = req.params.key;
    console.log(`Fetching verse with key ${key}...`);
    
    const verses = await sql`SELECT * FROM verses WHERE key = ${key}`;
    
    if (verses.length === 0) {
      return res.status(404).json({ error: 'Verse not found' });
    }
    
    res.json(verses[0]);
  } catch (error) {
    console.error('Error fetching verse:', error);
    res.status(500).json({ error: 'Failed to fetch verse' });
  }
});

// Search verses
apiRouter.get('/search', async (req, res) => {
  try {
    const query = req.query.q?.toString() || '';
    const language = req.query.language?.toString() || 'both';
    const surahId = req.query.surahId ? parseInt(req.query.surahId.toString()) : undefined;
    
    console.log(`Searching for "${query}" in language ${language}${surahId ? ` in surah ${surahId}` : ''}...`);
    
    if (!query || query.length < 2) {
      return res.json([]);
    }
    
    let results;
    
    if (surahId) {
      if (language === 'arabic') {
        results = await sql`
          SELECT v.* FROM verses v
          WHERE v.surah_id = ${surahId}
            AND v.text_arabic ILIKE ${'%' + query + '%'}
          ORDER BY v.surah_id, v.verse_number
          LIMIT 100
        `;
      } else if (language === 'tajik') {
        results = await sql`
          SELECT v.* FROM verses v
          WHERE v.surah_id = ${surahId}
            AND v.text_tajik ILIKE ${'%' + query + '%'}
          ORDER BY v.surah_id, v.verse_number
          LIMIT 100
        `;
      } else {
        results = await sql`
          SELECT v.* FROM verses v
          WHERE v.surah_id = ${surahId}
            AND (v.text_arabic ILIKE ${'%' + query + '%'} OR v.text_tajik ILIKE ${'%' + query + '%'})
          ORDER BY v.surah_id, v.verse_number
          LIMIT 100
        `;
      }
    } else {
      if (language === 'arabic') {
        results = await sql`
          SELECT v.* FROM verses v
          WHERE v.text_arabic ILIKE ${'%' + query + '%'}
          ORDER BY v.surah_id, v.verse_number
          LIMIT 100
        `;
      } else if (language === 'tajik') {
        results = await sql`
          SELECT v.* FROM verses v
          WHERE v.text_tajik ILIKE ${'%' + query + '%'}
          ORDER BY v.surah_id, v.verse_number
          LIMIT 100
        `;
      } else {
        results = await sql`
          SELECT v.* FROM verses v
          WHERE v.text_arabic ILIKE ${'%' + query + '%'} OR v.text_tajik ILIKE ${'%' + query + '%'}
          ORDER BY v.surah_id, v.verse_number
          LIMIT 100
        `;
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error searching verses:', error);
    res.status(500).json({ error: 'Failed to search verses' });
  }
});

// Get all bookmarks
apiRouter.get('/bookmarks', async (req, res) => {
  try {
    console.log('Fetching bookmarks...');
    
    const results = await sql`
      SELECT b.id, b.user_id, b.verse_id, b.created_at,
             v.id as verse_id, v.surah_id, v.verse_number, v.text_arabic, v.text_tajik, v.key
      FROM bookmarks b
      JOIN verses v ON b.verse_id = v.id
      ORDER BY b.created_at DESC
    `;
    
    // Format response to match existing API
    const bookmarks = results.map(item => ({
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
    
    console.log(`Found ${bookmarks.length} bookmarks`);
    res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Create a bookmark
apiRouter.post('/bookmarks', async (req, res) => {
  try {
    const { user_id, verse_id } = req.body;
    
    if (!user_id || !verse_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`Creating bookmark for verse ${verse_id}...`);
    
    // Check if bookmark already exists
    const existing = await sql`
      SELECT * FROM bookmarks
      WHERE user_id = ${user_id} AND verse_id = ${verse_id}
    `;
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Bookmark already exists', bookmark: existing[0] });
    }
    
    // Create the bookmark
    const result = await sql`
      INSERT INTO bookmarks (user_id, verse_id, created_at)
      VALUES (${user_id}, ${verse_id}, now())
      RETURNING *
    `;
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

// Delete a bookmark
apiRouter.delete('/bookmarks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`Deleting bookmark ${id}...`);
    
    const result = await sql`
      DELETE FROM bookmarks
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// Mount API router
app.use('/api', apiRouter);

// Serve static files
app.use(express.static(__dirname));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
