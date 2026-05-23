 "use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { serverApiBase, siteUrl } from "@/utils/constants";

let brandingLogoUrlCache = null;
let brandingLogoLoaded = false;
let brandingLogoPromise = null;

function resolveAssetUrl(value) {
  const raw =
    typeof value === "string"
      ? value
      : value && typeof value === "object"
        ? value?.url || value?.path || value?.location || value?.src
        : "";
  const p = String(raw || "").trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${siteUrl}${p}`;
  return `${siteUrl}/${p}`;
}

async function loadBrandingLogoUrl() {
  if (brandingLogoLoaded) return brandingLogoUrlCache;
  if (brandingLogoPromise) return brandingLogoPromise;
  brandingLogoPromise = (async () => {
    try {
      const res = await fetch(`${serverApiBase}settings/branding`, { method: "GET" });
      const json = await res.json();
      const path = json?.data?.branding?.logo?.path ?? null;
      const url = resolveAssetUrl(path);
      brandingLogoUrlCache = url || null;
      brandingLogoLoaded = true;
      return brandingLogoUrlCache;
    } catch {
      brandingLogoUrlCache = null;
      brandingLogoLoaded = true;
      return null;
    } finally {
      brandingLogoPromise = null;
    }
  })();
  return brandingLogoPromise;
}

const CampaignCard = ({ campaign }) => {
  const raised = campaign.raised ?? 0;
  const goal = campaign.goal ?? 0;
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  const category = Array.isArray(campaign.categories)
    ? campaign.categories[0] ?? ""
    : "";

  const daysLeft = campaign.endAt
    ? Math.max(0, Math.ceil((new Date(campaign.endAt) - Date.now()) / 86400000))
    : 0;

  const title = campaign.name ?? "";
  const thumbnail = campaign.thumbnailPath || `/images/placeholder.png`;
  const thumbnailUrl = siteUrl + thumbnail;

  const collabName = String(campaign?.collaborationOrganizationName || "").trim();
  const collabImageUrl = useMemo(
    () => resolveAssetUrl(campaign?.collaborationOrganizationImage),
    [campaign?.collaborationOrganizationImage]
  );
  const collabImageAlt = String(campaign?.collaborationOrganizationImage?.alt || "").trim() || "Partner logo";
  const [brandLogoUrl, setBrandLogoUrl] = useState(brandingLogoLoaded ? brandingLogoUrlCache : null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const url = await loadBrandingLogoUrl();
      if (!alive) return;
      setBrandLogoUrl(url);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div data-campaign-card className="group bg-white rounded-3xl overflow-hidden border border-gray-100 transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_46px_rgba(0,0,0,0.12)] hover:border-red-500/20 motion-reduce:transition-none">
      {/* Thumbnail */}
      <div className="relative h-[303px] overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          data-campaign-card-image
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute top-4 left-4 flex gap-2">
            <div className="flex items-center bg-[#FFF1F1] text-[#FF3636] rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide shadow-sm">
              <div className="w-3.5 h-3.5 bg-[#FF3636]/70 rounded-full mr-1.5 flex items-center justify-center">
                <Image src="/images/emergency.png" alt="alert" width={16} height={16} />
              </div>
              {category}
            </div>
          {campaign.zakatEligible && (
            <div className="flex items-center bg-[#E6F9F0] text-[#10B981] rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide shadow-sm">
              ZAKAT ELIGIBLE
            </div>
          )}
        </div>
      </div>

      {/* Organization */}
      {collabName || collabImageUrl ? (
        <div className="px-5 py-3 flex items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-[28px] h-[28px] rounded-full relative overflow-hidden border border-[#E5E7EB] bg-white">
              <Image
                src={brandLogoUrl || "/images/organization.png"}
                alt="brand logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <span className="text-[14px] leading-none select-none">🤝</span>
            {collabImageUrl ? (
              <div className="w-[28px] h-[28px] rounded-full relative overflow-hidden border border-[#E5E7EB] bg-white">
                <Image
                  src={collabImageUrl}
                  alt={collabImageAlt}
                  fill
                  className="object-contain p-1"
                />
              </div>
            ) : null}
          </div>
          {collabName ? (
            <span className="min-w-0 truncate font-normal text-lg text-[#383838]">{collabName}</span>
          ) : null}
        </div>
      ) : null}

      {/* Content */}
      <div className="px-5 pt-3">
        <h3 className="font-semibold text-[26px] text-[#383838]"><span data-campaign-card-title>{title}</span></h3>

        <p className="text-[#383838] pt-2 font-normal text-[15px]">
          {campaign.description}
        </p>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-[13px] bg-[#DDFFB4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#055A46] rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Donors & Days */}
        <div className="flex items-center justify-between gap-2 text-[#383838] mt-2">
          <div className="flex items-center gap-2 text-[13px] font-normal">
            <Image src="/images/donars.png" alt="donor" width={15} height={15} />
            {campaign.donors ?? 0} donors
            <Image src="/images/calander.png" alt="calendar" width={15} height={15} />
            {daysLeft > 0 && <span>{daysLeft} days left</span>}
          </div>
          <div className="text-[#AEAEAE] font-semibold text-[15px]">{pct}%</div>
        </div>

        {/* Raised & CTA */}
        <div className="flex md:flex-row flex-col justify-between items-center mt-7 mb-[18px]">
          <div>
            <div className="font-bold text-[#383838] xl:text-4xl md:text-3xl text-4xl">
              ${goal.toLocaleString()}
            </div>
            <div className="text-[#383838] pt-2 font-normal text-[15px]">
              raised of ${raised.toLocaleString()}
            </div>
          </div>
          <Link
            href={`/campaigns/${campaign.slug}`}
            className="w-full md:w-auto text-center bg-[#F6F6F6] hover:bg-[#383838] border border-[#00000033] text-[#383838] hover:text-white font-semibold xl:px-6 md:px-3 md:py-3 px-6 py-4 xl:py-5 rounded-[18px] text-[18px] transition-all duration-300 active:scale-95"
          >
            Donate Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
