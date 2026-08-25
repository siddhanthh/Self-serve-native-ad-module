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
  const [ads, setAds] = useState<AdCreative[]>(initialData?.ads && initialData.ads.length > 0 ? initialData.ads : [
    { title: "", description: "", imageUrl: "", destinationUrl: "", ctaText: "Learn More" }
  ]);

  // Selected Ad index for Tab & Live Preview
  const [activeAdIndex, setActiveAdIndex] = useState<number>(0);

  const handleAddAd = () => {
    const newAds = [...ads, { title: "", description: "", imageUrl: "", destinationUrl: "", ctaText: "Learn More" }];
    setAds(newAds);
    setActiveAdIndex(newAds.length - 1);
  };

  const handleDuplicateAd = (index: number) => {
    const sourceAd = ads[index];
    const duplicated: AdCreative = {
      ...sourceAd,
      id: undefined, // Fresh creative
      title: sourceAd.title ? `${sourceAd.title} (Copy)` : "",
    };
    const newAds = [...ads, duplicated];
    setAds(newAds);
    setActiveAdIndex(newAds.length - 1);
  };

  const handleRemoveAd = (indexToRemove: number) => {
    if (ads.length <= 1) return;
    const updated = ads.filter((_, idx) => idx !== indexToRemove);
    setAds(updated);
    if (activeAdIndex >= updated.length) {
      setActiveAdIndex(updated.length - 1);
    } else if (activeAdIndex === indexToRemove && activeAdIndex > 0) {
      setActiveAdIndex(activeAdIndex - 1);
    }
  };

  const handleUpdateCurrentAd = (key: keyof AdCreative, value: string) => {
    const updated = ads.map((ad, idx) => {
      if (idx === activeAdIndex) {
        return { ...ad, [key]: value };
      }
      return ad;
    });
    setAds(updated);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate that all ads have basic requirements
    const hasIncompleteAd = ads.some((ad) => !ad.title || !ad.description || !ad.imageUrl || !ad.destinationUrl);
    if (hasIncompleteAd) {
      alert("Please ensure all ad variations have a Title, Description, Image URL, and Destination URL.");
      return;
    }

    onSubmit({
      companyName,
      duration,
      billingType: "BOTH",
      cpcRate: parseFloat(cpcRate) || 0,
      cpmRate: parseFloat(cpmRate) || 0,
      totalBudget: parseFloat(totalBudget) || 0,
      ads,
    });
  };

  const currentAd = ads[activeAdIndex] || { title: "", description: "", imageUrl: "", destinationUrl: "", ctaText: "Learn More" };

  const parsedBudget = parseFloat(totalBudget) || 0;
  const parsedDuration = parseInt(duration) || 7;
  const parsedCpc = parseFloat(cpcRate) || 1.5;
  const parsedCpm = parseFloat(cpmRate) || 10;
  const dailySpendEstimate = parsedDuration > 0 ? (parsedBudget / parsedDuration).toFixed(2) : "0.00";
  const estMaxClicks = parsedCpc > 0 ? Math.floor(parsedBudget / parsedCpc) : 0;
  const estMaxImpressions = parsedCpm > 0 ? Math.floor((parsedBudget / parsedCpm) * 1000) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{titleText}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitleText}</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-xs"
        >
          Cancel
        </Link>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Campaign Configuration */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-gray-50/80 px-6 py-3.5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                    1
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Campaign Details & Budget
                  </h3>
                </div>
                <span className="text-xs font-medium text-gray-500">Shared container for all creatives</span>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Company / Advertiser Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Campaign Duration <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="3">3 Days</option>
                      <option value="7">7 Days (Standard)</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days (Monthly)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Total Budget (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-gray-500">₹</span>
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
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        CPC Rate (₹ / Click)
                      </label>
                      <span className="text-[11px] text-gray-400">Pay per click</span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-gray-500">₹</span>
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
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        CPM Rate (₹ / 1k Views)
                      </label>
                      <span className="text-[11px] text-gray-400">Pay per 1,000 views</span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-gray-500">₹</span>
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
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Ad Creatives (1:N Tabbed Manager) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="bg-gray-50/80 px-6 py-3.5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Ad Creatives & Variations ({ads.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddAd}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 transition-all cursor-pointer shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Creative
                </button>
              </div>

              {/* Tab Selector Bar */}
              <div className="px-6 pt-4 pb-2 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {ads.map((ad, idx) => {
                    const isComplete = Boolean(ad.title && ad.description && ad.imageUrl && ad.destinationUrl);
                    const isActive = activeAdIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveAdIndex(idx)}
                        className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none shrink-0 ${
                          isActive
                            ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isComplete ? (isActive ? "bg-green-300" : "bg-green-500") : (isActive ? "bg-amber-300" : "bg-amber-400")}`} />
                        <span>Creative #{idx + 1}</span>
                        {ad.title && (
                          <span className={`max-w-[90px] truncate text-[11px] ${isActive ? "text-blue-100" : "text-gray-500"}`}>
                            ({ad.title})
                          </span>
                        )}
                        {ads.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAd(idx);
                            }}
                            className={`ml-1 p-0.5 rounded hover:bg-black/20 text-xs transition-colors ${
                              isActive ? "text-white" : "text-gray-400 hover:text-red-600"
                            }`}
                            title="Remove this variation"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Creative Editor Form */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      Editing Variation #{activeAdIndex + 1} of {ads.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDuplicateAd(activeAdIndex)}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Duplicate
                    </button>
                    {ads.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAd(activeAdIndex)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ad Headline / Title <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">{currentAd.title.length}/50</span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={currentAd.title}
                    onChange={(e) => handleUpdateCurrentAd("title", e.target.value)}
                    placeholder="e.g., Launch Your Dream Business in 5 Minutes"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ad Description <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">{currentAd.description.length}/200</span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    maxLength={200}
                    value={currentAd.description}
                    onChange={(e) => handleUpdateCurrentAd("description", e.target.value)}
                    placeholder="Briefly describe your offer, unique value proposition, or discount..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Creative Image URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={currentAd.imageUrl}
                      onChange={(e) => handleUpdateCurrentAd("imageUrl", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Destination Landing URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={currentAd.destinationUrl}
                      onChange={(e) => handleUpdateCurrentAd("destinationUrl", e.target.value)}
                      placeholder="https://yourwebsite.com/promo"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Call To Action (CTA) Button
                  </label>
                  <select
                    value={currentAd.ctaText}
                    onChange={(e) => handleUpdateCurrentAd("ctaText", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all cursor-pointer font-medium"
                  >
                    <option value="Learn More">Learn More</option>
                    <option value="Sign Up">Sign Up</option>
                    <option value="Book Now">Book Now</option>
                    <option value="Shop Now">Shop Now</option>
                    <option value="Download">Download</option>
                    <option value="Apply Now">Apply Now</option>
                    <option value="Contact Us">Contact Us</option>
                    <option value="Get Offer">Get Offer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all disabled:bg-blue-400 rounded-xl shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>{submitButtonText}</span>
                    <span className="text-blue-200 text-xs font-normal">({ads.length} {ads.length === 1 ? "Creative" : "Creatives"})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Interactive Live Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-5">
          {/* Header with Live Badge and Creative Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                Live Native Ad Preview
              </h3>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Variation {activeAdIndex + 1} of {ads.length}
            </span>
          </div>

          {/* Ad Mockup Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden group hover:border-blue-400 transition-all max-w-sm mx-auto">
            {/* Image Banner */}
            <div className="h-48 bg-linear-to-br from-gray-100 to-gray-200 w-full relative border-b border-gray-100 flex items-center justify-center overflow-hidden">
              {currentAd.imageUrl ? (
                <img
                  src={currentAd.imageUrl}
                  alt="Ad Creative"
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="text-center p-4">
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 text-xs font-medium">Add Image URL to Preview</span>
                </div>
              )}
              <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-xs">
                Sponsored
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5">
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">
                {companyName || "Your Company Name"}
              </div>
              <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                {currentAd.title || "Enter an eye-catching title..."}
              </h4>
              <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                {currentAd.description || "Your ad copy will appear here to persuade your target audience."}
              </p>

              {/* Footer CTA & Destination */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium truncate max-w-[140px]">
                  {currentAd.destinationUrl ? (
                    (() => {
                      try {
                        return new URL(currentAd.destinationUrl).hostname;
                      } catch {
                        return "invalid-url";
                      }
                    })()
                  ) : (
                    "yourwebsite.com"
                  )}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 group-hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors">
                  {currentAd.ctaText || "Learn More"} →
                </span>
              </div>
            </div>
          </div>

          {/* Campaign Budget Estimation Card */}
          <div className="bg-linear-to-br from-slate-50 to-blue-50/40 border border-blue-100/80 rounded-xl p-4 text-xs text-gray-700 space-y-3 max-w-sm mx-auto shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100/60">
              <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Budget Estimates</span>
              <span className="font-semibold text-blue-700">₹{parsedBudget.toLocaleString("en-IN")} Total</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500 block">Daily Budget:</span>
                <span className="font-bold text-gray-800">₹{Number(dailySpendEstimate).toLocaleString("en-IN")}/day</span>
              </div>
              <div>
                <span className="text-gray-500 block">Est. Max Clicks:</span>
                <span className="font-bold text-gray-800">~{estMaxClicks.toLocaleString("en-IN")} clicks</span>
              </div>
              <div>
                <span className="text-gray-500 block">Est. Impressions:</span>
                <span className="font-bold text-gray-800">~{estMaxImpressions.toLocaleString("en-IN")} views</span>
              </div>
              <div>
                <span className="text-gray-500 block">Variations Rotation:</span>
                <span className="font-bold text-blue-700">{ads.length} active {ads.length === 1 ? "creative" : "creatives"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
