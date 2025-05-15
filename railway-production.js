/**
 * Lightweight production entry point for Railway deployment
 * This avoids any unnecessary processing or imports
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { registerRoutes } from './server/routes.js';

// Get the directory name from the URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Create Express app
  const app = express();
  
  // Configure session
  const PgStore = pgSession(session);
  app.use(session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'tajik-quran-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }));
  
  // JSON parser middleware
  app.use(express.json());
  
  // Configure static assets
  const staticPath = path.join(__dirname, './');
  app.use(express.static(staticPath));
  
  // Register API routes and start server
  const server = await registerRoutes(app);
  
  // For all other routes, serve the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  
  // Error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      error: 'Something went wrong', 
      message: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  });
  
  // Log successful startup
  const port = process.env.PORT || 3000;
  console.log(`Server running on port ${port}`);
}

// Start the server
main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});