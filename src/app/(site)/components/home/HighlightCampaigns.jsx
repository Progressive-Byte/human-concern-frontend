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
    <section className="py-20 bg-[#F8F9FA]" id="campaigns">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-emerald-600 font-semibold text-sm tracking-widest">FEATURED</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-1">Featured Campaigns</h2>
            <p className="text-gray-600 mt-2">Support causes that matter. Every donation makes a difference.</p>
          </div>

          <Link
            href="/campaigns"
            className="text-gray-700 hover:text-black font-medium flex items-center gap-2 group"
          >
            View All Campaigns
            <span className="group-hover:translate-x-1 transition">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HighlightCampaigns;
