"use client";

import CampaignCard from "@/components/common/CampaignCard";
import { arrowIcon } from "@/components/common/SvgIcon";
import { apiBase } from "@/utils/constants";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const HighlightCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`/api/proxy/campaigns/featured`);
        const data = await res.json();
        console.log("Fetched campaigns:", data);
        // Adjust based on your API response structure
        setCampaigns(data?.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <section className="py-16 sm:py-20 lg:px-4 xl:px-0 px-0 lg:py-[130px] bg-[#F6F6F6]" id="campaigns">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-0">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-left text-center sm:text-2xl lg:text-3xl font-bold text-[#1A1A1A] m-0">
              Featured Campaigns
            </h2>

            <p className="text-xs md:text-left text-center sm:text-sm md:text-base font-normal mt-2 sm:mt-[10px] text-[#737373]">
              Support causes that matter. Every donation makes a difference.
            </p>
          </div>

          <div className="md:text-left text-center">
            <Link
              href="/campaigns"
              className="group inline-flex items-center gap-2 bg-white text-[#383838] text-sm sm:text-base md:text-lg font-normal rounded-full px-4 sm:px-5 py-2.5 sm:py-3 transition-all duration-300 whitespace-nowrap hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0 self-start sm:self-auto"
            >
              View All Campaigns
              <span className="flex items-center transition-transform duration-300 group-hover:translate-x-1">
                {arrowIcon}
              </span>
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-3 mt-8">

          {loading ? (
            <p className="col-span-full text-center text-gray-500">
              Loading campaigns...
            </p>
          ) : campaigns.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              No campaigns found.
            </p>
          ) : (
            campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))
          )}

        </div>
      </div>
    </section>
  );
};

export default HighlightCampaigns;