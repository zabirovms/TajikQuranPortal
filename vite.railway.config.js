import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if we're in Railway environment
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';

export default defineConfig({
  plugins: [react()],
  
  // Set the root directory to client
  root: path.resolve(__dirname, 'client'),
  
  // Explicitly set the outDir to dist
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    assetsDir: 'assets',
    
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Manually split chunks for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          'vendor-utils': [
            'class-variance-authority',
            'tailwind-merge',
            '@tanstack/react-query',
            'date-fns',
            'wouter'
          ]
        }
      }
    }
  },
  
  // Define resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  
  // Use the same server configuration
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: 443
    }
  }
});