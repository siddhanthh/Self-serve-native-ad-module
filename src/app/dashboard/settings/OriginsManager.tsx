"use client";

import { useState, useEffect } from 'react';
import React from 'react';

type Origin = {
  id: number;
  origin: string;
  label: string;
  is_active: boolean;
  created_at: string;
};

export default function OriginsManager() {
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [newOrigin, setNewOrigin] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchOrigins = async () => {
    try {
      const res = await fetch('/api/settings/origins');
      if (res.ok) {
        const data = await res.json();
        setOrigins(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrigins();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin.trim()) return;

    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/settings/origins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: newOrigin, label: newLabel }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add origin');
      }

      setNewOrigin('');
      setNewLabel('');
      await fetchOrigins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/settings/origins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        await fetchOrigins();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this origin?')) return;
    try {
      const res = await fetch(`/api/settings/origins?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchOrigins();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Origin Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4">Add Whitelisted Origin</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Origin URL</label>
            <input
              type="text"
              required
              placeholder="e.g., https://partner-app.com"
              value={newOrigin}
              onChange={(e) => setNewOrigin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Label / Partner Name</label>
            <input
              type="text"
              placeholder="e.g., Mobile App Feed"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:bg-blue-400 w-full sm:w-auto h-[38px] cursor-pointer"
          >
            {submitting ? 'Adding...' : 'Add Whitelist'}
          </button>
        </form>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {/* Origins List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Active Whitelist Policies</h3>
          <p className="text-xs text-gray-500 mt-1">Cross-origin sites permitted to serve and track ad impressions.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-150">
                <th className="px-6 py-3">Origin</th>
                <th className="px-6 py-3">Partner Label</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {origins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No custom origins whitelisted yet. All cross-origin serve API requests (except dev) will be blocked.
                  </td>
                </tr>
              ) : (
                origins.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-900">{item.origin}</td>
                    <td className="px-6 py-4 font-medium">{item.label || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(item.id, item.is_active)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                          item.is_active
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {item.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.origin !== 'http://localhost:3000' && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
