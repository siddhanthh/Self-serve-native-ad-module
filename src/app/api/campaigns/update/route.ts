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
    const userRole = payload.role;

    // 2. Parse the request body
    const body = await req.json();
    const { 
      id, 
      companyName, 
      title, 
      description, 
      imageUrl, 
      destinationUrl, 
      duration, 
      ctaText,
      billingType,
      cpcRate,
      cpmRate,
      totalBudget 
    } = body;

    if (!id || !companyName || !title || !description || !imageUrl || !destinationUrl || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const days = parseInt(duration, 10);
    if (isNaN(days) || days <= 0) {
      return NextResponse.json({ error: 'Invalid duration format' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // 3. Verify Ownership or Admin privileges
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

      // 5. Update campaign in the database
      // Setting approval_status to 'pending' and is_active to false so it goes for approval again
      const updateCampaignSql = `
        UPDATE campaigns
        SET company_name = $1, title = $2, description = $3, image_url = $4, destination_url = $5, start_date = $6, end_date = $7, approval_status = 'pending', is_active = false, cta_text = $8
        WHERE id = $9
      `;

      await client.query(updateCampaignSql, [
        companyName,
        title,
        description,
        imageUrl,
        destinationUrl,
        startDate.toISOString(),
        endDate.toISOString(),
        ctaText || 'Learn More',
        id
      ]);

      // 6. Update or insert campaign finances
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

      return NextResponse.json({ message: 'Campaign updated and sent for moderation successfully!' }, { status: 200 });

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
