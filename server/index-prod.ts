/**
 * Production-ready server entry point with proper ESM path handling
 */
import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { serveStatic } from "./vite";
import { registerRoutes } from "./routes";
import { log } from "./vite";

// Fix for ESM in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Add error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "An unexpected error occurred",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Handle static files in production
if (process.env.NODE_ENV === "production") {
  // Ensure the client's build directory exists
  const clientBuildDir = path.resolve(__dirname, "../client/dist");
  const serverPublicDir = path.resolve(__dirname, "public");
  
  if (fs.existsSync(clientBuildDir)) {
    // Copy the client's build directory to the server's public directory
    if (!fs.existsSync(serverPublicDir)) {
      fs.mkdirSync(serverPublicDir, { recursive: true });
    }
    
    // Simplified static file serving for production
    app.use(express.static(clientBuildDir));
    
    // Serve index.html for all routes not matched by API or static files
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientBuildDir, 'index.html'));
    });
  } else {
    console.error(`Client build directory not found: ${clientBuildDir}`);
    process.exit(1);
  }
} else {
  // In development, use the vite.ts setup for HMR, etc.
  serveStatic(app);
}

// Register API routes
registerRoutes(app);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  log(`serving on port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    log("HTTP server closed");
    process.exit(0);
  });
});