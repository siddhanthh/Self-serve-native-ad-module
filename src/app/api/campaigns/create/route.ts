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

    const body = await req.json();
    const { 
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

    if (!companyName || !title || !description || !imageUrl || !destinationUrl || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const days = parseInt(duration, 10);
    if (isNaN(days) || days <= 0) {
      return NextResponse.json({ error: 'Invalid duration format' }, { status: 400 });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days); 

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const campaignSql = `
        INSERT INTO campaigns (user_id, company_name, title, description, image_url, destination_url, start_date, end_date, approval_status, cta_text)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
        RETURNING id;
      `;

      const campaignResult = await client.query(campaignSql, [
        userId,
        companyName,
        title,
        description,
        imageUrl,
        destinationUrl,
        startDate.toISOString(),
        endDate.toISOString(),
        ctaText || 'Learn More'
      ]);

      const campaignId = campaignResult.rows[0].id;

      const financeSql = `
        INSERT INTO campaign_finances (campaign_id, billing_type, cpc_rate, cpm_rate, total_budget, spent_amount)
        VALUES ($1, $2, $3, $4, $5, 0.00);
      `;

      await client.query(financeSql, [
        campaignId,
        billingType || 'CPM',
        cpcRate || 0.0000,
        cpmRate || 0.0000,
        totalBudget || 0.00
      ]);

      await client.query('COMMIT');

      return NextResponse.json(
        { message: 'Campaign submitted successfully!', campaignId }, 
        { status: 201 }
      );
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}