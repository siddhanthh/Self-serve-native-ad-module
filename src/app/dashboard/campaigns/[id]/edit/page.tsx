import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditCampaignForm from "./EditCampaignForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Authenticate the User
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) redirect("/login");
  const userId = payload.userId;
  const userRole = payload.role;

  // 2. Query database for the campaign details
  const campaignRes = await query(
    `SELECT c.*, cf.billing_type, cf.cpc_rate, cf.cpm_rate, cf.total_budget, cf.spent_amount 
     FROM campaigns c 
     LEFT JOIN campaign_finances cf ON c.id = cf.campaign_id 
     WHERE c.id = $1`,
    [id]
  );

  if (campaignRes.rows.length === 0) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        Campaign not found.
      </div>
    );
  }

  const campaign = campaignRes.rows[0];

  // 3. Verify ownership (Admins cannot edit others' campaigns)
  const isAuthorized = campaign.user_id === userId;
  if (!isAuthorized) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        Access Denied. You do not own this campaign and cannot edit it.
      </div>
    );
  }

  return (
    <div className="p-6">
      <EditCampaignForm campaign={campaign} />
    </div>
  );
}
