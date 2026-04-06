import CampaignCard from "@/components/common/CampaignCard";
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
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white m-0">
              Featured Campaigns
            </h2>
          </div>
          <Link
            href="/campaigns"
            className="shrink-0 px-5 py-2.5 border border-white/10 text-white/70 text-sm font-medium rounded-lg hover:text-white hover:bg-white/5 transition-all no-underline"
          >
            View All →
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
