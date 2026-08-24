"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State to toggle between Login and Register views
  const [isRegistering, setIsRegistering] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");

  // UI / Validation state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Read URL search params to set initial mode
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signin") {
      setIsRegistering(false);
    } else if (mode === "signup") {
      setIsRegistering(true);
    }
  }, [searchParams]);

  // Real-time email validation check
  const isEmailValid = email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);



  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isRegistering) {
      if (!isEmailValid || password.trim() === "") {
        setError("Please enter a valid business email and a password.");
        setIsLoading(false);
        return;
      }
    }

    const endpoint = isRegistering ? "/api/register" : "/api/login";
    const payload = isRegistering ? { email, password, role } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (isRegistering) {
        setIsRegistering(false);
        setError("Registration successful! Please log in.");
        setPassword("");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 text-gray-900 font-sans antialiased min-h-screen flex flex-col justify-between">
      
      {/* TOP HEADER / NAV BAR */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2.5">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor"/>
                  <rect x="18" y="4" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.6"/>
                  <rect x="4" y="18" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.4"/>
                  <path d="M18 20C18 18.8954 18.8954 18 20 18H26C27.1046 18 28 18.8954 28 20V26C28 27.1046 27.1046 28 26 28H20C18.8954 28 18 27.1046 18 26V20Z" fill="currentColor"/>
                </svg>
                <span className="text-xl font-extrabold text-gray-900">Ad-Module</span>
              </Link>
            </div>
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Landing
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 gap-12 items-center">
        
        {/* LEFT PANEL: Enterprise Benefits Deck */}
        <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-8">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">Secure Advertiser Access</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Unlock high-yield programmatic distribution instantly
            </h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Create an advertiser account today to centralize your bidding operations, target optimized channels, and unlock exclusive platform benefits.
            </p>
          </div>

          <div className="space-y-6">
            {/* Benefit 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <svg className="w-5 h-5 stroke-current fill-none" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-0.5">Instant Campaign Deployment</h4>
                <p className="text-xs text-gray-500">Deploy your advertising campaigns instantly through our high-yield programmatic distribution network.</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-0.5">Unified Channel Synchronization</h4>
                <p className="text-xs text-gray-500">Synchronize creative assets, target audiences, and budget caps across Meta, Google, and TikTok simultaneously.</p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-0.5">Secure SOC-2 Account Environment</h4>
                <p className="text-xs text-gray-500">All payment flows, campaign configurations, and audience database files are encrypted and audited securely.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Center Focused Interactive Form Card */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            
            {/* Interactive Tabs Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setError(""); }}
                className={`w-1/2 py-4 text-center text-sm font-semibold border-b-2 transition-all focus:outline-none cursor-pointer ${
                  isRegistering
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setError(""); }}
                className={`w-1/2 py-4 text-center text-sm font-semibold border-b-2 transition-all focus:outline-none cursor-pointer ${
                  !isRegistering
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Sign In
              </button>
            </div>

            <div className="p-6 sm:p-8">
              
              <form onSubmit={handleAuthSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Business Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="advertiser@example.com"
                      className={`w-full px-4 py-3 border rounded-lg text-sm bg-gray-50/50 focus:bg-white transition-all outline-none text-gray-900 ${
                        email === ""
                          ? "border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                          : isEmailValid
                          ? "border-green-500 focus:ring-1 focus:ring-green-500"
                          : "border-red-500 focus:ring-1 focus:ring-red-500"
                      }`}
                    />
                    {isEmailValid && (
                      <div className="absolute right-3.5 top-3.5 text-green-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  {!isEmailValid && email !== "" && (
                    <p className="text-[11px] text-red-500 font-medium">Please enter a valid business email address.</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="******"
                      className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.882 9.882L3 3m18 18l-3-3m-3.875-1.175A10.05 10.05 0 0012 5c-4.478 0-8.268 2.943-9.543 7a10.025 10.025 0 002.24 4.054m11.12-1.134a3 3 0 11-4.243-4.243"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>

                </div>

                {/* Select Role Dropdown (Register Mode Only) */}
                {isRegistering && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Select Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none text-gray-900"
                    >
                      <option value="advertiser">Advertiser</option>
                      <option value="superadmin">Super admin</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                {/* Error/Success Messages */}
                {error && (
                  <div className={`text-sm font-medium ${error.includes("successful") ? "text-green-600" : "text-red-600"}`}>
                    {error}
                  </div>
                )}

                {/* Action CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95 focus:outline-none disabled:bg-blue-400 cursor-pointer"
                >
                  {isLoading
                    ? "Processing..."
                    : isRegistering
                    ? "Register & Request Dashboard"
                    : "Sign In to Ad-Module"}
                </button>
              </form>

            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <span>&copy; 2026 Ad-Module Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gray-600 transition-colors">Attribution Terms</Link>
            <Link href="#" className="hover:text-gray-600 transition-colors">Privacy Audits</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}