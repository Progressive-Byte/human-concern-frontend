import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { siteUrl, serverApiBase } from "@/utils/constants";
import CampaignTabs from "./components/CampaignTabs";
import DonationWidget from "./components/DonationWidget";

function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path}`;
}

function daysLeft(endAt) {
  if (!endAt) return null;
  const diff = Math.ceil((new Date(endAt) - Date.now()) / 86400000);
  return diff > 0 ? diff : 0;
}

export default async function CampaignPage({ params }) {
  const { slug } = await params;

  let campaign = null;

  try {
    const url = `${serverApiBase}campaigns/${slug}`;

    const res  = await fetch(url, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    console.log(`response:`, res);

    if (res.ok) {
      const json = await res.json();
      campaign   = json?.data ?? null;
    }
  } catch (error) {
    console.error("[CampaignPage] fetch error:", error);
  }

  if (!campaign) notFound();

  const thumbnailUrl = resolveImageUrl(
    campaign.media?.thumbnailPath ?? campaign.thumbnailPath
  );

  const remaining = daysLeft(campaign.endAt);

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

          {/* Left */}
          <div className="w-full lg:w-[1000px]">

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

            {/* Title */}
            <div className="pt-[30px]">
              <h1 className="text-3xl font-bold text-[#383838]">
                {campaign.name}
              </h1>

              {/* <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#383838] mt-4">

                {campaign.donors != null && (
                  console.log("Campaign donors:", campaign.donors),
                  <span>
                    {campaign.donors.toLocaleString()} donors
                  </span>
                )}

                {remaining != null && (
                  <span>{remaining} days left</span>
                )}

                {campaign.categories?.length > 0 && (
                  <span>{campaign.categories.join(", ")}</span>
                )}
              </div> */}
              <div className="flex gap-2 text-sm font-normal text-[#383838] mt-4">
                  <Image src="/images/donars.png" alt="donor" width={15} height={15} className="object-contain" />
                  <span>{campaign.donors ? campaign.donors.toLocaleString() : "0"} donors</span>
                  <Image src="/images/calander.png" alt="calander" width={15} height={15} className="object-contain" />
                  <span>{campaign.endAt ? daysLeft(campaign.endAt) : "0"} days left</span>
                  <Image src="/images/map.png" alt="map" width={15} height={15} className="object-contain" />
                  <span>Multiple Regions</span>
                </div>
            </div>

            {/* Slider */}
            {campaign.media?.sliderImages?.length > 0 && (
              <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
                {campaign.media.sliderImages.map((src, i) => (
                  <div key={i} className="relative w-[160px] h-[100px] rounded-xl overflow-hidden">
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

          {/* Right */}
          <div className="w-full lg:w-[500px] lg:sticky lg:top-24 self-start">
            <DonationWidget campaign={campaign} />
          </div>

        </div>
      </div>
    </main>
  );
}