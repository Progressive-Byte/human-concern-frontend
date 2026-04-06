import Link from "next/link";
import Image from "next/image";

const CampaignCard = ({ campaign }) => {
    
  const pct = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-[220px] overflow-hidden">
        <Image
          src={`/images/campaign-${campaign.id}.png`}
          alt={campaign.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-red-600 text-white text-[10px] font-semibold px-3 py-1 rounded-full tracking-wide">
            EMERGENCY
          </span>
          <span className="bg-emerald-600 text-white text-[10px] font-semibold px-3 py-1 rounded-full tracking-wide">
            ZAKAT ELIGIBLE
          </span>
        </div>

        {/* Organization */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-2 text-sm">
          <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">✕</div>
          <span className="font-semibold text-gray-800">MTWA LTD. Ca</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-bold text-[17px] leading-tight text-gray-900 mb-2 line-clamp-2">
          {campaign.title}
        </h3>

        <p className="text-gray-600 text-[14.5px] leading-relaxed line-clamp-2 mb-5">
          {campaign.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-sm mb-5">
          <div>
            <span className="font-semibold text-gray-900">
              ${campaign.raised.toLocaleString()}
            </span>
            <span className="text-gray-400 text-xs ml-1">
              raised of ${campaign.goal.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <div className="text-emerald-600 font-semibold text-xs">
              {pct}% FUNDED
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-500">
            <div>👥 {campaign.donors} donors</div>
            {campaign.daysLeft > 0 && (
              <div>⏳ {campaign.daysLeft} days left</div>
            )}
          </div>

          <Link
            href={`/campaigns/${campaign.id}`}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-2xl text-sm transition-all active:scale-95"
          >
            Donate Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;