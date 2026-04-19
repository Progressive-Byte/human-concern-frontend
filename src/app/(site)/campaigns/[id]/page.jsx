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
            <div className="">
              <div className="relative h-[300px] sm:h-[490px]">
                <Image src={`/images/campaign-${campaign.id}.png`} alt={campaign.title} fill className="object-cover rounded-3xl" priority />
                <div className="absolute top-4 left-4 flex gap-2">
                  {isEmergency && <span className="bg-[#FFF1F1] text-[#FF3636] rounded-full px-2.5 py-1 text-xs">Emergency</span>}
                  <span className="bg-[#E6F9F0] text-[#10B981] rounded-full px-2.5 py-1 text-xs">{campaign.tag}</span>
                </div>
              </div>

              <div className="pt-[30px]">
                <h1 className="text-3xl font-bold text-[#383838]">{campaign.title}</h1>
                <div className="flex gap-2 text-sm font-normal text-[#383838] mt-4">
                  <Image src="/images/donars.png" alt="donor" width={15} height={15} className="object-contain" />
                  <span>{campaign.donors} donors</span>
                  <Image src="/images/calander.png" alt="calander" width={15} height={15} className="object-contain" />
                  <span>{campaign.daysLeft} days left</span>
                  <Image src="/images/map.png" alt="map" width={15} height={15} className="object-contain" />
                  <span>{campaign.region}</span>
                </div>
              </div>

              <div className="mt-8">
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