import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { siteUrl, serverApiBase } from "@/utils/constants";
import CampaignTabs from "./components/CampaignTabs";
import DonationWidget from "./components/DonationWidget";
import CampaignGallery from "./components/CampaignGallery";
import UnavailablePage from "@/components/campaign/UnavailablePage";

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
  // null = form is servable (or a transient error): fall through to the normal page / 404.
  // {} = form is not published, or the slug is unknown: render the unavailable page.
  let unavailable = null;

  try {
    const url = `${serverApiBase}campaigns/${slug}`;

    const res  = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const json = await res.json().catch(() => null);

    if (res.ok) {
      campaign = json?.data ?? null;
    } else {
      const code = json?.error?.code;
      if (code === "FORM_UNAVAILABLE") {
        unavailable = json?.error?.details?.unavailablePage ?? {};
      } else if (code === "FORM_NOT_FOUND") {
        unavailable = {};
      }
    }
  } catch (error) {
    console.error("[CampaignPage] fetch error:", error);
  }

  if (unavailable !== null) {
    return <UnavailablePage config={unavailable} />;
  }

  if (!campaign) return notFound();

  // Strip undefined values — required for the server→client RSC serialization boundary
  campaign = JSON.parse(JSON.stringify(campaign));

  // Normalize: suggestedAmounts [{id,value,description}] → keep full objects + flat number array
  if (Array.isArray(campaign.suggestedAmounts)) {
    const raw = campaign.suggestedAmounts.filter(
      (a) => a !== null && typeof a === "object" && typeof a.value === "number"
    );
    campaign.suggestedAmountsData = raw.map((a) => ({
      value:       a.value,
      description: a.description ?? "",
      isDefault:   a.isDefault   ?? false,
    }));
    campaign.suggestedAmounts = raw.map((a) => a.value);
  } else {
    campaign.suggestedAmountsData = [];
  }

  // Normalize: donors {items, meta} → flat total (number | null) + donorItems array
  const donorsRaw          = campaign.donors;
  campaign.donors          = donorsRaw?.meta?.pagination?.total
    ?? (Array.isArray(donorsRaw?.items) ? donorsRaw.items.length : null);
  campaign.donorItems      = donorsRaw?.items ?? [];

  const thumbnailUrl = resolveImageUrl(
    campaign.media?.thumbnailPath ?? campaign.thumbnailPath
  );

  // One gallery: the thumbnail first, then each slider image (de-duplicated, order kept).
  const sliderUrls = Array.isArray(campaign.media?.sliderImages)
    ? campaign.media.sliderImages.map(resolveImageUrl).filter(Boolean)
    : [];
  const galleryImages = [];
  for (const url of [thumbnailUrl, ...sliderUrls]) {
    if (url && !galleryImages.includes(url)) galleryImages.push(url);
  }

  const hasBadges = Boolean(campaign.zakatEligible) || campaign.categories?.length > 0;
  const badges = hasBadges ? (
    <>
      {campaign.zakatEligible && (
        <span className="bg-[#E6F9F0] text-[#10B981] rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap">
          Zakat Eligible
        </span>
      )}
      {campaign.categories?.length > 0 && campaign.categories.map((cat) => (
        <span key={cat.id} className="bg-white/90 text-[#383838] rounded-full px-2.5 py-1 text-xs font-medium capitalize whitespace-nowrap">
          {cat.name}
        </span>
      ))}
    </>
  ) : null;

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-[1611px] mx-auto px-4 sm:px-6 pt-[20px] sm:pt-[30px] md:pt-[50px] lg:pt-[180px] pb-10 lg:pb-16">

        {/* Back link */}
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-[14px] text-[#737373] hover:text-[#EA3335] transition-colors"
        >
          ← Back to Campaigns
        </Link>

        <div className="h-[1px] w-full bg-[#CCCCCC] my-5 sm:my-7" />

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">

          {/* Left */}
          <div className="w-full lg:w-[1000px]">

            <CampaignGallery
              images={galleryImages}
              alt={campaign.name}
              overlay={badges}
            >
              {/* Title */}
              <div className="pt-5 sm:pt-[30px]">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#383838] leading-tight">
                  {campaign.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-normal text-[#383838] mt-4">
                  {/* Each figure follows its own switch — the API omits the value when it is off. */}
                  {campaign.donors != null ? (
                    <>
                      <Image src="/images/donars.png" alt="donor" width={15} height={15} className="object-contain shrink-0" />
                      <span className="shrink-0">{campaign.donors.toLocaleString()} donors</span>
                    </>
                  ) : null}
                  {campaign.endAt ? (
                    <>
                      <Image src="/images/calander.png" alt="calander" width={15} height={15} className="object-contain shrink-0" />
                      <span className="shrink-0">{daysLeft(campaign.endAt)} days left</span>
                    </>
                  ) : null}
                  <Image src="/images/map.png" alt="map" width={15} height={15} className="object-contain shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-none">Multiple Regions</span>
                </div>
              </div>
            </CampaignGallery>

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