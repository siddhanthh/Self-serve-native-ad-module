import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { campaignId, action } = await req.json();

    const allowedActions = ['serve', 'view', 'click'];
    
    if (!campaignId || !allowedActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid data or unsupported action' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        INSERT INTO campaign_events (campaign_id, event_type) 
        VALUES ($1, $2)
      `, [campaignId, action]);

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
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Tracking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}