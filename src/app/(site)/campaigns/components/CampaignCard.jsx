import Link from "next/link";
import Image from "next/image";
import { apiBase, siteUrl } from "@/utils/constants";

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
  

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative h-[303px] overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
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
      <div className="px-5 py-3 flex items-center gap-2">
        <div className="w-[82px] h-[28px] rounded-full relative">
          <Image
            src="/images/organization.png"
            alt="organization"
            fill
            className="object-contain"
          />
        </div>
        <span className="font-normal text-lg text-[#383838]">MTWA LTD. Ca</span>
      </div>

      {/* Content */}
      <div className="px-5 pt-3">
        <h3 className="font-semibold text-[26px] text-[#383838]">{title}</h3>

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