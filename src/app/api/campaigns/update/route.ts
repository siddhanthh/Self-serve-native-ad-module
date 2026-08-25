import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // 1. Authenticate the User
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.userId;

    // 2. Parse the request body
    const body = await req.json();
    const { 
      id, 
      companyName, 
      duration, 
      billingType,
      cpcRate,
      cpmRate,
      totalBudget,
      ads // array of { id?: number, title, description, imageUrl, destinationUrl, ctaText }
    } = body;

    if (!id || !companyName || !duration || !ads || !Array.isArray(ads) || ads.length === 0) {
      return NextResponse.json({ error: 'Missing required fields or creatives list' }, { status: 400 });
    }

    // Validate that each ad creative has the required fields
    for (const ad of ads) {
      if (!ad.title || !ad.description || !ad.imageUrl || !ad.destinationUrl) {
        return NextResponse.json({ error: 'All ad creatives must contain a title, description, image, and destination URL' }, { status: 400 });
      }
    }

    const days = parseInt(duration, 10);
    if (isNaN(days) || days <= 0) {
      return NextResponse.json({ error: 'Invalid duration format' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // 3. Verify Ownership
      const checkSql = `SELECT user_id FROM campaigns WHERE id = $1`;
      const checkRes = await client.query(checkSql, [id]);

      if (checkRes.rows.length === 0) {
        client.release();
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      const campaignOwnerId = checkRes.rows[0].user_id;
      const isAuthorized = campaignOwnerId === userId;

      if (!isAuthorized) {
        client.release();
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // 4. Calculate New Start and End Dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);

      await client.query('BEGIN');

      // 5. Update campaign container in the database
      const updateCampaignSql = `
        UPDATE campaigns
        SET company_name = $1, start_date = $2, end_date = $3
        WHERE id = $4
      `;

      await client.query(updateCampaignSql, [
        companyName,
        startDate.toISOString(),
        endDate.toISOString(),
        id
      ]);

      // 6. Sync ads: Delete ads not in the incoming payload
      const incomingAdIds = ads.filter(ad => ad.id !== undefined).map(ad => ad.id);
      if (incomingAdIds.length > 0) {
        await client.query(
          'DELETE FROM ads WHERE campaign_id = $1 AND id NOT IN (' + incomingAdIds.join(',') + ')',
          [id]
        );
      } else {
        await client.query('DELETE FROM ads WHERE campaign_id = $1', [id]);
      }

      // 7. Insert or update each ad creative
      for (const ad of ads) {
        if (ad.id) {
          // If editing an existing ad, verify if it was modified. If modified, set approval to pending.
          const existingAdQuery = await client.query(
            'SELECT title, description, image_url, destination_url, cta_text FROM ads WHERE id = $1',
            [ad.id]
          );
          const existingAd = existingAdQuery.rows[0];

          const isModified = !existingAd ||
            existingAd.title !== ad.title ||
            existingAd.description !== ad.description ||
            existingAd.image_url !== ad.imageUrl ||
            existingAd.destination_url !== ad.destinationUrl ||
            existingAd.cta_text !== (ad.ctaText || 'Learn More');

          const updateAdSql = `
            UPDATE ads
            SET title = $1, description = $2, image_url = $3, destination_url = $4, cta_text = $5,
                approval_status = CASE WHEN $6 = TRUE THEN 'pending' ELSE approval_status END
            WHERE id = $7 AND campaign_id = $8
          `;
          await client.query(updateAdSql, [
            ad.title,
            ad.description,
            ad.imageUrl,
            ad.destinationUrl,
            ad.ctaText || 'Learn More',
            isModified,
            ad.id,
            id
          ]);
        } else {
          // If it is a new ad, insert it as pending
          const insertAdSql = `
            INSERT INTO ads (campaign_id, title, description, image_url, destination_url, cta_text, approval_status, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending', TRUE)
          `;
          await client.query(insertAdSql, [
            id,
            ad.title,
            ad.description,
            ad.imageUrl,
            ad.destinationUrl,
            ad.ctaText || 'Learn More'
          ]);
        }
      }

      // 8. Update or insert campaign finances
      const upsertFinanceSql = `
        INSERT INTO campaign_finances (campaign_id, billing_type, cpc_rate, cpm_rate, total_budget)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (campaign_id) DO UPDATE
        SET billing_type = EXCLUDED.billing_type,
            cpc_rate = EXCLUDED.cpc_rate,
            cpm_rate = EXCLUDED.cpm_rate,
            total_budget = EXCLUDED.total_budget,
            updated_at = CURRENT_TIMESTAMP;
      `;

      await client.query(upsertFinanceSql, [
        id,
        billingType || 'CPM',
        cpcRate || 0.0000,
        cpmRate || 0.0000,
        totalBudget || 0.00
      ]);

      await client.query('COMMIT');

      return NextResponse.json({ message: 'Campaign and ads updated successfully!' }, { status: 200 });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Failed to update campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
