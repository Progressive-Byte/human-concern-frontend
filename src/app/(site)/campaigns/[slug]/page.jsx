import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { siteUrl, apiBase } from "@/utils/constants";
import CampaignTabs from "./components/CampaignTabs";
import DonationWidget from "./components/DonationWidget";

// ─── Data fetching ───────────────────────────────────────────────────────────

async function getCampaign(slug) {
  const res = await fetch(`${apiBase}campaigns/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path}`;
}

function daysLeft(endAt) {
  if (!endAt) return null;
  const diff = Math.ceil((new Date(endAt) - Date.now()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CampaignPage(props) {
  const { slug } = await props.params;
  const campaign  = await getCampaign(slug);

  if (!campaign) notFound();

  const thumbnailUrl = resolveImageUrl(campaign.media?.thumbnailPath ?? campaign.thumbnailPath);
  const remaining    = daysLeft(campaign.endAt);

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-[1611px] mx-auto px-4 sm:px-6 pt-[120px] lg:pt-[180px] pb-10 lg:pb-16">

        {/* Back link */}
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-[14px] text-[#737373] hover:text-[#EA3335] transition-colors"
        >
          ← Back to Campaigns
        </Link>

        <div className="h-[1px] w-full bg-[#CCCCCC] my-7" />

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Left column ── */}
          <div className="w-full lg:w-[1000px] lg:mx-0">

            {/* Thumbnail */}
            {thumbnailUrl && (
              <div className="relative h-[300px] sm:h-[490px] rounded-3xl overflow-hidden">
                <Image
                  src={thumbnailUrl}
                  alt={campaign.name}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {campaign.zakatEligible && (
                    <span className="bg-[#E6F9F0] text-[#10B981] rounded-full px-2.5 py-1 text-xs font-medium">
                      Zakat Eligible
                    </span>
                  )}
                  {campaign.campaignType && (
                    <span className="bg-white/90 text-[#383838] rounded-full px-2.5 py-1 text-xs font-medium capitalize">
                      {campaign.campaignType}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Title + meta */}
            <div className="pt-[30px]">
              <h1 className="text-3xl font-bold text-[#383838]">{campaign.name}</h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#383838] mt-4">
                {campaign.donors != null && (
                  <span className="flex items-center gap-1.5">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M7.5 7.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 5c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#383838" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {campaign.donors.toLocaleString()} donors
                  </span>
                )}
                {remaining != null && (
                  <span className="flex items-center gap-1.5">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <circle cx="7.5" cy="7.5" r="6" stroke="#383838" strokeWidth="1.2"/>
                      <path d="M7.5 4.5V7.5L9.5 9.5" stroke="#383838" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {remaining} days left
                  </span>
                )}
                {campaign.categories?.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M2 2h4.5v4.5H2zM8.5 2H13v4.5H8.5zM2 8.5h4.5V13H2zM8.5 8.5H13V13H8.5z" stroke="#383838" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                    {campaign.categories.join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Slider images */}
            {campaign.media?.sliderImages?.length > 0 && (
              <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
                {campaign.media.sliderImages.map((src, i) => (
                  <div key={i} className="relative flex-shrink-0 w-[160px] h-[100px] rounded-xl overflow-hidden">
                    <Image
                      src={resolveImageUrl(src)}
                      alt={`${campaign.name} ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="mt-8">
              <CampaignTabs campaign={campaign} />
            </div>
          </div>

          {/* ── Right column — sticky widget ── */}
          <div className="w-full lg:w-[500px] lg:sticky lg:top-24 self-start">
            <DonationWidget campaign={campaign} />
          </div>

        </div>
      </div>
    </main>
  );
}
