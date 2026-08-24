"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CampaignActions({ campaignId }: { campaignId: number }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/campaigns/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      alert(`Campaign successfully ${action}d!`);
      router.refresh(); // This magically tells Next.js to re-run the Server Component and update the list!
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
      <button
        onClick={() => handleAction("approve")}
        disabled={isProcessing}
        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Approve"}
      </button>
      <button
        onClick={() => handleAction("reject")}
        disabled={isProcessing}
        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Reject"}
      </button>
    </div>
  );
}