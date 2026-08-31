"use client";

import { useState } from "react";
import Link from "next/link";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AdPreviewCard from "@/components/AdPreviewCard";

type Ad = {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string | null;
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

type EventMap = Record<
  number,
  {
    serve: number;
    view: number;
    click: number;
    videoStart?: number;
    videoQ1?: number;
    videoQ2?: number;
    videoQ3?: number;
    videoComplete?: number;
  }
>;
type TimelineMap = Record<number, Array<{ date: string; serve: number; view: number; click: number; spend: number }>>;

export default function DashboardTable({
  campaigns,
  eventMap,
  timelineMap,
  currentUserId,
  currentPage = 1,
  totalPages = 1,
}: {
  campaigns: Campaign[];
  eventMap: EventMap;
  timelineMap: TimelineMap;
  currentUserId?: number;
  currentPage?: number;
  totalPages?: number;
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
                            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                              <h3 className="font-semibold text-gray-900">Ad Creatives</h3>
                              {(!currentUserId || campaign.user_id === currentUserId) && (
                                <Link
                                  href={`/dashboard/ads/new?campaignId=${campaign.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all shadow-2xs"
                                >
                                  + Add Creative
                                </Link>
                              )}
                            </div>
                            
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
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border shadow-sm ${
                                          ad.approval_status === 'approved' ? 'bg-green-50 text-green-800 border-green-300' :
                                          ad.approval_status === 'rejected' ? 'bg-red-50 text-red-800 border-red-300' :
                                          'bg-yellow-50 text-yellow-800 border-yellow-300'
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
                                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase border cursor-pointer transition-colors ${
                                            ad.approval_status !== 'approved'
                                              ? "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                                              : ad.is_active
                                                ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                                                : "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-250"
                                          }`}
                                        >
                                          {ad.approval_status !== 'approved' 
                                            ? "Inactive" 
                                            : ad.is_active 
                                              ? "Serving" 
                                              : "Paused"}
                                        </button>
                                      </td>
                                      <td className="px-4 py-3 text-right flex items-center justify-end gap-3.5 font-bold">
                                        {(!currentUserId || campaign.user_id === currentUserId) && (
                                          <Link
                                            href={`/dashboard/ads/${ad.id}/edit`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-xs text-blue-600 hover:text-blue-700"
                                          >
                                            Edit
                                          </Link>
                                        )}
                                        <span className="text-blue-600 text-xs">Select</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Render Preview Card using reusable component */}
                            {currentPreviewAd && (
                              <AdPreviewCard
                                companyName={campaign.company_name}
                                title={currentPreviewAd.title}
                                description={currentPreviewAd.description}
                                mediaUrl={currentPreviewAd.video_url || currentPreviewAd.image_url}
                                isVideo={Boolean(currentPreviewAd.video_url)}
                                destinationUrl={currentPreviewAd.destination_url}
                                ctaText={currentPreviewAd.cta_text}
                              />
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

                            {/* Video Engagement Metrics if currently previewed ad is a video */}
                            {currentPreviewAd?.video_url && (
                              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Video Engagement</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Video Starts</div>
                                    <div className="text-xl font-black text-gray-900 font-mono">{(stats.videoStart || 0).toLocaleString('en-IN')}</div>
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Completions</div>
                                    <div className="text-xl font-black text-green-600 font-mono">{(stats.videoComplete || 0).toLocaleString('en-IN')}</div>
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Completion Rate</div>
                                    <div className="text-xl font-black text-blue-600 font-mono">
                                      {stats.videoStart && stats.videoStart > 0 
                                        ? (((stats.videoComplete || 0) / stats.videoStart) * 100).toFixed(1) + "%" 
                                        : "0.0%"}
                                    </div>
                                  </div>
                                  <div className="bg-white p-4 rounded-xl border border-gray-205 shadow-sm">
                                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Progression Quartiles</div>
                                    <div className="text-[11px] font-medium text-gray-600 space-y-1">
                                      <div className="flex justify-between"><span>25% View:</span> <strong className="font-mono">{stats.videoQ1 || 0}</strong></div>
                                      <div className="flex justify-between"><span>50% View:</span> <strong className="font-mono">{stats.videoQ2 || 0}</strong></div>
                                      <div className="flex justify-between"><span>75% View:</span> <strong className="font-mono">{stats.videoQ3 || 0}</strong></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50/50">
          <div className="flex flex-1 justify-between sm:hidden">
            <Link
              href={`/dashboard?page=${currentPage - 1}`}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors ${
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/dashboard?page=${currentPage + 1}`}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors ${
                currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Next
            </Link>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Showing page <strong className="font-semibold text-gray-900">{currentPage}</strong> of{" "}
                <strong className="font-semibold text-gray-900">{totalPages}</strong>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                <Link
                  href={`/dashboard?page=${currentPage - 1}`}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    currentPage <= 1 ? "pointer-events-none opacity-40 bg-gray-50" : ""
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  ←
                </Link>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;
                  const isCurrent = pageNumber === currentPage;
                  return (
                    <Link
                      key={pageNumber}
                      href={`/dashboard?page=${pageNumber}`}
                      className={`relative inline-flex items-center px-3 py-2 text-xs font-bold ring-1 ring-inset ring-gray-300 transition-all ${
                        isCurrent
                          ? "z-10 bg-blue-600 text-white ring-blue-600"
                          : "text-gray-950 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  );
                })}
                <Link
                  href={`/dashboard?page=${currentPage + 1}`}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    currentPage >= totalPages ? "pointer-events-none opacity-40 bg-gray-50" : ""
                  }`}
                >
                  <span className="sr-only">Next</span>
                  →
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
