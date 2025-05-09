import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Ensure we have a DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres client
const connectionString = process.env.DATABASE_URL;
// For use with Node.js native driver
const sql = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10
});

// Initialize drizzle
export const db = drizzle(sql);