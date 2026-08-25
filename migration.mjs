import pg from 'pg';
import { config } from 'dotenv';
config({ path: '.env.local' });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  console.log("Running Campaign ↔ Ad Separation database migration...");

  try {
    // 1. Create allowed_origins if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS allowed_origins (
        id SERIAL PRIMARY KEY,
        origin VARCHAR(255) NOT NULL UNIQUE,
        label VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Seed localhost:3000 if not exists
    await pool.query(`
      INSERT INTO allowed_origins (origin, label) 
      VALUES ('http://localhost:3000', 'Local Dev')
      ON CONFLICT (origin) DO NOTHING
    `);

    // 2. Create campaign_finances if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS campaign_finances (
        campaign_id INTEGER PRIMARY KEY,
        billing_type VARCHAR(10) NOT NULL DEFAULT 'CPM',
        cpc_rate DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
        cpm_rate DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
        total_budget DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create ads table
    await pool.query(`DROP TABLE IF EXISTS ads CASCADE`);
    await pool.query(`
      CREATE TABLE ads (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        destination_url TEXT NOT NULL,
        cta_text VARCHAR(50) DEFAULT 'Learn More',
        approval_status VARCHAR(50) DEFAULT 'pending',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created table: ads");

    // 4. Temporarily verify or add ad_id column to campaign_events
    await pool.query(`
      ALTER TABLE campaign_events 
      ADD COLUMN IF NOT EXISTS ad_id INTEGER REFERENCES ads(id) ON DELETE CASCADE;
    `);
    console.log("Added ad_id column to campaign_events.");

    // 5. Data Migration: Copy creative content from campaigns -> ads
    // Check if columns still exist on campaigns table before attempting to copy
    const columnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns' AND column_name = 'title';
    `);

    if (columnsCheck.rows.length > 0) {
      console.log("Migrating campaign creative fields to ads table...");
      
      // Select existing campaigns
      const { rows: campaigns } = await pool.query(`
        SELECT id, title, description, image_url, destination_url, cta_text, approval_status 
        FROM campaigns
      `);

      for (const campaign of campaigns) {
        // Insert creative into ads table
        const adResult = await pool.query(`
          INSERT INTO ads (campaign_id, title, description, image_url, destination_url, cta_text, approval_status, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
          RETURNING id;
        `, [
          campaign.id,
          campaign.title || 'Untitled Ad',
          campaign.description || '',
          campaign.image_url || '',
          campaign.destination_url || '',
          campaign.cta_text || 'Learn More',
          campaign.approval_status || 'pending'
        ]);

        const adId = adResult.rows[0].id;

        // Backfill events to point to this ad
        await pool.query(`
          UPDATE campaign_events 
          SET ad_id = $1 
          WHERE campaign_id = $2;
        `, [adId, campaign.id]);
      }

      console.log("Data migration successfully completed.");

      // 6. Drop the obsolete columns from campaigns table
      await pool.query(`
        ALTER TABLE campaigns 
        DROP COLUMN IF EXISTS title,
        DROP COLUMN IF EXISTS description,
        DROP COLUMN IF EXISTS image_url,
        DROP COLUMN IF EXISTS destination_url,
        DROP COLUMN IF EXISTS cta_text,
        DROP COLUMN IF EXISTS approval_status;
      `);
      console.log("Dropped creative and approval columns from campaigns.");
    } else {
      console.log("Obsolete columns already removed. Skipping campaign-to-ad data migration.");
    }

  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runMigration();
