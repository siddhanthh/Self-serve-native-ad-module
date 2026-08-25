import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OriginsManager from './OriginsManager';
import React from 'react';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) redirect('/login');

  const payload = await verifyToken(token);
  if (payload?.role !== 'superadmin') {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure system configurations, security, and developer options.
        </p>
      </div>
      <OriginsManager />
    </div>
  );
}
