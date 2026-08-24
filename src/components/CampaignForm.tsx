"use client";

import { useState } from "react";
import Link from "next/link";

export interface CampaignData {
  companyName: string;
  title: string;
  description: string;
  imageUrl: string;
  destinationUrl: string;
  duration: string;
  ctaText: string;
  billingType: string;
  cpcRate: number;
  cpmRate: number;
  totalBudget: number;
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
  // Local form states, prefilled with initialData if editing
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [destinationUrl, setDestinationUrl] = useState(initialData?.destinationUrl || "");
  const [ctaText, setCtaText] = useState(initialData?.ctaText || "Learn More");
  const [duration, setDuration] = useState(initialData?.duration || "7");
  const [cpcRate, setCpcRate] = useState<string>(String(initialData?.cpcRate !== undefined ? initialData.cpcRate : 1.50));
  const [cpmRate, setCpmRate] = useState<string>(String(initialData?.cpmRate !== undefined ? initialData.cpmRate : 10.00));
  const [totalBudget, setTotalBudget] = useState<string>(String(initialData?.totalBudget !== undefined ? initialData.totalBudget : 1000.00));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      companyName,
      title,
      description,
      imageUrl,
      destinationUrl,
      duration,
      ctaText,
      billingType: 'BOTH',
      cpcRate: parseFloat(cpcRate) || 0,
      cpmRate: parseFloat(cpmRate) || 0,
      totalBudget: parseFloat(totalBudget) || 0,
    });
  };

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
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Campaign Title</label>
              <input
                type="text"
                required
                maxLength={50}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer SaaS Discount"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Description</label>
              <textarea
                required
                rows={4}
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your offer..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Destination URL (Click Link)</label>
              <input
                type="url"
                required
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                placeholder="https://yourwebsite.com/offer"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Call To Action (CTA) Button Text</label>
              <select
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
              >
                <option value="Learn More">Learn More</option>
                <option value="Sign Up">Sign Up</option>
                <option value="Book Now">Book Now</option>
                <option value="Shop Now">Shop Now</option>
                <option value="Download">Download</option>
                <option value="Apply Now">Apply Now</option>
              </select>
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

            <div className="border-t border-gray-150 pt-5 space-y-5">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Financial Setup</h3>
              
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-400 rounded-lg shadow-sm"
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
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Live Preview</h3>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden group cursor-pointer hover:border-blue-300 transition-all max-w-sm mx-auto">
            <div className="h-48 bg-gray-100 w-full relative border-b border-gray-100 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="Ad Preview" className="object-contain h-full max-w-full" />
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
                {title || "Your Campaign Title"}
              </h4>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                {description || "Your ad description will appear here. It gives users a brief overview of what you are offering."}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium truncate pr-4">
                  {destinationUrl ? (
                    (() => {
                      try { return new URL(destinationUrl).hostname; }
                      catch { return "Invalid URL"; }
                    })()
                  ) : "destination.com"}
                </span>
                <span className="text-blue-600 text-sm font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  {ctaText} →
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 max-w-sm mx-auto">
            <strong>Duration Note:</strong> If approved, this ad will run for exactly {duration} days before automatically expiring.
          </div>
        </div>
      </div>
    </div>
  );
}
