import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  const corsHeaders = await getCorsHeaders(origin);
  return NextResponse.json({}, {
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const corsHeaders = await getCorsHeaders(origin);

  try {
    const { campaignId, adId, action, metadata } = await req.json();

    const allowedActions = [
      'serve', 
      'view', 
      'click', 
      'video_start', 
      'video_quartile_25', 
      'video_quartile_50', 
      'video_quartile_75', 
      'video_complete'
    ];
    
    if (!campaignId || !adId || !allowedActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid data or unsupported action' }, { status: 400, headers: corsHeaders });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        INSERT INTO campaign_events (campaign_id, ad_id, event_type, metadata) 
        VALUES ($1, $2, $3, $4)
      `, [campaignId, adId, action, metadata ? JSON.stringify(metadata) : null]);

      await client.query(`
        UPDATE campaign_finances
        SET spent_amount = spent_amount + CASE
          WHEN $2 = 'click' THEN cpc_rate
          WHEN $2 = 'view' THEN cpm_rate / 1000
          ELSE 0
        END
        WHERE campaign_id = $1
        AND (
          ($2 = 'click' AND cpc_rate > 0) OR
          ($2 = 'view' AND cpm_rate > 0)
        )
      `, [campaignId, action]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true }, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Tracking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}