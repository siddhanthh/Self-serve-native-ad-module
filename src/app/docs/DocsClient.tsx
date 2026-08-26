"use client";

import React, { useState } from "react";
import Link from "next/link";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

function CodeBlock({ code, language = "typescript", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-gray-800 bg-gray-950 text-gray-100 overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 text-xs font-mono text-gray-400">
        <span className="flex items-center gap-2 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-gray-300">{filename || language}</span>
        </span>
        <button
          onClick={handleCopy}
          className="text-xs px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all cursor-pointer font-sans"
        >
          {copied ? "✓ Copied!" : "Copy code"}
        </button>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-gray-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DocsClient() {
  const [activeTab, setActiveTab] = useState<"react" | "vanilla">("react");

  const serveResponseExample = `[
  {
    "id": "ad_14",
    "isAd": true,
    "authorName": "SaaS Pulse Inc.",
    "advertiserLogo": "https://ui-avatars.com/api/?name=SaaS+Pulse+Inc.&background=random",
    "content": "Scale your cloud infrastructure with zero downtime. Get $200 in free credits today.",
    "images": [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
    ],
    "ctaText": "Sign Up",
    "targetUrl": "https://example.com/signup?ref=partner",
    "adId": 14,
    "campaignId": 5
  }
]`;

  const reactIntegrationCode = `// components/NativeAdCard.tsx
import React, { useEffect, useRef } from "react";

export interface NativeAd {
  id: string;
  isAd: true;
  authorName: string;
  advertiserLogo: string;
  content: string;
  images: string[];
  ctaText: string;
  targetUrl: string;
  adId: number;
  campaignId: number;
}

const AD_SERVER_URL = "https://your-ad-module-domain.com";

export function NativeAdCard({ ad }: { ad: NativeAd }) {
  const adRef = useRef<HTMLDivElement>(null);
  const viewTrackedRef = useRef(false);

  // 1. Track "serve" event on initial mount
  useEffect(() => {
    trackAdEvent(ad.campaignId, ad.adId, "serve");
  }, [ad.campaignId, ad.adId]);

  // 2. Track "view" event using IntersectionObserver (viewport impression)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !viewTrackedRef.current) {
          viewTrackedRef.current = true;
          trackAdEvent(ad.campaignId, ad.adId, "view");
        }
      },
      { threshold: 0.5 } // 50% of ad must enter viewport
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [ad.campaignId, ad.adId]);

  // 3. Track "click" event when user clicks the card or CTA
  const handleClick = () => {
    trackAdEvent(ad.campaignId, ad.adId, "click");
    window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      ref={adRef}
      onClick={handleClick}
      className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer max-w-md mx-auto my-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img
            src={ad.advertiserLogo}
            alt={ad.authorName}
            className="w-7 h-7 rounded-full"
          />
          <span className="text-xs font-bold text-gray-800">{ad.authorName}</span>
        </div>
        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">
          Sponsored
        </span>
      </div>

      {ad.images?.[0] && (
        <img
          src={ad.images[0]}
          alt={ad.authorName}
          className="w-full h-44 object-cover rounded-lg mb-3"
        />
      )}

      <p className="text-sm text-gray-700 mb-3">{ad.content}</p>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {new URL(ad.targetUrl).hostname}
        </span>
        <button className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700">
          {ad.ctaText} &rarr;
        </button>
      </div>
    </div>
  );
}

// Global Tracking Helper Function
export async function trackAdEvent(
  campaignId: number,
  adId: number,
  action: "serve" | "view" | "click"
) {
  try {
    await fetch(\`\${AD_SERVER_URL}/api/ads/track\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, adId, action }),
    });
  } catch (err) {
    console.error("Ad Tracking Error:", err);
  }
}`;

  const vanillaIntegrationCode = `<!-- 1. Fetch & Render Native Ad in Vanilla HTML/JS -->
<div id="native-ad-container"></div>

<script>
  const AD_SERVER_URL = "https://your-ad-module-domain.com";

  // Tracking Helper
  async function trackAdEvent(campaignId, adId, action) {
    try {
      await fetch(\`\${AD_SERVER_URL}/api/ads/track\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, adId, action })
      });
    } catch (e) {
      console.error("Tracking error", e);
    }
  }

  // Fetch & Inject Ad
  async function loadNativeAd() {
    try {
      const res = await fetch(\`\${AD_SERVER_URL}/api/ads/serve\`);
      const ads = await res.json();
      if (!ads || ads.length === 0) return;

      const ad = ads[0]; // Take top served variation
      const container = document.getElementById("native-ad-container");

      container.innerHTML = \`
        <div id="ad-card-\${ad.adId}" style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; max-width: 400px; font-family: sans-serif; cursor: pointer; background: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img src="\${ad.advertiserLogo}" style="width: 28px; height: 28px; border-radius: 50%;" />
              <strong>\${ad.authorName}</strong>
            </div>
            <span style="font-size: 10px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #4b5563;">Sponsored</span>
          </div>
          \${ad.images[0] ? \`<img src="\${ad.images[0]}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />\` : ''}
          <p style="font-size: 14px; color: #374151; margin-bottom: 12px;">\${ad.content}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3f4f6; padding-top: 8px;">
            <span style="font-size: 12px; color: #9ca3af;">\${new URL(ad.targetUrl).hostname}</span>
            <button style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;">
              \${ad.ctaText} &rarr;
            </button>
          </div>
        </div>
      \`;

      // 1. Track Serve
      trackAdEvent(ad.campaignId, ad.adId, "serve");

      // 2. Track Click
      const card = document.getElementById(\`ad-card-\${ad.adId}\`);
      card.addEventListener("click", () => {
        trackAdEvent(ad.campaignId, ad.adId, "click");
        window.open(ad.targetUrl, "_blank");
      });

      // 3. Track View (Intersection Observer)
      let viewed = false;
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !viewed) {
          viewed = true;
          trackAdEvent(ad.campaignId, ad.adId, "view");
        }
      }, { threshold: 0.5 });
      observer.observe(card);

    } catch (err) {
      console.error("Failed to load native ad", err);
    }
  }

  loadNativeAd();
</script>`;

  return (
    <div className="bg-gray-50 text-gray-900 font-sans antialiased selection:bg-blue-600 selection:text-white min-h-screen flex flex-col">
      {/* TOP NAVIGATION BAR (Matching Main Site) */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor"/>
                  <rect x="18" y="4" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.6"/>
                  <rect x="4" y="18" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.4"/>
                  <path d="M18 20C18 18.8954 18.8954 18 20 18H26C27.1046 18 28 18.8954 28 20V26C28 27.1046 27.1046 28 26 28H20C18.8954 28 18 27.1046 18 26V20Z" fill="currentColor"/>
                </svg>
                <span className="text-xl font-extrabold tracking-tight text-gray-900">Ad-Module</span>
              </Link>
              <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Docs
              </span>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex items-center gap-4">
              <Link href="/login?mode=signin" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link href="/login?mode=signup" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-150 shadow-sm hover:shadow active:scale-95">
                Launch Campaign
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO BANNER FOR DOCS */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
            <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-blue-600 font-semibold">Documentation</span>
            <span>/</span>
            <span className="text-gray-600">Publisher Integration Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Publisher &amp; Developer Integration
          </h1>
          <p className="text-base text-gray-600 mt-2 max-w-3xl leading-relaxed">
            Complete guide for content publishers, websites, and mobile applications to serve native ad creatives, configure CORS permissions, and report impressions and clicks with zero layout shift.
          </p>
        </div>
      </div>

      {/* MAIN DOCUMENTATION CONTENT */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT STICKY SIDEBAR */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Integration Steps
                </h3>
                <nav className="space-y-1 text-sm font-medium">
                  <a href="#overview" className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <span className="text-xs text-blue-600 font-bold">01</span>
                    <span>Architecture Overview</span>
                  </a>
                  <a href="#cors" className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <span className="text-xs text-blue-600 font-bold">02</span>
                    <span>Domain CORS Setup</span>
                  </a>
                  <a href="#serve-endpoint" className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <span className="text-xs text-blue-600 font-bold">03</span>
                    <span>Serve API (GET)</span>
                  </a>
                  <a href="#code-integration" className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <span className="text-xs text-blue-600 font-bold">04</span>
                    <span>Frontend Code</span>
                  </a>
                  <a href="#tracking-events" className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <span className="text-xs text-blue-600 font-bold">05</span>
                    <span>Event Tracking (POST)</span>
                  </a>
                  <a href="#verification" className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <span className="text-xs text-blue-600 font-bold">06</span>
                    <span>Verification &amp; Best Practices</span>
                  </a>
                </nav>
              </div>

              {/* Support Callout */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <span> Need Custom Placement?</span>
                </div>
                <p className="text-blue-700 leading-relaxed">
                  The API returns clean JSON containing author names, CTA texts, copy, and image assets. You have 100% control over design and styling.
                </p>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT PANELS */}
          <main className="lg:col-span-9 space-y-12">
            
            {/* Section 1: Overview */}
            <section id="overview" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 1</span>
                  <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Architecture &amp; Data Flow</h2>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full">
                  v2.0 Native Engine
                </span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                The Self-Serve Native Ad Module operates on a headless delivery model. Rather than injecting heavy third-party iframes that break your design or hurt Core Web Vitals, your frontend fetches lightweight JSON payloads and renders standard React components or HTML elements matching your native design.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
                  <div className="text-xs font-bold text-gray-400 uppercase">Feature 1</div>
                  <div className="text-blue-600 font-bold text-sm mt-1">1:N Creative Rotation</div>
                  <p className="text-xs text-gray-500 mt-1.5 leading-normal">
                    Campaigns serve multiple approved creative variations with distinct <code className="text-gray-800 bg-gray-200/80 px-1 rounded">adId</code> identifiers.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
                  <div className="text-xs font-bold text-gray-400 uppercase">Feature 2</div>
                  <div className="text-blue-600 font-bold text-sm mt-1">Zero Layout Shift</div>
                  <p className="text-xs text-gray-500 mt-1.5 leading-normal">
                    Ads render synchronously alongside your standard content cards without unexpected resizing or ad-blocker popups.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
                  <div className="text-xs font-bold text-gray-400 uppercase">Feature 3</div>
                  <div className="text-blue-600 font-bold text-sm mt-1">Atomic Attribution</div>
                  <p className="text-xs text-gray-500 mt-1.5 leading-normal">
                    Direct attribution links impressions, views, and clicks to advertiser budgets with transactional integrity.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: CORS */}
            <section id="cors" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 2</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Configuring Domain CORS Whitelisting</h2>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                To prevent unauthorized usage of your ad supply, our API enforces strict Cross-Origin Resource Sharing (CORS) rules. Before your frontend can make API calls, your site domain must be registered in the system.
              </p>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <span>⚠️ Whitelist Your Origin:</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Admins can whitelist your production origin (e.g. <code className="bg-amber-100 text-amber-900 font-mono px-1.5 py-0.5 rounded">https://yourcontentplatform.com</code>) or local testing origin (e.g. <code className="bg-amber-100 text-amber-900 font-mono px-1.5 py-0.5 rounded">http://localhost:5173</code>) under <strong>Dashboard &gt; Settings &gt; Allowed Origins</strong>.
                </p>
              </div>
            </section>

            {/* Section 3: Serve API */}
            <section id="serve-endpoint" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 3</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Fetching Native Ads (<code className="text-blue-600 font-mono">GET /api/ads/serve</code>)</h2>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                Make a standard HTTP GET request when mounting your feed, article sidebars, or interstitial spots. The backend returns active, approved, and budget-funded creative objects in random rotation.
              </p>

              <div className="flex items-center gap-2 text-xs font-mono bg-gray-900 text-gray-200 p-3.5 rounded-xl border border-gray-800">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">GET</span>
                <span>https://your-ad-server.com/api/ads/serve</span>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Example Response (JSON Array)</div>
                <CodeBlock code={serveResponseExample} language="json" filename="serve_response.json" />
              </div>

              {/* Data Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payload Schema Reference</div>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-3">Field</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-600">adId</td>
                        <td className="p-3 font-mono text-gray-500">number</td>
                        <td className="p-3">Specific creative variation ID. <strong className="text-gray-800">Required</strong> in tracking calls.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-600">campaignId</td>
                        <td className="p-3 font-mono text-gray-500">number</td>
                        <td className="p-3">Parent campaign container ID. <strong className="text-gray-800">Required</strong> in tracking calls.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-600">authorName</td>
                        <td className="p-3 font-mono text-gray-500">string</td>
                        <td className="p-3">Advertiser or brand company name.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-600">content</td>
                        <td className="p-3 font-mono text-gray-500">string</td>
                        <td className="p-3">Copy description of the advertisement.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-600">images</td>
                        <td className="p-3 font-mono text-gray-500">string[]</td>
                        <td className="p-3">Array of creative image URLs (16:9 / 4:3 high-res).</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-600">ctaText</td>
                        <td className="p-3 font-mono text-gray-500">string</td>
                        <td className="p-3">Call-to-action button text (e.g. &quot;Shop Now&quot;, &quot;Sign Up&quot;).</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-600">targetUrl</td>
                        <td className="p-3 font-mono text-gray-500">string</td>
                        <td className="p-3">Advertiser landing page destination URL.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 4: Frontend Code Integration */}
            <section id="code-integration" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 4</span>
                  <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Frontend Component Code</h2>
                </div>
                
                {/* Code Framework Switcher */}
                <div className="flex gap-1 p-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold self-start sm:self-auto">
                  <button
                    onClick={() => setActiveTab("react")}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      activeTab === "react"
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    React / Next.js
                  </button>
                  <button
                    onClick={() => setActiveTab("vanilla")}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      activeTab === "vanilla"
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Vanilla JS / HTML
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                Drop this component into your codebase. It handles fetching the ad payload, rendering it natively in your feed, and dispatching impression (<code className="text-blue-600 font-mono">view</code>) and click events automatically.
              </p>

              {activeTab === "react" ? (
                <CodeBlock code={reactIntegrationCode} language="tsx" filename="NativeAdCard.tsx" />
              ) : (
                <CodeBlock code={vanillaIntegrationCode} language="html" filename="index.html" />
              )}
            </section>

            {/* Section 5: Event Tracking */}
            <section id="tracking-events" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 5</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Event Tracking Pipeline (<code className="text-blue-600 font-mono">POST /api/ads/track</code>)</h2>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                The ad engine requires accurate event signaling to balance CPM (impressions) and CPC (clicks) budgets in real time. Send a POST request for each interaction lifecycle step:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span className="font-bold text-sm text-gray-900 font-mono">&quot;serve&quot;</span>
                  </div>
                  <p className="text-xs text-gray-500">Triggered once as soon as the ad payload is received and mounted in the DOM.</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="font-bold text-sm text-gray-900 font-mono">&quot;view&quot;</span>
                  </div>
                  <p className="text-xs text-gray-500">Triggered when &ge;50% of the creative enters the active viewport (Viewable Impression).</p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span className="font-bold text-sm text-gray-900 font-mono">&quot;click&quot;</span>
                  </div>
                  <p className="text-xs text-gray-500">Triggered when the reader clicks the card or the call-to-action button.</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tracking Request Payload</div>
                <CodeBlock
                  code={`// POST /api/ads/track
{
  "campaignId": 5,
  "adId": 14,
  "action": "view" // "serve" | "view" | "click"
}`}
                  language="json"
                  filename="tracking_payload.json"
                />
              </div>
            </section>

            {/* Section 6: Verification & Best Practices */}
            <section id="verification" className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 6</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-1">Verification &amp; Best Practices</h2>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200/80 items-start">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Network Inspector Verification</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Open browser DevTools (Network tab) and confirm that <code className="text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">GET /api/ads/serve</code> responds with HTTP <strong className="text-emerald-700">200 OK</strong> and returns your active creative array.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200/80 items-start">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Viewport Visibility Threshold</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Configure your <code className="text-gray-800 font-mono bg-gray-200 px-1 py-0.5 rounded">IntersectionObserver</code> threshold to <code className="text-gray-800 font-mono bg-gray-200 px-1 py-0.5 rounded">0.5</code> (&ge;50% visibility) before dispatching the <code className="text-emerald-700 font-mono">&quot;view&quot;</code> impression event to align with standard IAB viewability requirements.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200/80 items-start">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Zero Creative Fallback Handling</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      When all active campaigns reach budget limits or schedule expirations, <code className="text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">/api/ads/serve</code> returns an empty array (<code className="text-gray-800 font-mono bg-gray-200 px-1 py-0.5 rounded">[]</code>). Ensure your container collapses seamlessly with zero layout shift.
                    </p>
                  </div>
                </div>
              </div>

              {/* Concluding Action Banner */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Ready to deploy?</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Launch a new campaign or explore our developer APIs.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/"
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    &larr; Back to Home
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                  >
                    Launch Campaign &rarr;
                  </Link>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* FOOTER (Matching Main Site) */}
      <footer className="flex flex-row flex-wrap items-center justify-center w-full px-6 py-6 text-center border-t gap-y-6 gap-x-12 border-gray-200 md:justify-between bg-white mt-16">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor"/>
            <rect x="18" y="4" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.6"/>
            <rect x="4" y="18" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.4"/>
            <path d="M18 20C18 18.8954 18.8954 18 20 18H26C27.1046 18 28 18.8954 28 20V26C28 27.1046 27.1046 28 26 28H20C18.8954 28 18 27.1046 18 26V20Z" fill="currentColor"/>
          </svg>
          <p className="block text-gray-800 font-semibold text-sm">
            Ad-Module Documentation
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-y-2 gap-x-8">
          <li>
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/docs" className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
              Documentation
            </Link>
          </li>
          <li>
            <Link href="/login?mode=signin" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Sign In
            </Link>
          </li>
          <li>
            <Link href="/login?mode=signup" className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
              Launch Campaign
            </Link>
          </li>
        </ul>
      </footer>
    </div>
  );
}
