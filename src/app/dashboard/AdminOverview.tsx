"use client";

import React from "react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardTable from "./DashboardTable";

type Campaign = {
  id: number;
  user_id: number;
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
};

interface AdminOverviewProps {
  campaigns: Campaign[];
  eventMap: Record<number, { serve: number; view: number; click: number }>;
  timelineMap: Record<number, Array<{ date: string; serve: number; view: number; click: number }>>;
  overallStats: { serve: number; view: number; click: number };
  overallCTR: string;
  activePlacements: number;
  totalCampaigns: number;
  totalSpend: number;
  totalBudget: number;
  currentUserId?: number;
}

export default function AdminOverview({
  campaigns,
  eventMap,
  timelineMap,
  overallStats,
  overallCTR,
  activePlacements,
  totalCampaigns,
  totalSpend,
  totalBudget,
  currentUserId,
}: AdminOverviewProps) {
  
  // Aggregate timeline data across all campaigns for a platform-wide chart
  const aggregatedTimeline: Record<string, { date: string; serve: number; view: number; click: number; spend: number }> = {};
  
  Object.values(timelineMap).forEach((campaignTimeline) => {
    campaignTimeline.forEach((item: any) => {
      if (!aggregatedTimeline[item.date]) {
        aggregatedTimeline[item.date] = { date: item.date, serve: 0, view: 0, click: 0, spend: 0 };
      }
      aggregatedTimeline[item.date].serve += item.serve;
      aggregatedTimeline[item.date].view += item.view;
      aggregatedTimeline[item.date].click += item.click;
      aggregatedTimeline[item.date].spend += item.spend || 0;
    });
  });

  const chartData = Object.values(aggregatedTimeline).sort((a, b) => {
    const [aMonth, aDay] = a.date.split("/").map(Number);
    const [bMonth, bDay] = b.date.split("/").map(Number);
    if (aMonth !== bMonth) return aMonth - bMonth;
    return aDay - bDay;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Platform Control</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 shadow-sm">
              Superadmin Mode
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            System-wide diagnostics, aggregate statistics, and campaign listings.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/moderation"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Go to Campaign Approval
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Campaigns */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Campaigns</span>
            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-150">
              {activePlacements} Active
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tight font-mono">
            {totalCampaigns}
          </div>
          <p className="text-xs text-gray-400 mt-2">Submitted across all accounts</p>
        </div>

        {/* Platform Served */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Platform Served</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight font-mono">
            {overallStats.serve.toLocaleString()}
          </div>
          <p className="text-xs text-gray-400 mt-2">Platform-wide total impressions</p>
        </div>

        {/* Platform Views */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Platform Views</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600 tracking-tight font-mono">
            {overallStats.view.toLocaleString()}
          </div>
          <p className="text-xs text-gray-400 mt-2">Total views logged on frontend feeds</p>
        </div>

        {/* Avg Platform CTR */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Platform CTR</span>
            <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-yellow-600 tracking-tight font-mono">
            {overallCTR}
          </div>
          <p className="text-xs text-gray-400 mt-2">Total Clicks: {overallStats.click.toLocaleString()}</p>
        </div>

        {/* Platform Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Platform Revenue</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <span className="text-xs font-bold font-sans">₹</span>
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight font-mono">
            ₹{totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-400 mt-2">Allocated Budget: ₹{totalBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* Unified Platform Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6">
            Platform Traffic & Financial Performance
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: -5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminServeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="adminViewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="adminSpendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                
                {/* Dual Y-Axes: Left for Volume, Right for Value (₹) */}
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "#10b981", fontSize: 10 }} />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  labelClassName="font-bold text-gray-900 text-xs"
                />
                
                <Area yAxisId="left" name="Served" type="monotone" dataKey="serve" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#adminServeGrad)" />
                <Area yAxisId="left" name="Viewed" type="monotone" dataKey="view" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#adminViewGrad)" />
                <Area yAxisId="right" name="Revenue (₹)" type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#adminSpendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Campaigns list section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">All Platform Campaigns</h3>
        </div>
        {campaigns.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-medium">No campaigns have been registered on the platform yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <DashboardTable campaigns={campaigns} eventMap={eventMap} timelineMap={timelineMap} currentUserId={currentUserId} />
          </div>
        )}
      </div>
    </div>
  );
}
