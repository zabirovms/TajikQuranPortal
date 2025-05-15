/**
 * Production entry point for Railway deployment
 * This file handles the path resolution and ESM issues
 */
import express from 'express';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Parse JSON bodies
app.use(express.json());

// Serve static files
const clientBuildDir = path.join(__dirname, 'dist');
console.log('Serving static files from:', clientBuildDir);
if (fs.existsSync(clientBuildDir)) {
  app.use(express.static(clientBuildDir));
} else {
  console.warn('Warning: Client build directory not found at', clientBuildDir);
}

// Register API routes
registerRoutes(app).then(() => {
  console.log('API routes registered successfully');
}).catch(err => {
  console.error('Error registering API routes:', err);
  process.exit(1);
});

// Catch-all route for SPA client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else if (fs.existsSync(path.join(clientBuildDir, 'index.html'))) {
    res.sendFile(path.join(clientBuildDir, 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Server started on port ${port} (${process.env.NODE_ENV || 'development'} mode)`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});