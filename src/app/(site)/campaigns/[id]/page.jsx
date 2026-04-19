import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ALL_CAMPAIGNS } from "@/data/campaigns";
import CampaignTabs from "./SingleComponents/CampaignTabs";
import DonationWidget from "./SingleComponents/DonationWidget";

function getCampaign(id) {
  return ALL_CAMPAIGNS.find((c) => c.id === Number(id));
}

export async function generateStaticParams() {
  return ALL_CAMPAIGNS.map((c) => ({ id: String(c.id) }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CampaignDetailsPage({ params }) {
  const { id } = await params;
  const campaign = getCampaign(id);
  if (!campaign) notFound();

  const isEmergency = campaign.category.toLowerCase().includes("emergency");

  return (
    <main className="bg-[#F6F6F6] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-[110px] pb-16">

        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#737373] hover:text-[#EA3335] transition-colors no-underline mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Campaigns
        </Link>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT column ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">

              {/* Hero image */}
              <div className="relative h-[300px] sm:h-[340px]">
                <Image
                  src={`/images/campaign-${campaign.id}.png`}
                  alt={campaign.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />

                {/* Overlay tags */}
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  {isEmergency && (
                    <span className="flex items-center gap-1 bg-[#FFF1F1] text-[#FF3636] rounded-full px-2.5 py-1 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3636] inline-block" />
                      Emergency
                    </span>
                  )}
                  <span className="bg-[#E6F9F0] text-[#10B981] rounded-full px-2.5 py-1 text-[10px] font-semibold">
                    {campaign.tag}
                  </span>
                </div>
              </div>

              {/* Org */}
              <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                <div className="relative w-[72px] h-[24px] shrink-0">
                  <Image src="/images/organization.png" alt={campaign.org} fill className="object-contain" />
                </div>
                <span className="text-[13px] text-[#383838]">{campaign.org}</span>
              </div>

              {/* Title + meta */}
              <div className="px-5 pb-4 border-b border-gray-100">
                <h1 className="text-[22px] sm:text-[26px] font-bold text-[#383838] leading-snug mb-2">
                  {campaign.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap text-[13px] text-[#737373]">
                  <span className="flex items-center gap-1">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                    {campaign.donors.toLocaleString()} donors
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {campaign.daysLeft > 0 ? `${campaign.daysLeft} days left` : "Ended"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {campaign.region}
                  </span>
                </div>
              </div>

              {/* Tabs + content */}
              <div className="px-5 py-4">
                <CampaignTabs campaign={campaign} />
              </div>
            </div>
          </div>

          {/* ── RIGHT column — donation widget ── */}
          <div className="w-full lg:w-[340px] xl:w-[360px] shrink-0 lg:sticky lg:top-[100px]">
            <DonationWidget campaign={campaign} />
          </div>
        </div>

      </div>
    </main>
  );
}