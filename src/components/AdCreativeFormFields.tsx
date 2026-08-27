"use client";

import React from "react";

export interface AdCreativeValues {
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  destinationUrl: string;
  ctaText: string;
}

export interface AdCreativeFormFieldsProps {
  values: AdCreativeValues;
  onChange: (key: keyof AdCreativeValues, value: string) => void;
  onMediaChange: (mediaUrl: string) => void;
}

const CTA_OPTIONS = [
  "Learn More",
  "Sign Up",
  "Book Now",
  "Shop Now",
  "Download",
  "Apply Now",
  "Contact Us",
  "Get Offer",
];

export default function AdCreativeFormFields({
  values,
  onChange,
  onMediaChange,
}: AdCreativeFormFieldsProps) {
  const currentMediaUrl = values.videoUrl || values.imageUrl || "";

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Ad Headline / Title <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-gray-400">
            {values.title.length}/50
          </span>
        </div>
        <input
          type="text"
          required
          maxLength={50}
          value={values.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g., Launch Your Dream Business in 5 Minutes"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all font-medium"
        />
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Ad Description <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-gray-400">
            {values.description.length}/200
          </span>
        </div>
        <textarea
          required
          rows={3}
          maxLength={200}
          value={values.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Briefly describe your offer, unique value proposition, or discount..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all resize-none"
        />
      </div>

      {/* Media URL */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Creative Media URL <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-gray-400">
            Image or Video URL (.mp4, .webm, .jpg, .png, etc.)
          </span>
        </div>
        <input
          type="url"
          required
          value={currentMediaUrl}
          onChange={(e) => onMediaChange(e.target.value)}
          placeholder="https://example.com/media.jpg or https://example.com/video.mp4"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all font-mono text-xs"
        />
      </div>

      {/* Destination URL */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Destination Landing URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          required
          value={values.destinationUrl}
          onChange={(e) => onChange("destinationUrl", e.target.value)}
          placeholder="https://yourwebsite.com/promo"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all font-mono text-xs"
        />
      </div>

      {/* CTA Button */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Call To Action (CTA) Button
        </label>
        <select
          value={values.ctaText || "Learn More"}
          onChange={(e) => onChange("ctaText", e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all cursor-pointer font-medium"
        >
          {CTA_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
