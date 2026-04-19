import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const ALL_CAMPAIGNS = [
  {
    id: 1,
    category: "Emergency Relief",
    tag: "Zakat Eligible",
    title: "Ramadan Food Distribution",
    description: "Urgent food aid for families in need during Ramadan.",
    raised: 45000,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 2,
    category: "Emergency Relief",
    tag: "Zakat Eligible",
    title: "Earthquake Emergency Relief",
    description: "Providing shelter, medical supplies, and food to earthquake victims.",
    raised: 128000,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 3,
    category: "Clean Water & Sanitation",
    tag: "Zakat Eligible",
    title: "Clean Water Wells Project",
    description: "Building sustainable clean water wells in rural communities.",
    raised: 18500,
    goal: 200000,
    donors: 1205,
    daysLeft: 30,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 4,
    category: "Education",
    tag: "Sadaqa Jariyah",
    title: "Sponsor a Child's Education",
    description: "Help provide quality education to underprivileged children.",
    raised: 67200,
    goal: 150000,
    donors: 845,
    daysLeft: 45,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 5,
    category: "Health",
    tag: "Zakat Eligible",
    title: "Medical Aid for the Poor",
    description: "Providing essential healthcare and medicines to needy families.",
    raised: 32500,
    goal: 100000,
    donors: 670,
    daysLeft: 25,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 6,
    category: "Food Aid",
    tag: "Zakat Eligible",
    title: "Monthly Food Baskets",
    description: "Delivering nutritious food packages to struggling families.",
    raised: 89000,
    goal: 120000,
    donors: 1450,
    daysLeft: 18,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 7,
    category: "Zabiha",
    tag: "Zakat Eligible",
    title: "Qurbani / Zabiha Campaign",
    description: "Perform Qurbani for families who cannot afford it.",
    raised: 67000,
    goal: 250000,
    donors: 980,
    daysLeft: 12,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 8,
    category: "Child Sponsorship",
    tag: "Sadaqa",
    title: "Orphan Child Sponsorship",
    description: "Sponsor an orphan child with monthly support and education.",
    raised: 45000,
    goal: 80000,
    donors: 520,
    daysLeft: 60,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 9,
    category: "Sadaqa Jariyah",
    tag: "Sadaqa Jariyah",
    title: "Build a Masjid",
    description: "Ongoing charity project to build a mosque in a remote village.",
    raised: 125000,
    goal: 300000,
    donors: 890,
    daysLeft: 90,
    org: "MTIWA LTD, Ca",
  },
  {
    id: 10,
    category: "Livelihoods",
    tag: "Zakat Eligible",
    title: "Vocational Training Program",
    description: "Empowering women with skills and small business support.",
    raised: 28000,
    goal: 75000,
    donors: 310,
    daysLeft: 40,
    org: "MTIWA LTD, Ca",
  },
];

function getCampaign(id) {
  return ALL_CAMPAIGNS.find((c) => c.id === Number(id));
}

export async function generateStaticParams() {
  return ALL_CAMPAIGNS.map((campaign) => ({
    id: String(campaign.id),
  }));
}

export default async function CampaignDetailsPage({ params }) {
  const { id } = await params;
  const campaign = getCampaign(id);

  if (!campaign) {
    notFound();
  }

  const pct = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));
  const isEmergency = campaign.category.toLowerCase().includes("emergency");

  return (
    <main className="bg-[#F6F6F6] min-h-screen">
      <div className="max-w-[1611px] mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-[#383838] text-sm mb-6 hover:text-[#EA3335] transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Campaigns
        </Link>

        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100">
          <div className="relative h-[303px] overflow-hidden">
            <Image
              src={`/images/campaign-${campaign.id}.png`}
              alt={campaign.title}
              fill
              className="object-cover"
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
                {campaign.tag}
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
            <span className="font-normal text-lg text-[#383838]">{campaign.org}</span>
          </div>

          <div className="px-5 pt-3">
            <h1 className="font-semibold text-[32px] text-[#383838]">
              {campaign.title}
            </h1>

            <div className="flex items-center gap-2 mt-2 mb-4">
              <span className="text-sm text-[#383838]">{campaign.category}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-[#383838]">{campaign.donors} donors</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-[#383838]">
                {campaign.daysLeft > 0 ? `${campaign.daysLeft} days left` : "Ended"}
              </span>
            </div>

            <p className="text-[#383838] pt-2 font-normal text-lg">
              {campaign.description}
            </p>

            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-xl text-[#383838]">
                  ${campaign.raised.toLocaleString()}
                </span>
                <span className="text-[#AEAEAE] font-semibold text-lg">
                  {pct}%
                </span>
              </div>
              <div className="h-[13px] bg-[#DDFFB4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#055A46] rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[#383838] pt-2 font-normal text-sm">
                raised of ${campaign.goal.toLocaleString()} goal
              </p>
            </div>

            <div className="flex md:flex-row flex-col justify-between items-center mt-7 mb-[18px] gap-4">
              <div className="w-full md:w-auto">
                <button className="w-full md:w-auto text-center bg-[#EA3335] hover:bg-red-700 text-white font-semibold xl:px-6 md:px-3 md:py-3 px-6 py-4 xl:py-5 rounded-[18px] text-[18px] transition-all duration-300 active:scale-95">
                  Donate Now
                </button>
              </div>
              <Link
                href="/campaigns"
                className="w-full md:w-auto text-center bg-[#F6F6F6] hover:bg-[#383838] border border-[#00000033] text-[#383838] hover:text-white font-semibold xl:px-6 md:px-3 md:py-3 px-6 py-4 xl:py-5 rounded-[18px] text-[18px] transition-all duration-300 active:scale-95"
              >
                Share Campaign
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}