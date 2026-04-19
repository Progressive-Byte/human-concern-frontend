import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CampaignTabs from "./SingleComponents/CampaignTabs";
import DonationWidget from "./SingleComponents/DonationWidget";
import { ALL_CAMPAIGNS } from "@/data/campaigns";

function getCampaign(id) {
  return ALL_CAMPAIGNS.find((c) => c.id === Number(id));
}

export function generateStaticParams() {
  return ALL_CAMPAIGNS.map((campaign) => ({
    id: String(campaign.id),
  }));
}

export default async function CampaignPage(props) {
  const params = await props.params;
  const { id } = params;
  const campaign = getCampaign(id);

  if (!campaign) notFound();

  const isEmergency = campaign.category.toLowerCase().includes("emergency");

  return (
    <main className="bg-[#ffffff] min-h-screen">
      <div className="max-w-[1611px] mx-auto px-4 sm:px-6 pt-[180px] pb-16">
        <Link href="/campaigns" className="inline-flex items-center text-[14px] text-[#737373] hover:text-[#EA3335]">
          ← Back to Campaigns
        </Link>
        <div className="h-[1px] w-full bg-[#CCCCCC] my-7"></div>
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-[1000px] mx-auto lg:mx-0">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative h-[300px] sm:h-[340px]">
                <Image src={`/images/campaign-${campaign.id}.png`} alt={campaign.title} fill className="object-cover" priority />
                <div className="absolute top-4 left-4 flex gap-2">
                  {isEmergency && <span className="bg-[#FFF1F1] text-[#FF3636] rounded-full px-2.5 py-1 text-xs">Emergency</span>}
                  <span className="bg-[#E6F9F0] text-[#10B981] rounded-full px-2.5 py-1 text-xs">{campaign.tag}</span>
                </div>
              </div>

              <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                <Image src="/images/organization.png" alt={campaign.org} width={72} height={24} className="object-contain" />
                <span className="text-[13px] text-[#383838]">{campaign.org}</span>
              </div>

              <div className="px-5 pb-4">
                <h1 className="text-2xl font-bold text-[#383838]">{campaign.title}</h1>
                <div className="flex gap-2 text-sm text-[#737373] mt-2">
                  <span>{campaign.donors} donors</span>
                  <span>•</span>
                  <span>{campaign.daysLeft} days left</span>
                  <span>•</span>
                  <span>{campaign.region}</span>
                </div>
              </div>

              <div className="px-5 py-4">
                <CampaignTabs campaign={campaign} />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[500px] lg:sticky lg:top-24">
            <DonationWidget campaign={campaign} />
          </div>
        </div>
      </div>
    </main>
  );
}