import Link from "next/link";
import Image from "next/image";

const CampaignCard = ({ campaign }) => {

  const pct = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));

  // Check if campaign is Emergency
  const isEmergency = campaign.category.toLowerCase().includes("emergency");

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-1 mt-10 sm:mt-[57px]">
      <div className="relative h-[303px] overflow-hidden">
        <Image
          src={`/images/campaign-${campaign.id}.png`}
          alt={campaign.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {isEmergency && (
            <div className="flex items-center bg-[#FFF1F1] text-[#FF3636] rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide shadow-sm">
              <div className="w-3.5 h-3.5 bg-[#FF3636]/70 backdrop-blur-[4px] rounded-full mr-1.5 flex items-center justify-center">
                <Image src="/images/emergency.png" alt="alert" width={16} height={16} />
              </div>
              EMERGENCY
            </div>
          )}

          <div className="flex items-center bg-[#E6F9F0] text-[#10B981] rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide shadow-sm">
            ZAKAT ELIGIBLE
          </div>
        </div>
      </div>
      <div className="px-5 py-3 rounded-xl flex items-center text-sm gap-2">
        <div className="w-[82px] h-[28px] rounded-full flex items-center justify-center text-white text-xs relative">
          <Image
            src="/images/organization.png"
            alt="flag"
            fill
            className="object-contain"
          />
        </div>
        <span className="font-normal text-lg text-[#383838]">MTWA LTD. Ca</span>
      </div>

      {/* Content */}
      <div className="px-5 pt-3">
        <h3 className="font-semibold text-[26px] text-[#383838]">
          {campaign.title}
        </h3>

        <p className="text-[#383838] pt-2 font-normal text-[15px]">
          {campaign.description}
        </p>

        <div className="mt-3">
          <div className="h-[13px] bg-[#DDFFB4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#055A46] rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 text-[#383838] mt-2">
          <div className="flex items-center gap-2 text-[13px] font-normal">
            <Image src="/images/donars.png" alt="donor" width={15} height={15} />
            {campaign.donors} donors
            <Image src="/images/calander.png" alt="calander" width={15} height={15} />
              {campaign.daysLeft > 0 && (
                <div>{campaign.daysLeft} days left</div>
              )}
          </div>
          <div className="text-[#AEAEAE] font-semibold text-[15px]">
            {pct}%
          </div>
        </div>
        <div className="flex justify-between items-center text-sm mt-7 mb-[18px]">
          <div>
            <div className="font-bold text-[#383838] text-4xl">
              ${campaign.raised.toLocaleString()}
            </div>
            <div className="text-[#383838] pt-2 font-normal text-[15px]">
              raised of ${campaign.goal.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <Link
                href={`/campaigns/${campaign.id}`}
                className="bg-[#F6F6F6] hover:bg-[#383838] border border-[#00000033] text-[#383838] hover:text-white font-semibold px-6 py-5 rounded-[18px] text-[18px] transition-all duration-300 active:scale-95"
              >
              Donate Now
            </Link>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;