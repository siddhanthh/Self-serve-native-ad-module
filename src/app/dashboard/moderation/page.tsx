import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import ModerationTable from "./ModerationTable";

export default async function ModerationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (payload?.role !== "admin" && payload?.role !== "superadmin") {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg">
        Access Denied. You must be an administrator to view this page.
      </div>
    );
  }

  // Fetch ALL campaigns for the audit log, ordered by newest first
  const { rows: allAds } = await query(
    `SELECT c.*, cf.billing_type, cf.cpc_rate, cf.cpm_rate, cf.total_budget, cf.spent_amount 
     FROM campaigns c 
     LEFT JOIN campaign_finances cf ON c.id = cf.campaign_id 
     ORDER BY c.created_at DESC`
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Audit Log</h2>
          <p className="text-sm text-gray-500 mt-1">
            Review, approve, and track all ad campaigns across the network.
          </p>
        </div>
      </div>

      {allAds.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500">No campaigns have been submitted yet.</p>
        </div>
      ) : (
        <ModerationTable campaigns={allAds} userRole={payload.role} />
      )}
    </div>
  );
}