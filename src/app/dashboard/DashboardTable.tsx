"use client";

import { useState } from "react";
import Link from "next/link";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Ad = {
  id: number;
  title: string;
  description: string;
  image_url: string;
  destination_url: string;
  cta_text: string;
  approval_status: string;
  is_active: boolean;
};

type Campaign = {
  id: number;
  company_name: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  billing_type?: string;
  cpc_rate?: string | number;
  cpm_rate?: string | number;
  total_budget?: string | number;
  spent_amount?: string | number;
  user_id?: number;
  ads?: Ad[];
};

type EventMap = Record<number, { serve: number; view: number; click: number }>;
type TimelineMap = Record<number, Array<{ date: string; serve: number; view: number; click: number; spend: number }>>;

export default function DashboardTable({
  campaigns,
  eventMap,
  timelineMap,
  currentUserId
}: {
  campaigns: Campaign[];
  eventMap: EventMap;
  timelineMap: TimelineMap;
  currentUserId?: number;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activePreviewAd, setActivePreviewAd] = useState<Record<number, Ad>>({});
  const now = new Date();

  const toggleRow = (id: number, campaignAds: Ad[] = []) => {
    setExpandedId(expandedId === id ? null : id);
    if (campaignAds.length > 0 && !activePreviewAd[id]) {
      setActivePreviewAd(prev => ({ ...prev, [id]: campaignAds[0] }));
    }
  };

  const handleToggleAdStatus = async (adId: number, currentStatus: boolean, campaignId: number) => {
    try {
      const res = await fetch(`/api/campaigns/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId, action: currentStatus ? "pause" : "approve" }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
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
              <th className="px-6 py-4 w-[22%]">Company</th>
              <th className="px-6 py-4 w-[28%]">Ad creatives info</th>
              <th className="px-6 py-4 w-[22%]">Duration</th>
              <th className="px-6 py-4 w-[15%]">Status</th>
              <th className="px-6 py-4 w-[13%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((campaign) => {
              const startDate = new Date(campaign.start_date);
              const endDate = new Date(campaign.end_date);
              const isTimeActive = now >= startDate && now <= endDate;
              const isExhausted = Number(campaign.spent_amount || 0) >= Number(campaign.total_budget || 0);
              const isCampaignActive = campaign.is_active && isTimeActive && !isExhausted;

              const campaignAds = campaign.ads || [];
              const approvedAdsCount = campaignAds.filter(a => a && a.approval_status === 'approved' && a.is_active).length;

              const stats = eventMap[campaign.id] || { serve: 0, view: 0, click: 0 };
              const ctr = stats.view > 0 ? ((stats.click / stats.view) * 100).toFixed(2) + "%" : "0.00%";

              const currentPreviewAd = activePreviewAd[campaign.id] || campaignAds[0];

              return (
                <React.Fragment key={campaign.id}>
                  <tr className={`hover:bg-gray-50/70 transition-all duration-200 ${expandedId === campaign.id ? "bg-blue-50/30" : ""}`}>
                    <td className="px-6 py-4 align-middle">
                      <div className="font-bold text-gray-900 text-sm tracking-tight">{campaign.company_name}</div>
                    </td>
                    <td className="px-6 py-4 align-middle text-sm text-gray-700">
                      <div className="font-medium">{campaignAds.length} Creatives configured</div>
                      <div className="text-xs text-gray-400 mt-0.5">{approvedAdsCount} Active on Feed</div>
                    </td>
                    <td className="px-6 py-4 align-middle text-xs font-semibold text-gray-650">
                      <div className="text-gray-950 font-medium">
                        {(() => {
                          const d = new Date(campaign.start_date);
                          return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                        })()}
                      </div>
                      <div className="text-gray-400 font-normal mt-0.5">
                        to{" "}
                        {(() => {
                          const d = new Date(campaign.end_date);
                          return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-sm ${
                        isExhausted ? 'bg-amber-50 text-amber-700 border-amber-200/80' : 
                        isCampaignActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 
                        'bg-gray-50 text-gray-500 border-gray-200/80'
                      }`}>
                        {isExhausted ? 'Exhausted' : isCampaignActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => toggleRow(campaign.id, campaignAds)}
                          className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all active:scale-95 cursor-pointer shadow-sm ${
                            expandedId === campaign.id
                              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                              : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                          }`}
                        >
                          {expandedId === campaign.id ? "Hide" : "Analytics"}
                        </button>
                        {(!currentUserId || campaign.user_id === currentUserId) && (
                          <Link 
                            href={`/dashboard/campaigns/${campaign.id}/edit`}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all active:scale-95 shadow-sm"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED ROW (CREATIVES DETAIL AND PLATFORM TIMELINE) */}
                  {expandedId === campaign.id && (
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <td colSpan={5} className="p-6">
                        <div className="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto">
                          
                          {/* Creative Selection Panel & Preview */}
                          <div className="w-full xl:w-[48%] space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Ad Creatives</h3>
                            
                            {/* Creatives List Table */}
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-150">
                                    <th className="px-4 py-2.5">Ad Creative Title</th>
                                    <th className="px-4 py-2.5">Approval</th>
                                    <th className="px-4 py-2.5">Serving</th>
                                    <th className="px-4 py-2.5 text-right">Preview</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {campaignAds.map((ad) => (
                                    <tr 
                                      key={ad.id} 
                                      className={`hover:bg-gray-50 cursor-pointer ${currentPreviewAd?.id === ad.id ? "bg-blue-50/20" : ""}`}
                                      onClick={() => setActivePreviewAd(prev => ({ ...prev, [campaign.id]: ad }))}
                                    >
                                      <td className="px-4 py-3 font-semibold text-gray-800 truncate max-w-[200px]">{ad.title}</td>
                                      <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                          ad.approval_status === 'approved' ? 'bg-green-50 text-green-750 border-green-200' :
                                          ad.approval_status === 'rejected' ? 'bg-red-50 text-red-750 border-red-200' :
                                          'bg-yellow-50 text-yellow-750 border-yellow-200'
                                        }`}>
                                          {ad.approval_status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleAdStatus(ad.id, ad.is_active, campaign.id);
                                          }}
                                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                                            ad.is_active
                                              ? "bg-green-50 text-green-700 border-green-200"
                                              : "bg-gray-55 text-gray-500 border-gray-200"
                                          }`}
                                        >
                                          {ad.is_active ? "Active" : "Paused"}
                                        </button>
                                      </td>
                                      <td className="px-4 py-3 text-right text-blue-600 font-bold">Select</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Render Preview Card */}
                            {currentPreviewAd && (
                              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col max-w-sm mx-auto">
                                <div className="p-4 flex items-center justify-between border-b border-gray-50">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                      {(campaign.company_name || "").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-gray-900 text-xs">{campaign.company_name || ""}</h4>
                                      <p className="text-[9px] text-gray-400 uppercase tracking-wider">Sponsored</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="px-4 py-2">
                                  <p className="text-xs text-gray-800 leading-relaxed">
                                    <span className="font-bold text-gray-900">{currentPreviewAd.title}</span> — {currentPreviewAd.description}
                                  </p>
                                </div>

                                <div className="w-full bg-gray-50 border-y border-gray-100 aspect-video relative flex items-center justify-center overflow-hidden">
                                  <img src={currentPreviewAd.image_url} alt="Preview" className="object-cover w-full h-full" />
                                </div>

                                <div className="p-4 bg-gray-55 flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <div className="text-[10px] text-gray-500 truncate pr-4">
                                      {(() => {
                                        try { return new URL(currentPreviewAd.destination_url).hostname; }
                                        catch { return currentPreviewAd.destination_url; }
                                      })()}
                                    </div>
                                  </div>
                                  <div className="w-full py-2 bg-blue-600 text-white font-semibold text-xs rounded-lg flex items-center justify-center shadow-sm">
                                    {currentPreviewAd.cta_text || 'Learn More'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Analytics Cards & Timeline */}
                          <div className="w-full xl:w-[52%] space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Campaign Analytics</h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Served</div>
                                <div className="text-xl font-black text-gray-900 font-mono">{stats.serve.toLocaleString('en-IN')}</div>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Viewed</div>
                                <div className="text-xl font-black text-indigo-600 font-mono">{stats.view.toLocaleString('en-IN')}</div>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Clicks</div>
                                <div className="text-xl font-black text-green-600 font-mono">{stats.click.toLocaleString('en-IN')}</div>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">CTR</div>
                                <div className="text-xl font-black text-blue-600 font-mono">{ctr}</div>
                              </div>
                            </div>

                            {/* Financials Row */}
                            {(campaign.cpc_rate !== undefined || campaign.cpm_rate !== undefined) && (
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">CPC Rate</div>
                                    <div className="text-base font-black text-gray-900 font-mono">₹{Number(campaign.cpc_rate || 0).toFixed(2)}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">CPM Rate</div>
                                    <div className="text-base font-black text-gray-900 font-mono">₹{Number(campaign.cpm_rate || 0).toFixed(2)}</div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Spent / Budget</div>
                                    <div className="text-base font-black text-gray-900 font-mono">
                                      <span className={Number(campaign.spent_amount) >= Number(campaign.total_budget) ? 'text-red-650 font-bold' : 'text-green-650 font-bold'}>
                                        ₹{Number(campaign.spent_amount).toFixed(2)}
                                      </span>
                                      <span className="text-gray-400 text-xs font-normal"> / ₹{Number(campaign.total_budget).toFixed(0)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Timeline Chart */}
                            {timelineMap[campaign.id] && timelineMap[campaign.id].length > 0 && (
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Performance Timeline</div>
                                <div className="h-44 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timelineMap[campaign.id]} margin={{ top: 5, right: -5, left: -20, bottom: 0 }}>
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
                                      <XAxis dataKey="date" tick={{fontSize: 9, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                      <YAxis yAxisId="left" tick={{fontSize: 9, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                      <YAxis yAxisId="right" orientation="right" tick={{fontSize: 9, fill: '#10b981'}} axisLine={false} tickLine={false} />
                                      <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                                        labelStyle={{ fontSize: '9px', color: '#6b7280', marginBottom: '3px' }}
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
