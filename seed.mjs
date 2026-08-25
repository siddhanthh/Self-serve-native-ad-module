import pg from 'pg';
import { config } from 'dotenv';
config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  console.log("Clearing old events, ads and finances...");
  await pool.query('DELETE FROM campaign_events');
  await pool.query('DELETE FROM campaign_finances');
  await pool.query('DELETE FROM ads');

  const { rows: campaigns } = await pool.query('SELECT id, company_name FROM campaigns');
  console.log(`Found ${campaigns.length} campaigns. Seeding ads and metrics...`);

  const adSamples = [
    {
      title: "Save 50% on SaaS Tools",
      description: "Optimize your development workflows today. Easy integration, clean API interfaces, and premium support.",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      ctaText: "Shop Now"
    },
    {
      title: "Hire Elite Developers",
      description: "Scale your software engineering teams overnight. Vetted experts, match within 48 hours, risk-free trial.",
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      ctaText: "Learn More"
    },
    {
      title: "Modern UI Components Design Kit",
      description: "Beautiful Tailwind CSS components designed for developers. High converting templates, responsive layouts.",
      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
      ctaText: "Download"
    }
  ];

  for (const campaign of campaigns) {
    // Each campaign gets 2-3 ads
    const numAds = Math.floor(Math.random() * 2) + 2; // 2 or 3 ads
    const createdAds = [];

    for (let i = 0; i < numAds; i++) {
      const sample = adSamples[i % adSamples.length];
      const adResult = await pool.query(`
        INSERT INTO ads (campaign_id, title, description, image_url, destination_url, cta_text, approval_status, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        campaign.id,
        `${sample.title} (Var ${i + 1})`,
        sample.description,
        sample.imageUrl,
        "https://example.com/target-destination",
        sample.ctaText,
        i === 0 ? 'approved' : (Math.random() > 0.4 ? 'approved' : 'pending'),
        true
      ]);
      createdAds.push(adResult.rows[0].id);
    }

    // Seeding metrics at campaign finances and events levels
    const serveCount = Math.floor(Math.random() * 600) + 200; // 200-800
    const viewCount = Math.floor(serveCount * (Math.random() * 0.4 + 0.5)); // 50-90% of serve
    const clickCount = Math.floor(viewCount * (Math.random() * 0.12 + 0.02)); // 2-14% of view

    const cpcRate = parseFloat((Math.random() * 25 + 5).toFixed(2));
    const cpmRate = parseFloat((Math.random() * 200 + 50).toFixed(2));
    const totalBudget = Math.floor(Math.random() * 90000 + 10000);
    const spentAmount = parseFloat((clickCount * cpcRate + (viewCount * cpmRate / 1000)).toFixed(2));

    await pool.query(`
      INSERT INTO campaign_finances (campaign_id, billing_type, cpc_rate, cpm_rate, total_budget, spent_amount)
      VALUES ($1, 'BOTH', $2, $3, $4, $5)
    `, [campaign.id, cpcRate, cpmRate, totalBudget, spentAmount]);

    // Distribute events among the campaign's ads
    for (const adId of createdAds) {
      const adServe = Math.floor(serveCount / numAds);
      const adView = Math.floor(viewCount / numAds);
      const adClick = Math.floor(clickCount / numAds);

      await pool.query(`
        INSERT INTO campaign_events (campaign_id, ad_id, event_type, created_at)
        SELECT $1, $2, 'serve', NOW() - (random() * 6) * interval '1 day'
        FROM generate_series(1, $3::int)
      `, [campaign.id, adId, adServe]);

      await pool.query(`
        INSERT INTO campaign_events (campaign_id, ad_id, event_type, created_at)
        SELECT $1, $2, 'view', NOW() - (random() * 6) * interval '1 day'
        FROM generate_series(1, $3::int)
      `, [campaign.id, adId, adView]);

      await pool.query(`
        INSERT INTO campaign_events (campaign_id, ad_id, event_type, created_at)
        SELECT $1, $2, 'click', NOW() - (random() * 6) * interval '1 day'
        FROM generate_series(1, $3::int)
      `, [campaign.id, adId, adClick]);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
