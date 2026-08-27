import pg from 'pg';
import { config } from 'dotenv';
config({ path: '.env.local' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  console.log("Running migration to add video support and event metadata...");

  try {
    // 1. Add video_url to ads table
    await pool.query(`
      ALTER TABLE ads 
      ADD COLUMN IF NOT EXISTS video_url TEXT;
    `);
    console.log("Added video_url column to ads table.");

    // 2. Add metadata to campaign_events table
    await pool.query(`
      ALTER TABLE campaign_events 
      ADD COLUMN IF NOT EXISTS metadata JSONB;
    `);
    console.log("Added metadata column to campaign_events table.");

  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
