import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { clearOriginsCache } from '@/lib/cors';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (payload?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { rows } = await pool.query('SELECT * FROM allowed_origins ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch origins:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (payload?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { origin, label } = await req.json();
    if (!origin || (!origin.startsWith('http://') && !origin.startsWith('https://'))) {
      return NextResponse.json({ error: 'Invalid origin format. Must start with http:// or https://' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO allowed_origins (origin, label) VALUES ($1, $2) ON CONFLICT (origin) DO NOTHING',
      [origin.trim(), label?.trim() || '']
    );

    clearOriginsCache();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to save origin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (payload?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, isActive } = await req.json();
    await pool.query(
      'UPDATE allowed_origins SET is_active = $1 WHERE id = $2',
      [isActive, id]
    );

    clearOriginsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update origin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (payload?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing origin ID' }, { status: 400 });
    }

    await pool.query('DELETE FROM allowed_origins WHERE id = $1', [id]);

    clearOriginsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete origin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
