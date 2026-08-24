import pg from 'pg';
import { config } from 'dotenv';
config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  console.log("Clearing old events and finances...");
  await pool.query('DELETE FROM campaign_events');
  await pool.query('DELETE FROM campaign_finances');

  const { rows: campaigns } = await pool.query('SELECT id FROM campaigns');
  console.log(`Found ${campaigns.length} campaigns. Seeding...`);

  for (const campaign of campaigns) {
    // Generate distinct random counts in Javascript for this campaign
    const serveCount = Math.floor(Math.random() * 600) + 200; // 200-800
    const viewCount = Math.floor(serveCount * (Math.random() * 0.4 + 0.5)); // 50-90% of serve
    const clickCount = Math.floor(viewCount * (Math.random() * 0.12 + 0.02)); // 2-14% of view

    // Rupees rates
    const cpcRate = parseFloat((Math.random() * 25 + 5).toFixed(2)); // ₹5.00 to ₹30.00
    const cpmRate = parseFloat((Math.random() * 200 + 50).toFixed(2)); // ₹50.00 to ₹250.00
    const totalBudget = Math.floor(Math.random() * 90000 + 10000); // ₹10,000 to ₹100,000
    
    // Calculate precise spending
    const spentAmount = parseFloat((clickCount * cpcRate + (viewCount * cpmRate / 1000)).toFixed(2));

    console.log(`Campaign ID ${campaign.id}: Seeding ${serveCount} serves, ${viewCount} views, ${clickCount} clicks.`);
    console.log(`Financials: CPC ₹${cpcRate}, CPM ₹${cpmRate}, Spent ₹${spentAmount} / Budget ₹${totalBudget}`);

    // Seed finances
    await pool.query(`
      INSERT INTO campaign_finances (campaign_id, billing_type, cpc_rate, cpm_rate, total_budget, spent_amount)
      VALUES ($1, 'BOTH', $2, $3, $4, $5)
    `, [campaign.id, cpcRate, cpmRate, totalBudget, spentAmount]);

    // Seed serve events
    await pool.query(`
      INSERT INTO campaign_events (campaign_id, event_type, created_at)
      SELECT $1, 'serve', NOW() - (random() * 6) * interval '1 day'
      FROM generate_series(1, $2::int)
    `, [campaign.id, serveCount]);

    // Seed view events
    await pool.query(`
      INSERT INTO campaign_events (campaign_id, event_type, created_at)
      SELECT $1, 'view', NOW() - (random() * 6) * interval '1 day'
      FROM generate_series(1, $2::int)
    `, [campaign.id, viewCount]);

    // Seed click events
    await pool.query(`
      INSERT INTO campaign_events (campaign_id, event_type, created_at)
      SELECT $1, 'click', NOW() - (random() * 6) * interval '1 day'
      FROM generate_series(1, $2::int)
    `, [campaign.id, clickCount]);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
