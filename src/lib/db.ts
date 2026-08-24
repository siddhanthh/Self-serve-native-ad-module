import { Pool } from 'pg';

// Extend the global Node.js object in TypeScript. 
// This prevents Next.js hot-reloads in development from spawning multiple database connections.
declare global {
  var _dbPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  if (!global._dbPool) {
    global._dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  pool = global._dbPool;
}

/**
 * A helper function to execute SQL queries cleanly.
 * @param text The SQL query string
 * @param params The array of parameters to safely inject into the SQL query
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Optional: Logs how long queries take in your terminal for debugging
  console.log('Executed query', { text, duration, rows: res.rowCount });
  
  return res;
};

export default pool;