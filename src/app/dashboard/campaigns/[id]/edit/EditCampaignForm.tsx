"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CampaignForm, { CampaignData } from "@/components/CampaignForm";

interface Campaign {
  id: number;
  company_name: string;
  title: string;
  description: string;
  image_url: string;
  destination_url: string;
  start_date: string;
  end_date: string;
  cta_text?: string;
  billing_type?: string;
  cpc_rate?: string | number;
  cpm_rate?: string | number;
  total_budget?: string | number;
  spent_amount?: string | number;
}

export default function EditCampaignForm({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map the initial database model structure to form structure
  const calculateDays = () => {
    const diff = new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? String(days) : "7";
  };

  const initialData: CampaignData = {
    companyName: campaign.company_name,
    title: campaign.title,
    description: campaign.description,
    imageUrl: campaign.image_url,
    destinationUrl: campaign.destination_url,
    duration: calculateDays(),
    ctaText: campaign.cta_text || "Learn More",
    billingType: campaign.billing_type || "CPM",
    cpcRate: Number(campaign.cpc_rate) || 0.00,
    cpmRate: Number(campaign.cpm_rate) || 0.00,
    totalBudget: Number(campaign.total_budget) || 0.00,
  };

  const handleSubmit = async (formData: CampaignData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/campaigns/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: campaign.id,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update campaign");
      }
      alert("Success! Your campaign has been updated and sent for moderation.");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CampaignForm
      initialData={initialData}
      onSubmit={handleSubmit}
      submitButtonText="Save and Submit for Moderation"
      isSubmitting={isSubmitting}
      titleText="Edit Campaign"
      subtitleText="Updates will require approval from a moderator."
    />
  );
}
