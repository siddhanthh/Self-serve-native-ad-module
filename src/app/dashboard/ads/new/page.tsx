import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdCreativeForm, { CampaignWithAds } from "@/components/AdCreativeForm";

interface PageProps {
  searchParams: Promise<{ campaignId?: string }>;
}

export default async function NewAdPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialCampaignId = params.campaignId ? parseInt(params.campaignId, 10) : undefined;

  // 1. Authenticate the User
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) redirect("/login");

  const userId = payload.userId;
  const isAdmin = payload.role === "superadmin";

  // 2. Fetch User's Campaigns (or all campaigns if superadmin)
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

  const campaignsParams = isAdmin ? [] : [userId];
  const { rows: dbCampaigns } = await query(campaignsQuery, campaignsParams);

  // 3. Fetch existing ads for these campaigns
  const campaignIds = dbCampaigns.map((c) => c.id);
  let adsMap: Record<number, any[]> = {};

  if (campaignIds.length > 0) {
    const { rows: dbAds } = await query(
      `SELECT id, campaign_id, title, description, image_url, video_url, destination_url, cta_text, approval_status, is_active 
       FROM ads 
       WHERE campaign_id IN (${campaignIds.join(",")}) 
       ORDER BY id ASC`
    );
    dbAds.forEach((ad) => {
      if (!adsMap[ad.campaign_id]) {
        adsMap[ad.campaign_id] = [];
      }
      adsMap[ad.campaign_id].push(ad);
    });
  }

  const campaigns: CampaignWithAds[] = dbCampaigns.map((c) => ({
    ...c,
    ads: adsMap[c.id] || [],
  }));

  return (
    <div className="p-2 sm:p-6">
      <AdCreativeForm
        campaigns={campaigns}
        initialCampaignId={isNaN(initialCampaignId as number) ? undefined : initialCampaignId}
      />
    </div>
  );
}
