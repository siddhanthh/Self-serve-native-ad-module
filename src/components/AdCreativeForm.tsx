"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdPreviewCard from "@/components/AdPreviewCard";
import AdCreativeFormFields, { AdCreativeValues } from "@/components/AdCreativeFormFields";

export interface ExistingAd {
  id: number;
  campaign_id: number;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string | null;
  destination_url: string;
  cta_text?: string;
  approval_status?: string;
  is_active?: boolean;
}

export interface CampaignWithAds {
  id: number;
  company_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  billing_type?: string;
  cpc_rate?: string | number;
  cpm_rate?: string | number;
  total_budget?: string | number;
  spent_amount?: string | number;
  user_id?: number;
  ads: ExistingAd[];
}

interface AdCreativeFormProps {
  // Common
  isSubmitting?: boolean;
  
  // Create mode props
  campaigns?: CampaignWithAds[];
  initialCampaignId?: number;

  // Edit mode props
  ad?: ExistingAd;
  campaign?: CampaignWithAds;
  campaignAds?: ExistingAd[];
}

export default function AdCreativeForm({
  campaigns = [],
  initialCampaignId,
  ad,
  campaign,
  campaignAds = [],
}: AdCreativeFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(ad);

  // If in edit mode, target campaign is the passed campaign
  // If in create mode, find selected campaign from campaigns list
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | undefined>(() => {
    if (isEditMode && campaign) {
      return campaign.id;
    }
    if (initialCampaignId && campaigns.some((c) => c.id === initialCampaignId)) {
      return initialCampaignId;
    }
    return campaigns.length > 0 ? campaigns[0].id : undefined;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form values pre-populated (edit mode) or empty (create mode)
  const [adValues, setAdValues] = useState<AdCreativeValues>({
    title: ad?.title || "",
    description: ad?.description || "",
    imageUrl: ad?.image_url || "",
    videoUrl: ad?.video_url || "",
    destinationUrl: ad?.destination_url || "",
    ctaText: ad?.cta_text || "Learn More",
  });

  const activeCampaign = useMemo(() => {
    if (isEditMode && campaign) return campaign;
    return campaigns.find((c) => c.id === selectedCampaignId);
  }, [campaigns, selectedCampaignId, isEditMode, campaign]);

  // Debounced preview URL for image / video player
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string>("");
  const [previewIsVideo, setPreviewIsVideo] = useState<boolean>(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rawMediaUrl = adValues.videoUrl || adValues.imageUrl || "";
  const rawIsVideo = Boolean(adValues.videoUrl);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPreviewMediaUrl(rawMediaUrl);
      setPreviewIsVideo(rawIsVideo);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [rawMediaUrl, rawIsVideo]);

  const handleFieldChange = (key: keyof AdCreativeValues, value: string) => {
    setAdValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleMediaChange = (value: string) => {
    const isVideo = Boolean(
      value.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) ||
        value.toLowerCase().includes("video") ||
        value.toLowerCase().includes(".mp4")
    );
    if (isVideo) {
      setAdValues((prev) => ({ ...prev, videoUrl: value, imageUrl: "" }));
    } else {
      setAdValues((prev) => ({ ...prev, imageUrl: value, videoUrl: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!activeCampaign) {
      alert("Please select a target campaign for this ad.");
      return;
    }

    if (!adValues.title || !adValues.description || !adValues.destinationUrl) {
      alert("Please fill in all required fields (Title, Description, Destination URL).");
      return;
    }

    if (!adValues.imageUrl && !adValues.videoUrl) {
      alert("Please provide a valid Media URL (Image or Video).");
      return;
    }

    setIsSubmitting(true);

    try {
      const diff = new Date(activeCampaign.end_date).getTime() - new Date(activeCampaign.start_date).getTime();
      const days = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));

      let adsPayload = [];

      if (isEditMode && ad) {
        // Edit Mode: Replace the modified ad inside campaignAds list, keep its ID
        adsPayload = campaignAds.map((existingAdItem) => {
          if (existingAdItem.id === ad.id) {
            return {
              id: ad.id,
              title: adValues.title,
              description: adValues.description,
              imageUrl: adValues.imageUrl || "",
              videoUrl: adValues.videoUrl || null,
              destinationUrl: adValues.destinationUrl,
              ctaText: adValues.ctaText || "Learn More",
            };
          }
          return {
            id: existingAdItem.id,
            title: existingAdItem.title,
            description: existingAdItem.description,
            imageUrl: existingAdItem.image_url || "",
            videoUrl: existingAdItem.video_url || null,
            destinationUrl: existingAdItem.destination_url,
            ctaText: existingAdItem.cta_text || "Learn More",
          };
        });
      } else {
        // Create Mode: Map existing ads for selected campaign, and append new ad (no ID)
        const existingAdsPayload = (activeCampaign.ads || []).map((existingAdItem) => ({
          id: existingAdItem.id,
          title: existingAdItem.title,
          description: existingAdItem.description,
          imageUrl: existingAdItem.image_url || "",
          videoUrl: existingAdItem.video_url || null,
          destinationUrl: existingAdItem.destination_url,
          ctaText: existingAdItem.cta_text || "Learn More",
        }));

        const newAdPayload = {
          title: adValues.title,
          description: adValues.description,
          imageUrl: adValues.imageUrl || "",
          videoUrl: adValues.videoUrl || null,
          destinationUrl: adValues.destinationUrl,
          ctaText: adValues.ctaText || "Learn More",
        };

        adsPayload = [...existingAdsPayload, newAdPayload];
      }

      const payload = {
        id: activeCampaign.id,
        companyName: activeCampaign.company_name,
        duration: String(days),
        billingType: activeCampaign.billing_type || "CPM",
        cpcRate: Number(activeCampaign.cpc_rate) || 0,
        cpmRate: Number(activeCampaign.cpm_rate) || 0,
        totalBudget: Number(activeCampaign.total_budget) || 0,
        ads: adsPayload,
      };

      const res = await fetch("/api/campaigns/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit ad creative");
      }

      alert(
        isEditMode
          ? "Success! Your ad creative has been updated and submitted for moderator approval."
          : "Success! Your ad creative has been added to the campaign and submitted for moderation."
      );
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the user has no campaigns at all in create mode, render empty state guide
  if (!isEditMode && campaigns.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-gray-200 rounded-2xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Campaigns Found</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Ad creatives belong to a campaign container that dictates budget, timeline, and billing settings. You must create a campaign first before adding individual ads.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm active:scale-95"
          >
            Create New Campaign
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {isEditMode ? "Edit Ad Creative" : "Create Ad Creative"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEditMode
              ? "Modify the content, landing link, or media for this ad placement."
              : "Design a new image or video native ad variation for an existing campaign."}
          </p>
        </div>
        <Link
          href={isEditMode && activeCampaign ? `/dashboard/campaigns/${activeCampaign.id}/edit` : "/dashboard"}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3.5 py-2 rounded-lg transition-all shadow-xs self-start sm:self-auto"
        >
          {isEditMode ? "← Cancel and Go Back" : "← Back to Dashboard"}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Target Campaign Context Selection */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
                  Placement Context
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  {isEditMode ? "Target Campaign Details" : "Select Target Campaign"}
                </h3>
              </div>

              {!isEditMode ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Campaign <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all cursor-pointer font-medium"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name} (ID: #{c.id}) — {c.ads.length} {c.ads.length === 1 ? "Creative" : "Creatives"}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {activeCampaign && (
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">
                      {activeCampaign.company_name}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-700">
                      Campaign #{activeCampaign.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-600 pt-1 text-[11px]">
                    <div>
                      <span className="text-gray-400 block">Total Budget:</span>
                      <strong className="text-gray-900">₹{Number(activeCampaign.total_budget || 0).toLocaleString("en-IN")}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">CPC Rate:</span>
                      <strong className="text-gray-900">₹{Number(activeCampaign.cpc_rate || 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">CPM Rate:</span>
                      <strong className="text-gray-900">₹{Number(activeCampaign.cpm_rate || 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Creatives Count:</span>
                      <strong className="text-blue-600">{(activeCampaign.ads || campaignAds).length} configured</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ad Fields */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                Creative Details
              </h3>
              <AdCreativeFormFields
                values={adValues}
                onChange={handleFieldChange}
                onMediaChange={handleMediaChange}
              />
            </div>

            {/* Submit Action Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || !activeCampaign}
                className="w-full py-3.5 px-6 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all disabled:bg-blue-400 rounded-xl shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {isEditMode ? "Updating Creative..." : "Submitting for Moderation..."}
                  </>
                ) : (
                  <span>
                    {isEditMode ? "Save Creative and Submit for Re-Approval" : "Submit Ad for Moderator Approval"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Native Ad Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">
              Live Native Ad Preview
            </h3>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {previewIsVideo ? "Video Creative" : "Image Creative"}
            </span>
          </div>

          <AdPreviewCard
            companyName={activeCampaign?.company_name || "Your Company Name"}
            title={adValues.title || "Enter an eye-catching title..."}
            description={adValues.description || "Your ad copy will appear here to persuade your target audience."}
            mediaUrl={previewMediaUrl}
            isVideo={previewIsVideo}
            destinationUrl={adValues.destinationUrl}
            ctaText={adValues.ctaText || "Learn More"}
          />
        </div>
      </div>
    </div>
  );
}
