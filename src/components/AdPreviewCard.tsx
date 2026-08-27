"use client";

import React from "react";

export interface AdPreviewCardProps {
  companyName?: string;
  title?: string;
  description?: string;
  mediaUrl?: string;
  isVideo?: boolean;
  destinationUrl?: string;
  ctaText?: string;
  className?: string;
}

export default function AdPreviewCard({
  companyName = "Your Company Name",
  title = "Enter an eye-catching title...",
  description = "Your ad copy will appear here to persuade your target audience.",
  mediaUrl = "",
  isVideo = false,
  destinationUrl = "",
  ctaText = "Learn More",
  className = "max-w-sm mx-auto",
}: AdPreviewCardProps) {
  // Format destination hostname safely
  const formattedHostname = React.useMemo(() => {
    if (!destinationUrl) return "yourwebsite.com";
    try {
      return new URL(destinationUrl).hostname;
    } catch {
      return destinationUrl.replace(/^https?:\/\//, "").split("/")[0] || "yourwebsite.com";
    }
  }, [destinationUrl]);

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden group hover:border-blue-400 transition-all ${className}`}>
      {/* Media Banner (Image or Video) */}
      <div className="h-48 bg-linear-to-br from-gray-100 to-gray-200 w-full relative border-b border-gray-100 flex items-center justify-center overflow-hidden">
        {isVideo && mediaUrl ? (
          <video
            key={mediaUrl}
            src={mediaUrl}
            controls
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        ) : mediaUrl ? (
          <img
            src={mediaUrl}
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
            <span className="text-gray-400 text-xs font-medium">Add Image/Video URL to Preview</span>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-xs pointer-events-none">
          Sponsored
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5">
        <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 truncate">
          {companyName || "Your Company Name"}
        </div>
        <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
          {title || "Enter an eye-catching title..."}
        </h4>
        <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
          {description || "Your ad copy will appear here to persuade your target audience."}
        </p>

        {/* Footer CTA & Destination */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium truncate max-w-[140px]">
            {formattedHostname}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 group-hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors">
            {ctaText || "Learn More"} →
          </span>
        </div>
      </div>
    </div>
  );
}
