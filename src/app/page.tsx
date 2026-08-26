import Link from 'next/link';
import { query } from '@/lib/db';

const features = [
  {
    id: 1,
    title: "Lorem Ipsum Dolor",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    icon: (
      <svg className="w-6 h-6 stroke-current fill-none" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M4 12h16M4 12l4-4m-4 4l4 4"/>
      </svg>
    )
  },
  {
    id: 2,
    title: "Consectetur Adipiscing",
    description: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit.",
    icon: (
      <svg className="w-6 h-6 stroke-current fill-none" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M12 20V10M18 20V4M6 20v-6"/>
      </svg>
    )
  },
  {
    id: 3,
    title: "Eiusmod Tempor",
    description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis.",
    icon: (
      <svg className="w-6 h-6 stroke-current fill-none" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M12 8c-3.866 0-7 1.343-7 3s3.134 3 7 3 7-1.343 7-3-3.134-3-7-3z M12 14v4M5 11v4c0 1.657 3.134 3 7 3s7-1.343 7-3v-4"/>
      </svg>
    )
  }
];

const valuePillars = [
  {
    id: "01",
    title: "Dolor Sit Amet",
    description: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas."
  },
  {
    id: "02",
    title: "Et Harum Quidem",
    description: "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae."
  },
  {
    id: "03",
    title: "Lorem Ipsum Semper",
    description: "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus  asperiores."
  },
  {
    id: "04",
    title: "Nemo Enim Ipsam",
    description: "Voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
  }
];

const faqItems = [
  {
    id: 1,
    question: "Lorem ipsum dolor sit amet?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  },
  {
    id: 2,
    question: "Duis aute irure dolor in reprehenderit?",
    answer: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    id: 3,
    question: "Sed ut perspiciatis unde omnis iste natus?",
    answer: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
  }
];

export default async function Home() {
  const { rows: activeAds } = await query(`
    SELECT a.id, a.title, a.description, a.image_url, a.destination_url, c.company_name
    FROM ads a
    JOIN campaigns c ON a.campaign_id = c.id
    LEFT JOIN campaign_finances cf ON c.id = cf.campaign_id
    WHERE a.approval_status = 'approved' 
      AND a.is_active = true 
      AND c.is_active = true
      AND CURRENT_TIMESTAMP >= c.start_date 
      AND CURRENT_TIMESTAMP <= c.end_date
      AND (cf.spent_amount < cf.total_budget OR cf.campaign_id IS NULL)
    ORDER BY a.created_at DESC
  `);

  return (
    <div className="bg-gray-50 text-gray-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2.5">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor"/>
                  <rect x="18" y="4" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.6"/>
                  <rect x="4" y="18" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.4"/>
                  <path d="M18 20C18 18.8954 18.8954 18 20 18H26C27.1046 18 28 18.8954 28 20V26C28 27.1046 27.1046 28 26 28H20C18.8954 28 18 27.1046 18 26V20Z" fill="currentColor"/>
                </svg>
                <span className="text-xl font-extrabold tracking-tight text-gray-900">Ad-Module</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Features</a>
              <a href="#value-prop" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Value</a>
              {activeAds.length > 0 && (
                <a href="#partner-offers" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Partner Offers</a>
              )}
              <Link href="/docs" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Documentation</Link>
              <a href="#faq" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">FAQ</a>
            </nav>

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

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Next-Gen Advertising Infrastructure
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-none">
                The modern engine for high-yield digital campaigns
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 max-w-2xl font-normal leading-relaxed">
                Deploy, analyze, and automate multi-channel campaigns on a single secure system. Designed exclusively for brands and companies targeting massive, predictable scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/login?mode=signup" className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 text-center">
                  Signup
                </Link>
                <a href="#features" className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all active:scale-95 text-center">
                  Features
                </a>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono">$100M+</div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Spend</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono">4.5x</div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Boost</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 font-mono">10.0M</div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Reach</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Panel (Modern Dashboard Render) */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 blur-xl opacity-70"></div>
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500 block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500 block"></span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">live_campaign_dashboard_v2</span>
                  <span className="w-4 h-4 text-gray-500">
                    <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
                  </span>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">Aggregate Conversions</span>
                      <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">+24.8% MoM</span>
                    </div>
                    <div className="h-32 w-full flex items-end gap-1.5 pt-4">
                      <div className="bg-gray-100 rounded-t h-[40%] w-full"></div>
                      <div className="bg-gray-100 rounded-t h-[55%] w-full"></div>
                      <div className="bg-gray-100 rounded-t h-[45%] w-full"></div>
                      <div className="bg-blue-200 rounded-t h-[70%] w-full"></div>
                      <div className="bg-blue-300 rounded-t h-[65%] w-full"></div>
                      <div className="bg-blue-600 rounded-t h-[88%] w-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active ROI</span>
                      <div className="text-2xl font-extrabold text-gray-900 font-mono mt-1">4.12x</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CPC Ratio</span>
                      <div className="text-2xl font-extrabold text-gray-900 font-mono mt-1">$0.14</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / BRAND LOGOS SECTION */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">
            Trusted by the best
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-60 hover:opacity-85 transition-opacity duration-300">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="h-6 w-auto fill-current" viewBox="0 0 116 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M57.5 0L115 100H0L57.5 0Z" />
              </svg>
              <span className="font-bold tracking-tight text-lg">VERCEL</span>
            </div>
            <div className="flex items-center text-gray-500 font-black text-xl tracking-tighter">
              <span className="font-serif italic text-2xl pr-0.5">S</span>TRIPE
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="h-7 w-auto fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M26.21 6.55c-.26-.14-.58-.1-.8.1L23 9H17V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v4H5.3a1 1 0 00-.97.76l-3.3 13.2a1 1 0 001.07 1.21L26.3 22c1-.04 1.7-.87 1.7-1.87v-13c0-.28-.15-.53-.4-.66l-1.4-.72z"/>
              </svg>
              <span className="font-extrabold tracking-tight text-lg">shopify</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 font-black text-xl">
              <span className="text-blue-600 font-extrabold">#</span>slack
            </div>
            <div className="flex items-center gap-2 text-gray-500 font-bold text-lg tracking-tight">
              <svg className="h-6 w-auto stroke-current fill-none" strokeWidth="2.5" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 1c-2 0-3.5 1.5-3.5 3.5 0 1 .5 2 1.3 2.7l-9.1 14.8c-.5.8-.7 1.7-.7 2.6C4 28 7.6 31 12 31c2 0 3.8-.7 5.2-1.9 1.4 1.2 3.2 1.9 5.2 1.9 4.4 0 8-3 8-6.4 0-.9-.2-1.8-.7-2.6l-9.1-14.8c.8-.7 1.3-1.7 1.3-2.7C21.5 2.5 20 1 18 1c-1 0-2 .5-2 1z"/>
              </svg>
              <span>airbnb</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mt-3">
              Lorem ipsum dolor sit amet consectetur.
            </h2>
            <p className="text-base sm:text-lg text-gray-500 mt-4 leading-relaxed">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat) => (
              <div key={feat.id} className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:border-gray-200 transition-all shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE / BENEFITS DECK SECTION */}
      <section id="value-prop" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Value</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mt-3">
              Lorem ipsum dolor sit amet
            </h2>
            <p className="text-base sm:text-lg text-gray-500 mt-4 leading-relaxed">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {valuePillars.map((pillar) => (
              <div key={pillar.id} className="flex gap-4 p-6 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <span className="font-mono text-sm font-bold">{pillar.id}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{pillar.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC AD NETWORK SECTION */}
      {activeAds.length > 0 && (
        <section id="partner-offers" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Partner Offers</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-2">Sponsored Content</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeAds.map((ad) => (
              <a 
                key={ad.id} 
                href={ad.destination_url}
                target="_blank" 
                rel="noopener noreferrer"
                className="group block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden flex flex-col h-full cursor-pointer"
              >
                {/* Image Section */}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img 
                    src={ad.image_url} 
                    alt={ad.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider shadow-sm">
                    Ad
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {ad.title}
                  </h3>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                    {ad.description}
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-400 truncate pr-4">
                      {(() => {
                        try { return new URL(ad.destination_url).hostname; }
                        catch { return "Visit Link"; }
                      })()}
                    </span>
                    <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* DEVELOPER & PUBLISHER INTEGRATION SECTION */}
      <section id="integration" className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Developer API</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mt-3">
                  Integrate native ads into your content feed in minutes
                </h2>
                <p className="text-base sm:text-lg text-gray-500 mt-4 leading-relaxed">
                  Whether you run a Next.js blog, a React feed, or a custom CMS, our headless delivery API lets you embed seamless sponsored content that perfectly matches your platform&apos;s native design.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Headless JSON API</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Total control over layout, typography, and placements with lightweight responses.</p>
                </div>
                
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Automated Attribution</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Built-in viewport impression (view) and click tracking with zero ad blockers.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <span>View Documentation</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Right Visual Window (Matching Hero Card Style) */}
            <div className="lg:col-span-6 relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 blur-xl opacity-70"></div>
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500 block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500 block"></span>
                    <span className="text-xs font-mono text-gray-400 ml-2">feed_ad_integration.ts</span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                    REST API
                  </span>
                </div>
                
                <div className="p-6 bg-gray-950 font-mono text-xs text-gray-200 space-y-3 leading-relaxed">
                  <div className="text-gray-500">// 1. Fetch live native creative variations</div>
                  <div>
                    <span className="text-purple-400 font-semibold">const</span>{" "}
                    <span className="text-blue-300">res</span> ={" "}
                    <span className="text-purple-400 font-semibold">await</span>{" "}
                    <span className="text-yellow-300">fetch</span>(
                    <span className="text-emerald-300">&quot;https://api.yourdomain.com/api/ads/serve&quot;</span>
                    );
                  </div>
                  <div>
                    <span className="text-purple-400 font-semibold">const</span> [
                    <span className="text-blue-300">ad</span>] ={" "}
                    <span className="text-purple-400 font-semibold">await</span>{" "}
                    <span className="text-blue-300">res</span>.
                    <span className="text-yellow-300">json</span>();
                  </div>

                  <div className="pt-2 text-gray-500">// 2. Log impression when 50% visible in viewport</div>
                  <div>
                    <span className="text-purple-400 font-semibold">await</span>{" "}
                    <span className="text-yellow-300">trackEvent</span>({`{`}
                  </div>
                  <div className="pl-4 text-emerald-300">
                    campaignId: <span className="text-orange-300">ad.campaignId</span>,
                  </div>
                  <div className="pl-4 text-emerald-300">
                    adId: <span className="text-orange-300">ad.adId</span>,
                  </div>
                  <div className="pl-4 text-emerald-300">
                    action: <span className="text-amber-200">&quot;view&quot;</span>
                  </div>
                  <div>{`}`});</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* COLLAPSIBLE FAQ SECTION */}
      <section id="faq" className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">FAQ</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mt-3">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <details key={item.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="w-full p-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer select-none">
                  <span className="text-base font-semibold text-gray-900">{item.question}</span>
                  <span className="text-gray-400 font-bold text-xl group-open:hidden">+</span>
                  <span className="text-gray-400 font-bold text-xl hidden group-open:block">−</span>
                </summary>
                <div className="border-t border-gray-100 p-5 text-sm text-gray-500 bg-gray-50/50 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA ACCORDION BANNER */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 blur-3xl opacity-30"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Lorem ipsum dolor sit amet
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto font-normal">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login?mode=signup" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-all shadow-md hover:shadow-lg active:scale-95">
              Sign up
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-row flex-wrap items-center justify-center w-full px-6 py-6 text-center border-t gap-y-6 gap-x-12 border-gray-200 md:justify-between bg-white">
        <p className="block text-gray-800 font-semibold text-sm">
          Ad-Module
        </p>
        <ul className="flex flex-wrap items-center gap-y-2 gap-x-8">
          <li>
            <Link href="/docs" className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
              Documentation
            </Link>
          </li>
          <li>
            <a href="#" className="text-gray-600 hover:text-gray-900 focus:text-gray-900 text-sm transition-colors">
              About Us
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-600 hover:text-gray-900 focus:text-gray-900 text-sm transition-colors">
              License
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-600 hover:text-gray-900 focus:text-gray-900 text-sm transition-colors">
              Contribute
            </a>
          </li>
          <li>
            <a href="#" className="text-gray-600 hover:text-gray-900 focus:text-gray-900 text-sm transition-colors">
              Contact Us
            </a>
          </li>
        </ul>
      </footer>

    </div>
  );
}
