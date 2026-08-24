"use client";

import { useState } from "react";
import Link from "next/link";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
type Campaign = {
  id: number;
  company_name: string;
  title: string;
  description: string;
  image_url: string;
  destination_url: string;
  approval_status: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  cta_text?: string;
  billing_type?: string;
  cpc_rate?: string | number;
  cpm_rate?: string | number;
  total_budget?: string | number;
  spent_amount?: string | number;
  user_id?: number;
};

type EventMap = Record<number, { serve: number; view: number; click: number }>;
type TimelineMap = Record<number, Array<{ date: string; serve: number; view: number; click: number }>>;

export default function DashboardTable({ campaigns, eventMap, timelineMap, currentUserId }: { campaigns: Campaign[], eventMap: EventMap, timelineMap: TimelineMap, currentUserId?: number }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const now = new Date();

  const toggleRow = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900">Your Campaign Placements</h2>
        <p className="text-xs text-gray-500 mt-0.5">Manage and review all your submitted ads.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4 w-[18%]">Company</th>
              <th className="px-6 py-4 w-[24%]">Campaign Title</th>
              <th className="px-6 py-4 w-[20%]">Duration</th>
              <th className="px-6 py-4 w-[13%]">Approval</th>
              <th className="px-6 py-4 w-[10%]">Status</th>
              <th className="px-6 py-4 w-[15%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((ad) => {
              const startDate = new Date(ad.start_date);
              const endDate = new Date(ad.end_date);
              const isTimeActive = now >= startDate && now <= endDate;
              const isExhausted = Number(ad.spent_amount || 0) >= Number(ad.total_budget || 0);
              const isActive = ad.is_active && isTimeActive && !isExhausted;

              const stats = eventMap[ad.id] || { serve: 0, view: 0, click: 0 };
              const ctr = stats.view > 0 ? ((stats.click / stats.view) * 100).toFixed(2) + "%" : "0.00%";

              return (
                <React.Fragment key={ad.id}>
                  <tr className={`hover:bg-gray-50/70 transition-all duration-200 ${expandedId === ad.id ? "bg-blue-50/30" : ""}`}>
                    <td className="px-6 py-4 align-middle">
                      <div className="font-bold text-gray-900 text-sm tracking-tight">{ad.company_name}</div>
                    </td>
                    <td className="px-6 py-4 align-middle font-medium text-gray-700 text-sm truncate max-w-[220px]">
                      {ad.title}
                    </td>
                    <td className="px-6 py-4 align-middle text-xs font-semibold text-gray-650">
                      <div className="text-gray-950 font-medium">
                        {(() => {
                          const d = new Date(ad.start_date);
                          return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                        })()}
                      </div>
                      <div className="text-gray-400 font-normal mt-0.5">
                        to{" "}
                        {(() => {
                          const d = new Date(ad.end_date);
                          return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-sm ${
                        ad.approval_status === 'approved' ? 'bg-green-50 text-green-700 border-green-200/80' : 
                        ad.approval_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200/80' : 
                        'bg-yellow-50 text-yellow-700 border-yellow-200/80'
                      }`}>
                        {ad.approval_status.charAt(0).toUpperCase() + ad.approval_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-sm ${
                        isExhausted ? 'bg-amber-50 text-amber-700 border-amber-200/80' : 
                        isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 
                        'bg-gray-50 text-gray-500 border-gray-200/80'
                      }`}>
                        {isExhausted ? 'Exhausted' : isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => toggleRow(ad.id)}
                          className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all active:scale-95 cursor-pointer shadow-sm ${
                            expandedId === ad.id
                              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                              : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                          }`}
                        >
                          {expandedId === ad.id ? "Hide" : "Analytics"}
                        </button>
                        {(!currentUserId || ad.user_id === currentUserId) && (
                          <Link 
                            href={`/dashboard/campaigns/${ad.id}/edit`}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all active:scale-95 shadow-sm"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED ROW (ANALYTICS PREVIEW) */}
                  {expandedId === ad.id && (
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <td colSpan={6} className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
                          
                          {/* Ad Preview Card */}
                          <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-w-sm mx-auto flex flex-col">
                            {/* Header */}
                            <div className="p-4 flex items-center justify-between border-b border-gray-50">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                                  {ad.company_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-sm">{ad.company_name}</h4>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Sponsored</p>
                                </div>
                              </div>
                              <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                              </div>
                            </div>
                            
                            {/* Content */}
                            <div className="px-4 py-3">
                              <p className="text-sm text-gray-800 leading-relaxed">
                                <span className="font-bold text-gray-900">{ad.title}</span> — {ad.description}
                              </p>
                            </div>

                            {/* Media */}
                            <div className="w-full bg-gray-50 border-y border-gray-100 aspect-video relative flex items-center justify-center overflow-hidden">
                              <img src={ad.image_url} alt="Preview" className="object-cover w-full h-full" />
                            </div>

                            {/* Footer / CTA */}
                            <div className="p-4 bg-gray-50/50 flex flex-col gap-3 mt-auto">
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500 truncate pr-4">
                                  {(() => {
                                    try {
                                      return new URL(ad.destination_url).hostname;
                                    } catch {
                                      return ad.destination_url;
                                    }
                                  })()}
                                </div>
                              </div>
                              <div className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer">
                                {ad.cta_text || 'Learn More'}
                              </div>
                            </div>
                          </div>

                          {/* Analytics Cards */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Campaign Analytics</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Served */}
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Served</div>
                                <div className="text-2xl font-black text-gray-900 font-mono">{stats.serve.toLocaleString()}</div>
                              </div>
                              {/* Viewed */}
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Viewed</div>
                                <div className="text-2xl font-black text-indigo-600 font-mono">{stats.view.toLocaleString()}</div>
                              </div>
                              {/* Clicks */}
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Clicks</div>
                                <div className="text-2xl font-black text-green-600 font-mono">{stats.click.toLocaleString()}</div>
                              </div>
                              {/* CTR */}
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CTR</div>
                                <div className="text-2xl font-black text-blue-600 font-mono">{ctr}</div>
                              </div>
                            </div>

                            {/* Financials */}
                            {(ad.cpc_rate !== undefined || ad.cpm_rate !== undefined) && (
                              <div className="mt-4">
                                <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Financials</h3>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CPC Rate</div>
                                    <div className="text-lg font-black text-gray-900 font-mono">₹{Number(ad.cpc_rate || 0).toFixed(2)}</div>
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CPM Rate</div>
                                    <div className="text-lg font-black text-gray-900 font-mono">
                                      ₹{Number(ad.cpm_rate || 0).toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Spend / Budget</div>
                                    <div className="text-lg font-black text-gray-900 font-mono">
                                      <span className={Number(ad.spent_amount) >= Number(ad.total_budget) ? 'text-red-600' : 'text-green-600'}>
                                        ₹{Number(ad.spent_amount).toFixed(2)}
                                      </span>
                                      <span className="text-gray-400 text-sm font-normal"> / ₹{Number(ad.total_budget).toFixed(0)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Timeline Chart */}
                            {timelineMap[ad.id] && timelineMap[ad.id].length > 0 && (
                              <div className="mt-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Performance Timeline</div>
                                <div className="h-48 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timelineMap[ad.id]} margin={{ top: 5, right: -5, left: -20, bottom: 0 }}>
                                      <defs>
                                        <linearGradient id="colorServe" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                      <XAxis dataKey="date" tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                      
                                      <YAxis yAxisId="left" tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                      <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: '#10b981'}} axisLine={false} tickLine={false} />
                                      
                                      <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        labelStyle={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}
                                      />
                                      <Area yAxisId="left" type="monotone" dataKey="serve" name="Served" stroke="#9ca3af" fillOpacity={1} fill="url(#colorServe)" />
                                      <Area yAxisId="left" type="monotone" dataKey="view" name="Viewed" stroke="#4f46e5" fillOpacity={1} fill="url(#colorView)" />
                                      <Area yAxisId="left" type="monotone" dataKey="click" name="Clicks" stroke="#3b82f6" fillOpacity={1} fill="url(#colorClick)" />
                                      <Area yAxisId="right" type="monotone" dataKey="spend" name="Spend (₹)" stroke="#10b981" fillOpacity={1} fill="url(#colorSpend)" />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
