"use client";

import { CircleCheckIcon } from "@/components/common/SvgIcon";
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
            className={`pb-2.5 text-[14px] font-medium transition-colors cursor-pointer ${
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
          <p className="text-[18px] text-[#383838]">
            {campaign.description}
          </p>
          {campaign.objectives?.length > 0 && (
            <div>
              <h3 className="text-[20px] font-bold text-[#383838] mt-[30px]">
                Campaign Objectives
              </h3>
              <ul className="flex flex-col mt-4 gap-2.5">
                {campaign.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[16px] font-normal text-[#383838]">
                    {CircleCheckIcon}
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === "Updates" && (
        <div className="text-[16px] text-[#383838]">
          <p className="mb-4">No updates yet.</p>
        </div>
      )}

      {activeTab === "Donors" && (
        <div className="text-[16px] text-[#383838]">
          <p className="mb-4">{campaign.donors.toLocaleString()} donors have contributed so far.</p>
        </div>
      )}
    </div>
  );
}
export default CampaignTabs;