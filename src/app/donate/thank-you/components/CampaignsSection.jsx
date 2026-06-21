import Link from "next/link";
import CampaignCard from "@/app/(site)/campaigns/components/CampaignCard";
import { arrowIcon } from "@/components/common/SvgIcon";

const CampaignsSection = ({ loading, campaigns }) => (
  <section className="max-w-[1500px] mx-auto px-4 sm:px-6 md:mt-[100px] mt-0">
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1A1A1A]">
          Support other urgent appeals!
        </h2>
        <p className="text-sm sm:text-base font-normal mt-2 text-[#737373]">
          Every donation makes a difference.
        </p>
      </div>
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

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-3">
      {loading ? (
        [1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl h-[480px] animate-pulse" />
        ))
      ) : campaigns.length === 0 ? (
        <p className="col-span-full text-center text-[#737373]">No campaigns found.</p>
      ) : (
        campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)
      )}
    </div>
  </section>
);

export default CampaignsSection;
