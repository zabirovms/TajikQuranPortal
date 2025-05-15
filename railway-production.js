/**
 * Lightweight production entry point for Railway deployment
 * This avoids any unnecessary processing or imports
 */
import express from 'express';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { storage } from './server/storage.js';
import { registerRoutes } from './server/routes.js';

// Fix for ESM path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app and server
const app = express();
const server = createServer(app);

// Basic logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} [railway] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// JSON and URL-encoded parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const staticDir = path.join(__dirname, 'dist');
console.log(`Serving static files from: ${staticDir}`);
app.use(express.static(staticDir));

// Register API routes
try {
  await registerRoutes(app);
  console.log('[railway] API routes registered successfully');
} catch (err) {
  console.error('[railway] Error registering API routes:', err);
  process.exit(1);
}

// Catch-all route for SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(staticDir, 'index.html'));
  }
});

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Railway server started on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});