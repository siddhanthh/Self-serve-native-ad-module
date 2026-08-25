import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardTable from "./DashboardTable";
import AdminOverview from "./AdminOverview";

export default async function DashboardOverview() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) redirect("/login");

  const isAdmin = payload.role === 'superadmin';

  // 1. Fetch campaigns (All for admin, only user's for advertiser)
  const campaignsQuery = isAdmin
    ? `SELECT c.*, cf.billing_type, cf.cpc_rate, cf.cpm_rate, cf.total_budget, cf.spent_amount 
       FROM campaigns c 
       LEFT JOIN campaign_finances cf ON c.id = cf.campaign_id 
       ORDER BY c.created_at DESC`
    : `SELECT c.*, cf.billing_type, cf.cpc_rate, cf.cpm_rate, cf.total_budget, cf.spent_amount 
       FROM campaigns c 
       LEFT JOIN campaign_finances cf ON c.id = cf.campaign_id 
       WHERE c.user_id = $1 
       ORDER BY c.created_at DESC`;
  const campaignsParams = isAdmin ? [] : [payload.userId];
  const { rows: dbCampaigns } = await query(campaignsQuery, campaignsParams);

  // 1b. Fetch all ads for fetched campaigns
  const campaignIds = dbCampaigns.map(c => c.id);
  let adsMap: Record<number, any[]> = {};
  if (campaignIds.length > 0) {
    const { rows: dbAds } = await query(
      `SELECT * FROM ads WHERE campaign_id IN (${campaignIds.join(',')}) ORDER BY id ASC`
    );
    dbAds.forEach(ad => {
      if (!adsMap[ad.campaign_id]) {
        adsMap[ad.campaign_id] = [];
      }
      adsMap[ad.campaign_id].push(ad);
    });
  }

  const campaigns = dbCampaigns.map(c => ({
    ...c,
    ads: adsMap[c.id] || []
  }));

  // 2. Fetch overall event counts (Platform-wide for admin, user's for advertiser)
  const overallEventsQuery = isAdmin
    ? `SELECT ce.event_type, COUNT(*)::int as event_count
       FROM campaign_events ce
       GROUP BY ce.event_type`
    : `SELECT ce.event_type, COUNT(*)::int as event_count
       FROM campaign_events ce
       JOIN campaigns c ON ce.campaign_id = c.id
       WHERE c.user_id = $1
       GROUP BY ce.event_type`;
  const overallEventsParams = isAdmin ? [] : [payload.userId];
  const { rows: overallEvents } = await query(overallEventsQuery, overallEventsParams);

  // 3. Fetch event counts per campaign
  const campaignEventsQuery = isAdmin
    ? `SELECT ce.campaign_id,
         SUM(CASE WHEN ce.event_type = 'serve' THEN 1 ELSE 0 END)::int as serve_count,
         SUM(CASE WHEN ce.event_type = 'view' THEN 1 ELSE 0 END)::int as view_count,
         SUM(CASE WHEN ce.event_type = 'click' THEN 1 ELSE 0 END)::int as click_count
       FROM campaign_events ce
       GROUP BY ce.campaign_id`
    : `SELECT ce.campaign_id,
         SUM(CASE WHEN ce.event_type = 'serve' THEN 1 ELSE 0 END)::int as serve_count,
         SUM(CASE WHEN ce.event_type = 'view' THEN 1 ELSE 0 END)::int as view_count,
         SUM(CASE WHEN ce.event_type = 'click' THEN 1 ELSE 0 END)::int as click_count
       FROM campaign_events ce
       JOIN campaigns c ON ce.campaign_id = c.id
       WHERE c.user_id = $1
       GROUP BY ce.campaign_id`;
  const campaignEventsParams = isAdmin ? [] : [payload.userId];
  const { rows: campaignEvents } = await query(campaignEventsQuery, campaignEventsParams);

  // 4. Fetch daily timeline data per campaign
  const timelineEventsQuery = isAdmin
    ? `SELECT ce.campaign_id,
         DATE(ce.created_at) as event_date,
         SUM(CASE WHEN ce.event_type = 'serve' THEN 1 ELSE 0 END)::int as serve_count,
         SUM(CASE WHEN ce.event_type = 'view' THEN 1 ELSE 0 END)::int as view_count,
         SUM(CASE WHEN ce.event_type = 'click' THEN 1 ELSE 0 END)::int as click_count
       FROM campaign_events ce
       GROUP BY ce.campaign_id, DATE(ce.created_at)
       ORDER BY DATE(ce.created_at) ASC`
    : `SELECT ce.campaign_id,
         DATE(ce.created_at) as event_date,
         SUM(CASE WHEN ce.event_type = 'serve' THEN 1 ELSE 0 END)::int as serve_count,
         SUM(CASE WHEN ce.event_type = 'view' THEN 1 ELSE 0 END)::int as view_count,
         SUM(CASE WHEN ce.event_type = 'click' THEN 1 ELSE 0 END)::int as click_count
       FROM campaign_events ce
       JOIN campaigns c ON ce.campaign_id = c.id
       WHERE c.user_id = $1
       GROUP BY ce.campaign_id, DATE(ce.created_at)
       ORDER BY DATE(ce.created_at) ASC`;
  const timelineEventsParams = isAdmin ? [] : [payload.userId];
  const { rows: timelineEvents } = await query(timelineEventsQuery, timelineEventsParams);

  // Build the overall stats map
  const overallStats = {
    serve: 0,
    view: 0,
    click: 0,
  };
  overallEvents.forEach((row) => {
    if (row.event_type in overallStats) {
      overallStats[row.event_type as "serve" | "view" | "click"] = row.event_count || 0;
    }
  });

  // Build per-campaign event metrics map
  const eventMap: Record<number, { serve: number; view: number; click: number }> = {};
  campaignEvents.forEach((row) => {
    eventMap[row.campaign_id] = {
      serve: row.serve_count || 0,
      view: row.view_count || 0,
      click: row.click_count || 0,
    };
  });

  // Build daily timeline map per campaign
  const ratesMap: Record<number, { cpc: number; cpm: number }> = {};
  campaigns.forEach((c) => {
    ratesMap[c.id] = {
      cpc: Number(c.cpc_rate || 0),
      cpm: Number(c.cpm_rate || 0),
    };
  });

  const timelineMap: Record<number, Array<{ date: string; serve: number; view: number; click: number; spend: number }>> = {};
  timelineEvents.forEach((row) => {
    if (!timelineMap[row.campaign_id]) {
      timelineMap[row.campaign_id] = [];
    }
    const d = new Date(row.event_date);
    const rates = ratesMap[row.campaign_id] || { cpc: 0, cpm: 0 };
    const serve = row.serve_count || 0;
    const view = row.view_count || 0;
    const click = row.click_count || 0;
    const spend = Number((click * rates.cpc + (view * rates.cpm / 1000)).toFixed(2));

    timelineMap[row.campaign_id].push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      serve,
      view,
      click,
      spend,
    });
  });
  const now = new Date();
  const totalCampaigns = campaigns.length;
  
  const activePlacements = campaigns.filter((c) => {
    const start = new Date(c.start_date);
    const end = new Date(c.end_date);
    const isTimeActive = now >= start && now <= end;
    const hasApprovedAds = c.ads.some((ad: any) => ad.approval_status === "approved" && ad.is_active);
    return c.is_active && isTimeActive && hasApprovedAds;
  }).length;

  const totalServed = overallStats.serve;
  const totalViews = overallStats.view;
  const totalClicks = overallStats.click;
  const overallCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) + "%" : "0.00%";

  let totalSpend = 0;
  let totalBudget = 0;
  campaigns.forEach((c) => {
    totalSpend += Number(c.spent_amount || 0);
    totalBudget += Number(c.total_budget || 0);
  });

  if (isAdmin) {
    return (
      <AdminOverview
        campaigns={campaigns}
        eventMap={eventMap}
        timelineMap={timelineMap}
        overallStats={overallStats}
        overallCTR={overallCTR}
        activePlacements={activePlacements}
        totalCampaigns={totalCampaigns}
        totalSpend={totalSpend}
        totalBudget={totalBudget}
        currentUserId={payload.userId as number}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campaign Performance Dashboard</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {activePlacements} / {totalCampaigns} Active Placements
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time metrics, approval status tracking, and active ad placements.
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 self-start sm:self-auto"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Campaign
        </Link>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Card 1: Served (Impressions) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Served (Impressions)</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tight font-mono">{totalServed.toLocaleString('en-IN')}</div>
          <p className="text-xs text-gray-500 mt-2">Times fetched by feed endpoints</p>
        </div>

        {/* Card 2: Views (Visible) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Views (Visible)</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600 tracking-tight font-mono">{totalViews.toLocaleString('en-IN')}</div>
          <p className="text-xs text-gray-500 mt-2">Times ads were rendered on screen</p>
        </div>

        {/* Card 3: Clicks */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clicks</span>
            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-green-600 tracking-tight font-mono">{totalClicks.toLocaleString('en-IN')}</div>
          <p className="text-xs text-gray-500 mt-2">User interactions & redirects</p>
        </div>

        {/* Card 4: CTR */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average CTR</span>
            <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-yellow-600 tracking-tight font-mono">{overallCTR}</div>
          <p className="text-xs text-gray-500 mt-2">Clicks / Views</p>
        </div>

        {/* Card 5: Total Ad Spend */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ad Spend / Budget</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <span className="text-xs font-bold font-sans">₹</span>
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight font-mono">
            ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-500 mt-2">Out of ₹{totalBudget.toLocaleString('en-IN')} budget</p>
        </div>
      </div>

      {/* Campaigns list section */}
      {campaigns.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 mb-4 font-medium">You haven't submitted any campaigns yet.</p>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
          >
            Launch Your First Campaign
          </Link>
        </div>
      ) : (
        <DashboardTable campaigns={campaigns} eventMap={eventMap} timelineMap={timelineMap} currentUserId={payload.userId as number} />
      )}
    </div>
  );
}