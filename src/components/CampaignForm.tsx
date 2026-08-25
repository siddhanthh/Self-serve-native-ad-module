"use client";

import { useState } from "react";
import Link from "next/link";
import React from "react";

export interface AdCreative {
  id?: number;
  title: string;
  description: string;
  imageUrl: string;
  destinationUrl: string;
  ctaText: string;
}

export interface CampaignData {
  companyName: string;
  duration: string;
  billingType: string;
  cpcRate: number;
  cpmRate: number;
  totalBudget: number;
  ads: AdCreative[];
}

interface CampaignFormProps {
  initialData?: CampaignData;
  onSubmit: (data: CampaignData) => Promise<void>;
  submitButtonText: string;
  isSubmitting: boolean;
  titleText: string;
  subtitleText: string;
}

export default function CampaignForm({
  initialData,
  onSubmit,
  submitButtonText,
  isSubmitting,
  titleText,
  subtitleText,
}: CampaignFormProps) {
  // Campaign Container States
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [duration, setDuration] = useState(initialData?.duration || "7");
  const [cpcRate, setCpcRate] = useState<string>(String(initialData?.cpcRate !== undefined ? initialData.cpcRate : 1.50));
  const [cpmRate, setCpmRate] = useState<string>(String(initialData?.cpmRate !== undefined ? initialData.cpmRate : 10.00));
  const [totalBudget, setTotalBudget] = useState<string>(String(initialData?.totalBudget !== undefined ? initialData.totalBudget : 1000.00));

  // Multiple Ad Creatives State
  const [ads, setAds] = useState<AdCreative[]>(initialData?.ads || [
    { title: "", description: "", imageUrl: "", destinationUrl: "", ctaText: "Learn More" }
  ]);

  // Selected Ad index for Live Preview
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);

  const handleAddAd = () => {
    setAds([...ads, { title: "", description: "", imageUrl: "", destinationUrl: "", ctaText: "Learn More" }]);
    setActivePreviewIndex(ads.length);
  };

  const handleRemoveAd = (indexToRemove: number) => {
    if (ads.length <= 1) return;
    const updated = ads.filter((_, idx) => idx !== indexToRemove);
    setAds(updated);
    setActivePreviewIndex(Math.max(0, indexToRemove - 1));
  };

  const handleUpdateAd = (index: number, key: keyof AdCreative, value: string) => {
    const updated = ads.map((ad, idx) => {
      if (idx === index) {
        return { ...ad, [key]: value };
      }
      return ad;
    });
    setAds(updated);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      companyName,
      duration,
      billingType: 'BOTH',
      cpcRate: parseFloat(cpcRate) || 0,
      cpmRate: parseFloat(cpmRate) || 0,
      totalBudget: parseFloat(totalBudget) || 0,
      ads
    });
  };

  const activePreviewAd = ads[activePreviewIndex] || { title: "", description: "", imageUrl: "", destinationUrl: "", ctaText: "Learn More" };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{titleText}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitleText}</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors bg-white border border-gray-200 px-4 py-2 rounded-lg"
        >
          Cancel
        </Link>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campaign metadata section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100 pb-2">Campaign settings</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Campaign Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                >
                  <option value="3">3 Days</option>
                  <option value="7">7 Days</option>
                  <option value="14">14 Days</option>
                  <option value="30">30 Days</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CPC Rate (₹ per Click)</label>
                  <input
                    type="text"
                    required
                    value={cpcRate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setCpcRate(val);
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CPM Rate (₹ per 1,000 Views)</label>
                  <input
                    type="text"
                    required
                    value={cpmRate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setCpmRate(val);
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Campaign Budget (₹)</label>
                <input
                  type="text"
                  required
                  value={totalBudget}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setTotalBudget(val);
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Ad creatives section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Ad Creatives ({ads.length})</h3>
                <button
                  type="button"
                  onClick={handleAddAd}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg bg-blue-50/50 transition-colors cursor-pointer"
                >
                  + Add Ad Creative
                </button>
              </div>

              {ads.map((ad, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-xl border transition-all ${
                    activePreviewIndex === index ? "border-blue-500 shadow-md ring-1 ring-blue-500/20" : "border-gray-200 shadow-sm"
                  }`}
                  onClick={() => setActivePreviewIndex(index)}
                >
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase">Creative #{index + 1}</span>
                    <div className="flex items-center gap-2">
                      {ads.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAd(index);
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Ad Title</label>
                      <input
                        type="text"
                        required
                        maxLength={50}
                        value={ad.title}
                        onChange={(e) => handleUpdateAd(index, "title", e.target.value)}
                        placeholder="e.g., Summer SaaS Discount"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Ad Description</label>
                      <textarea
                        required
                        rows={3}
                        maxLength={200}
                        value={ad.description}
                        onChange={(e) => handleUpdateAd(index, "description", e.target.value)}
                        placeholder="Briefly describe your offer..."
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL</label>
                        <input
                          type="url"
                          required
                          value={ad.imageUrl}
                          onChange={(e) => handleUpdateAd(index, "imageUrl", e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Destination URL</label>
                        <input
                          type="url"
                          required
                          value={ad.destinationUrl}
                          onChange={(e) => handleUpdateAd(index, "destinationUrl", e.target.value)}
                          placeholder="https://yourwebsite.com/offer"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">CTA Text</label>
                      <select
                        value={ad.ctaText}
                        onChange={(e) => handleUpdateAd(index, "ctaText", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="Learn More">Learn More</option>
                        <option value="Sign Up">Sign Up</option>
                        <option value="Book Now">Book Now</option>
                        <option value="Shop Now">Shop Now</option>
                        <option value="Download">Download</option>
                        <option value="Apply Now">Apply Now</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-400 rounded-lg shadow-sm cursor-pointer"
            >
              {isSubmitting ? "Processing..." : submitButtonText}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Live Preview (Creative #{activePreviewIndex + 1})
            </h3>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden group cursor-pointer hover:border-blue-300 transition-all max-w-sm mx-auto">
            <div className="h-48 bg-gray-100 w-full relative border-b border-gray-100 flex items-center justify-center overflow-hidden">
              {activePreviewAd.imageUrl ? (
                <img src={activePreviewAd.imageUrl} alt="Ad Preview" className="object-contain h-full max-w-full" />
              ) : (
                <span className="text-gray-400 text-sm font-medium">Image Preview</span>
              )}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-medium uppercase tracking-wider">
                Sponsored
              </div>
            </div>

            <div className="p-5">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
                {companyName || "Your Company Name"}
              </div>
              <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {activePreviewAd.title || "Your Campaign Title"}
              </h4>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed font-sans">
                {activePreviewAd.description || "Your ad description will appear here. It gives users a brief overview of what you are offering."}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium truncate pr-4">
                  {activePreviewAd.destinationUrl ? (
                    (() => {
                      try { return new URL(activePreviewAd.destinationUrl).hostname; }
                      catch { return "Invalid URL"; }
                    })()
                  ) : "destination.com"}
                </span>
                <span className="text-blue-600 text-sm font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  {activePreviewAd.ctaText} →
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 max-w-sm mx-auto">
            <strong>Variations note:</strong> Setting up multiple creatives helps optimize conversion metrics. Impressions will be balanced across all approved ad designs.
          </div>
        </div>
      </div>
    </div>
  );
}
