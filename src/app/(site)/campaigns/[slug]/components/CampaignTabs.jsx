"use client";

import { useState } from "react";
import { CircleCheckIcon } from "@/components/common/SvgIcon";

const TABS = ["About", "Updates", "Donors"];

export default function CampaignTabs({ campaign }) {
  const [activeTab, setActiveTab] = useState("About");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-[14px] font-medium transition-colors cursor-pointer ${
              activeTab === tab
                ? "text-[#383838] border-b-2 border-[#383838] -mb-px"
                : "text-[#AEAEAE] hover:text-[#737373]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* About */}
      {activeTab === "About" && (
        <div className="space-y-8">
          {campaign.description && (
            <p className="text-[17px] text-[#383838] leading-relaxed">
              {campaign.description}
            </p>
          )}

          {campaign.objectives?.length > 0 && (
            <div>
              <h3 className="text-[20px] font-bold text-[#383838] mb-4">Campaign Objectives</h3>
              <ul className="flex flex-col gap-2.5">
                {campaign.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[16px] text-[#383838]">
                    {CircleCheckIcon}
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {campaign.causes?.length > 0 && (
            <div>
              <h3 className="text-[20px] font-bold text-[#383838] mb-4">Supported Causes</h3>
              <div className="flex flex-wrap gap-2">
                {campaign.causes.map((cause) => (
                  <span
                    key={cause.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
                      cause.zakatEligible
                        ? "bg-[#E6F9F0] text-[#065F46] border-[#A7F3D0]"
                        : "bg-[#F6F6F6] text-[#383838] border-[#E0E0E0]"
                    }`}
                  >
                    {cause.name}
                    {cause.zakatEligible && (
                      <span className="text-[10px] text-[#10B981] font-semibold">ZAKAT</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Updates */}
      {activeTab === "Updates" && (
        <p className="text-[16px] text-[#737373]">No updates yet.</p>
      )}

      {/* Donors */}
      {activeTab === "Donors" && (
        <p className="text-[16px] text-[#383838]">
          {campaign.donors != null
            ? `${campaign.donors.toLocaleString()} donors have contributed so far.`
            : "Donor information is not available."}
        </p>
      )}
    </div>
  );
}
