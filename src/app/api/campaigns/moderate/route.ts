import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (payload?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
    }

    // 3. Parse the Request Body
    const body = await req.json();
    const { campaignId, action } = body;

    if (!campaignId || (action !== 'approve' && action !== 'reject' && action !== 'pause')) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // 4. Determine the new statuses based on the action
    let approvalStatus = 'approved';
    let isActive = true;

    if (action === 'reject') {
      approvalStatus = 'rejected';
      isActive = false;
    } else if (action === 'pause') {
      approvalStatus = 'approved';
      isActive = false;
    }

    // 5. Execute the SQL Update
    const sql = `
      UPDATE campaigns 
      SET approval_status = $1, is_active = $2
      WHERE id = $3
      RETURNING id, approval_status, is_active;
    `;

    const result = await query(sql, [approvalStatus, isActive, campaignId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // 6. Return Success
    return NextResponse.json(
      { message: `Campaign successfully ${action}d!`, data: result.rows[0] }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Moderation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}