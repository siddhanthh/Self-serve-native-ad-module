"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

// Define the shape of our Postgres data
type Campaign = {
  id: number;
  user_id: number;
  company_name: string;
  title: string;
  description: string;
  image_url: string;
  destination_url: string;
  approval_status: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  cta_text?: string;
  billing_type?: string;
  cpc_rate?: string | number;
  cpm_rate?: string | number;
  total_budget?: string | number;
  spent_amount?: string | number;
};

export default function ModerationTable({ campaigns, userRole }: { campaigns: Campaign[], userRole: string }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const toggleRow = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAction = async (campaignId: number, action: "approve" | "reject" | "pause") => {
    setProcessingId(campaignId);
    try {
      const res = await fetch("/api/campaigns/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, action }),
      });

      if (!res.ok) throw new Error("Failed to update campaign");

      router.refresh(); // Automatically fetches the latest DB data
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 font-semibold">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Campaign Title</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Approval</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {campaigns.map((ad) => (
              <React.Fragment key={ad.id}>
                {/* MAIN ROW */}
                <tr className={`hover:bg-gray-50 transition-colors ${expandedId === ad.id ? "bg-blue-50/50" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{ad.company_name}</div>
                    {/* <div className="text-xs text-gray-500 mt-1">{ad.company_name}</div> */}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]">
                    {ad.title}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-950">
                    <div className="text-gray-900">
                      {(() => {
                        const d = new Date(ad.start_date);
                        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                      })()}
                    </div>
                    <div className="text-gray-500 mt-0.5">
                      to{" "}
                      {(() => {
                        const d = new Date(ad.end_date);
                        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                      ad.approval_status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                      ad.approval_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {ad.approval_status.charAt(0).toUpperCase() + ad.approval_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const now = new Date();
                      const startDate = new Date(ad.start_date);
                      const endDate = new Date(ad.end_date);
                      const isTimeActive = now >= startDate && now <= endDate;
                      const isExhausted = Number(ad.spent_amount || 0) >= Number(ad.total_budget || 0);
                      const isActive = ad.is_active && isTimeActive && !isExhausted;
                      return (
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          isExhausted ? 'bg-amber-100 text-amber-800' :
                          isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isExhausted ? 'Exhausted' : isActive ? 'Active' : 'Inactive'}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleRow(ad.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      {expandedId === ad.id ? "Close Preview" : "View Details"}
                    </button>
                  </td>
                </tr>

                {/* EXPANDED ROW (AD PREVIEW & ACTIONS) */}
                {expandedId === ad.id && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={6} className="p-6">
                      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
                        
                        {/* 1. The Ad Preview Card */}
                        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-w-sm mx-auto flex flex-col">
                          {/* Header */}
                          <div className="p-4 flex items-center justify-between border-b border-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                                {ad.company_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm">{ad.company_name}</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Sponsored</p>
                              </div>
                            </div>
                            <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="px-4 py-3">
                            <p className="text-sm text-gray-800 leading-relaxed">
                              <span className="font-bold text-gray-900">{ad.title}</span> — {ad.description}
                            </p>
                          </div>

                          {/* Media */}
                          <div className="w-full bg-gray-50 border-y border-gray-100 aspect-video relative flex items-center justify-center overflow-hidden">
                            <img src={ad.image_url} alt="Preview" className="object-cover w-full h-full" />
                          </div>

                          {/* Footer / CTA */}
                          <div className="p-4 bg-gray-50/50 flex flex-col gap-3 mt-auto">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500 truncate pr-4">
                                {(() => {
                                  try {
                                    return new URL(ad.destination_url).hostname;
                                  } catch {
                                    return ad.destination_url;
                                  }
                                })()}
                              </div>
                            </div>
                            <div className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer">
                              {ad.cta_text || 'Learn More'}
                            </div>
                          </div>
                        </div>

                        {/* 2. Superadmin Controls */}
                        <div className="flex-1 space-y-4">
                          <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Moderation Controls</h3>
                          
                           <div className="text-sm text-gray-600 space-y-2">
                            <p><strong>Submitted by User ID:</strong> {ad.user_id}</p>
                            <p><strong>Current Status:</strong> {ad.approval_status}</p>
                            {(ad.cpc_rate !== undefined || ad.cpm_rate !== undefined) && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-3">Financial Setup</h4>
                                <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-700">
                                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm animate-fade-in">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CPC Rate</div>
                                    <span className="font-bold text-gray-900">₹{Number(ad.cpc_rate || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm animate-fade-in">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CPM Rate</div>
                                    <span className="font-bold text-gray-900">₹{Number(ad.cpm_rate || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm col-span-2 animate-fade-in">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Spent / Budget</div>
                                    <span className="font-bold text-gray-900">₹{Number(ad.spent_amount || 0).toFixed(2)}</span>
                                    <span className="text-gray-400 text-[10px] font-normal"> / ₹{Number(ad.total_budget || 0).toFixed(0)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                           {userRole === "superadmin" ? (
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={() => handleAction(ad.id, "approve")}
                                disabled={processingId === ad.id || (ad.approval_status === 'approved' && ad.is_active === true)}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold rounded-lg transition-colors"
                              >
                                {processingId === ad.id ? "Processing..." : 
                                 ad.approval_status === 'approved' && !ad.is_active ? "Resume Campaign" : "Approve & Activate"}
                              </button>
                              
                              {ad.approval_status === 'approved' && ad.is_active ? (
                                <button
                                  onClick={() => handleAction(ad.id, "pause")}
                                  disabled={processingId === ad.id}
                                  className="px-6 py-2 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50 text-yellow-800 font-semibold rounded-lg transition-colors border border-yellow-200"
                                >
                                  Pause
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAction(ad.id, "reject")}
                                  disabled={processingId === ad.id || ad.approval_status === 'rejected'}
                                  className="px-6 py-2 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 font-semibold rounded-lg transition-colors"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 inline-block">
                              You are viewing in Admin (Read-Only) mode. Only Superadmins can approve campaigns.
                            </div>
                          )}
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}