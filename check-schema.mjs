import pg from 'pg';
import { config } from 'dotenv';
config({ path: '.env.local' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const { rows } = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('campaigns', 'campaign_events') 
    ORDER BY table_name, ordinal_position
  `);
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

check();
