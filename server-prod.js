/**
 * Production server entry point that handles ESM compatibility
 * This file replaces the need for TypeScript in production
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Handle ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, { max: 10 });
const db = drizzle(sql);

// Create Express application
const app = express();

// Session store setup
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

// Body parser
app.use(express.json());

// Static files
app.use(express.static(__dirname));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// Import and register API routes dynamically
const registerRoutes = async () => {
  try {
    const { default: apiRoutes } = await import('./server/routes.js');
    await apiRoutes(app);
    console.log('API routes registered successfully');
  } catch (error) {
    console.error('Failed to register API routes:', error);
  }
};

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

// Initialize routes and start listening
registerRoutes().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
