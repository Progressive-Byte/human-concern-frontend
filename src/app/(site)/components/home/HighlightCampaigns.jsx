import CampaignCard from "@/components/common/CampaignCard";
import { arrowIcon } from "@/components/common/SvgIcon";
import Link from "next/link";
import React from "react";

const HighlightCampaigns = () => {

  const campaigns = [
    {
      id: 1,
      category: "Education",
      tag: "Active",
      title: "School Fund Campaign",
      description: "Helping children get education.",
      raised: 24500,
      goal: 40000,
      donors: 312,
      daysLeft: 18,
    },
    {
      id: 2,
      category: "Shelter",
      tag: "Completed",
      title: "Campaign Fully Funded",
      description: "This campaign reached its goal.",
      raised: 60000,
      goal: 60000,
      donors: 890,
      daysLeft: 0,
    },
    {
      id: 3,
      category: "Health",
      tag: "Active",
      title: "Medical Aid Campaign",
      description: "Providing medical aid to those in need.",
      raised: 15000,
      goal: 30000,
      donors: 120,
      daysLeft: 25,
    },
  ];

  return (
    <section className="py-[130px] bg-[#F6F6F6]" id="campaigns">
      <div className="max-w-[1410px] mx-auto px-4 sm:px-6 lg:px-2">
        <div className="flex items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1A1A1A] m-0">
              Featured Campaigns
            </h2>
              <p className="text-[11px] md:text-[16px] font-normal mt-[10px] text-[#737373]">
                Support causes that matter. Every donation makes a difference.
            </p>
          </div>
          <Link
            href="/campaigns"
            className="group inline-flex items-center gap-2 bg-white text-[#383838] text-sm md:text-lg font-normal rounded-full px-5 py-3 transition-all duration-300 whitespace-nowrap hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0"
          >
            View All Campaigns

            <span className="flex items-center transition-transform duration-300 group-hover:translate-x-1">
              {arrowIcon}
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HighlightCampaigns;
