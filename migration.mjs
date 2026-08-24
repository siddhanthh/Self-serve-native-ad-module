import pg from 'pg';
import { config } from 'dotenv';
config({ path: '.env.local' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  console.log("Running migration...");

  try {
    // Drop table if exists to be safe during dev
    await pool.query(`DROP TABLE IF EXISTS campaign_finances`);

    // Create table
    await pool.query(`
      CREATE TABLE campaign_finances (
        campaign_id INTEGER PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
        billing_type VARCHAR(10) NOT NULL DEFAULT 'CPM',
        cpc_rate DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
        cpm_rate DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
        total_budget DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created table campaign_finances.");

    // Backfill
    await pool.query(`
      INSERT INTO campaign_finances (campaign_id, billing_type, cpc_rate, cpm_rate, total_budget)
      SELECT 
        id, 
        CASE WHEN random() > 0.5 THEN 'CPC' ELSE 'CPM' END,
        (random() * 2.0 + 0.5)::numeric(10,4),
        (random() * 10.0 + 5.0)::numeric(10,4),
        (random() * 4500 + 500)::numeric(12,2)
      FROM campaigns;
    `);
    console.log("Backfilled financial data for existing campaigns.");

  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    process.exit(0);
  }
}

runMigration();
