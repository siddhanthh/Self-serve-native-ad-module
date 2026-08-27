import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdCreativeForm from "@/components/AdCreativeForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdPage({ params }: PageProps) {
  const { id: adIdStr } = await params;
  const adId = parseInt(adIdStr, 10);

  if (isNaN(adId)) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        Invalid ad ID format.
      </div>
    );
  }

  // 1. Authenticate the User
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) redirect("/login");

  const userId = payload.userId;
  const isAdmin = payload.role === "superadmin";

  // 2. Fetch the target ad creative details
  const adRes = await query(
    `SELECT * FROM ads WHERE id = $1`,
    [adId]
  );

  if (adRes.rows.length === 0) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        Ad Creative not found.
      </div>
    );
  }

  const ad = adRes.rows[0];

  // 3. Fetch the campaign details associated with this ad
  const campaignRes = await query(
    `SELECT c.*, cf.billing_type, cf.cpc_rate, cf.cpm_rate, cf.total_budget, cf.spent_amount 
     FROM campaigns c 
     LEFT JOIN campaign_finances cf ON c.id = cf.campaign_id 
     WHERE c.id = $1`,
    [ad.campaign_id]
  );

  if (campaignRes.rows.length === 0) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        Associated campaign not found.
      </div>
    );
  }

  const campaign = campaignRes.rows[0];

  // 4. Verify Authorization (Admins can view/edit everything, advertisers only their own campaigns)
  const isAuthorized = isAdmin || campaign.user_id === userId;
  if (!isAuthorized) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        Access Denied. You do not have permission to edit this creative.
      </div>
    );
  }

  // 5. Fetch all ads of this campaign to construct update payload
  const adsRes = await query(
    `SELECT id, campaign_id, title, description, image_url, video_url, destination_url, cta_text, approval_status, is_active 
     FROM ads 
     WHERE campaign_id = $1 
     ORDER BY id ASC`,
    [ad.campaign_id]
  );
  const campaignAds = adsRes.rows;

  return (
    <div className="p-2 sm:p-6">
      <AdCreativeForm
        ad={ad}
        campaign={campaign}
        campaignAds={campaignAds}
      />
    </div>
  );
}
