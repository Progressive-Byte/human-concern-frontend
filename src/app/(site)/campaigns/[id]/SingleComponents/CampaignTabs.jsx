"use client";

import { useState } from "react";

const CampaignTabs = ({ campaign }) => {
  const [activeTab, setActiveTab] = useState("About");
  const tabs = ["About", "Updates", "Donors"];

  return (
    <div>
      <div className="flex gap-6 border-b border-gray-200 mb-5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-2.5 text-[14px] font-medium transition-colors ${
              activeTab === t
                ? "text-[#383838] border-b-2 border-[#383838] -mb-px"
                : "text-[#AEAEAE] hover:text-[#737373]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "About" && (
        <div>
          <p className="text-[14px] text-[#383838] leading-relaxed mb-5">
            {campaign.description}
          </p>
          {campaign.objectives?.length > 0 && (
            <div>
              <h3 className="text-[15px] font-bold text-[#383838] mb-3">
                Campaign Objectives
              </h3>
              <ul className="flex flex-col gap-2.5">
                {campaign.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#383838]">
                    <svg className="shrink-0 mt-0.5 text-[#10B981]" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === "Updates" && (
        <div className="text-[14px] text-[#383838]">
          <p className="mb-4">No updates yet.</p>
        </div>
      )}

      {activeTab === "Donors" && (
        <div className="text-[14px] text-[#383838]">
          <p className="mb-4">{campaign.donors.toLocaleString()} donors have contributed so far.</p>
        </div>
      )}
    </div>
  );
}
export default CampaignTabs;