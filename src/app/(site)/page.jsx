import { CheckIcon } from "@/components/common/SvgIcon";
import Link from "next/link";

/* ─── Static data ────────────────────────────────── */
const stats = [
  { value: "$1.4M", label: "Raised to Date" },
  { value: "15K+", label: "Active Donors" },
  { value: "40", label: "Countries Reached" },
  { value: "2500+", label: "Lives Changed" },
];

const campaigns = [
  {
    id: 1,
    category: "Education",
    tag: "Active",
    title: "School Fund Campaign",
    description:
      "Providing quality education resources to underprivileged children across rural communities.",
    raised: 24500,
    goal: 40000,
    donors: 312,
    daysLeft: 18,
  },
  {
    id: 2,
    category: "Shelter",
    tag: "Completed",
    title: "Campaign Fully Funded",
    description:
      "Thanks to our generous donors, this campaign has reached its funding goal successfully.",
    raised: 60000,
    goal: 60000,
    donors: 890,
    daysLeft: 0,
  },
  {
    id: 3,
    category: "Healthcare",
    tag: "Urgent",
    title: "Clean Water Well Project",
    description:
      "Building clean water wells for families in drought-stricken regions of East Africa.",
    raised: 8200,
    goal: 25000,
    donors: 143,
    daysLeft: 9,
  },
];

const steps = [
  {
    number: "01",
    title: "Discover the Need",
    description:
      "Browse verified campaigns curated by our team. Every cause is vetted for transparency and real-world impact.",
  },
  {
    number: "02",
    title: "Choose Your Cause",
    description:
      "Select a campaign that resonates with your values — from education and healthcare to clean water and shelter.",
  },
  {
    number: "03",
    title: "Track Your Impact",
    description:
      "Receive updates directly from campaign organizers and see exactly how your donation is making a difference.",
  },
];

const features = [
  {
    icon: "🛡",
    title: "100% Secure",
    desc: "Bank-grade encryption on all transactions.",
  },
  {
    icon: "📊",
    title: "Full Transparency",
    desc: "See exactly where every dollar goes.",
  },
  {
    icon: "⚡",
    title: "Instant Receipts",
    desc: "Tax-deductible receipts in seconds.",
  },
  {
    icon: "🌍",
    title: "Global Reach",
    desc: "Support causes in 40+ countries.",
  },
];

const waysToGive = [
  {
    icon: "💳",
    title: "One-Time Donation",
    description:
      "Make a single contribution to any campaign, big or small — every amount counts.",
  },
  {
    icon: "🔄",
    title: "Monthly Giving",
    description:
      "Become a sustainer. Set up recurring donations and create lasting, consistent change.",
  },
  {
    icon: "🎁",
    title: "Give in Honor",
    description:
      "Celebrate someone special by donating in their name with a beautiful tribute card.",
  },
  {
    icon: "🏢",
    title: "Corporate Matching",
    description:
      "Double your impact. Many employers match employee donations — check if yours does.",
  },
  {
    icon: "📦",
    title: "In-Kind Goods",
    description:
      "Donate goods and supplies directly to campaigns that need physical resources.",
  },
  {
    icon: "🤝",
    title: "Volunteer",
    description:
      "Give your time, skills, and energy. Volunteer with local or remote campaign teams.",
  },
];

/* ─── Campaign Card ──────────────────────────────── */
function CampaignCard({ campaign }) {
  const pct = Math.min(
    100,
    Math.round((campaign.raised / campaign.goal) * 100),
  );
  const isCompleted = campaign.tag === "Completed";
  const isUrgent = campaign.tag === "Urgent";

  const tagClass = isCompleted
    ? "bg-white/10 text-white/50 border border-white/10"
    : isUrgent
      ? "bg-red-500/15 text-red-400 border border-red-500/25"
      : "bg-yellow-400/15 text-yellow-400 border border-yellow-400/25";

  return (
    <article
      className={`bg-[#161616] border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex flex-col ${
        isCompleted ? "opacity-75" : ""
      }`}
    >
      <div className="relative h-44 bg-[#1e1e1e] flex items-center justify-center">
        <span className="text-4xl opacity-20">📷</span>
        <span
          className={`absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded ${tagClass}`}
        >
          {campaign.tag}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-yellow-400 mb-1">
          {campaign.category}
        </p>
        <h3 className="text-base font-bold text-white tracking-tight leading-snug mb-2">
          {campaign.title}
        </h3>
        <p className="text-[13px] text-white/55 leading-relaxed mb-4 flex-1">
          {campaign.description}
        </p>
        <div className="mb-4">
          <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-white/55 font-medium">
              ${campaign.raised.toLocaleString()} raised
            </span>
            <span className="text-[12px] text-yellow-400 font-semibold">
              {pct}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-white/35 flex-1">
            👥 {campaign.donors} donors
          </span>
          {!isCompleted && (
            <span className="text-[11px] text-white/35">
              ⏳ {campaign.daysLeft} days left
            </span>
          )}
          <Link
            href={`/campaigns/${campaign.id}`}
            className="text-[12px] font-semibold text-yellow-400 px-3 py-1.5 border border-yellow-400/25 rounded-md hover:bg-yellow-400/10 transition-colors no-underline"
          >
            {isCompleted ? "View Report" : "Donate →"}
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="overflow-hidden text-white">
      {/* ── Hero ── */}
      <section className="relative w-full h-[1200px] overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/images/hero.png')] bg-center bg-cover bg-no-repeat"
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg, rgba(0,0,0,0.3) 0%, transparent 60%)]"
          aria-hidden="true"
        />

        {/* ── Frosted glass card — left side ── */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[1611px] mt-[-200px] mx-auto">
            <div className="w-full max-w-[652px] bg-[#FFFFFFB2] backdrop-blur-[100px] px-[77px] py-[60px] rounded-3xl">
              <h1 className="text-[56px] leading-[1.1] font-semibold text-[#383838] [text-shadow:0px_4px_25px_rgba(255,255,255,0.25)]">
                Give with <span className="font-bold font-playfair italic">Purpose. Transform</span> lives.
              </h1>
              <p className="text-[#383838] font-medium py-7 text-2xl [text-shadow:0px_0px_3px_rgba(255,255,255,1)]">
                Your trusted platform for Zakat, Sadaqah, and humanitarian giving.
              </p>
              <div className="flex items-center gap-3 flex-wrap mb-7">
                <Link
                  href="/campaigns"
                  className="px-6 py-3 bg-[#EA3335] hover:bg-red-700 text-white font-normal text-[18px] rounded-full transition-all duration-200 hover:-translate-y-0.5"
                >
                  All campaigns
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 text-[#383838] font-normal text-[18px] rounded-full border border-[#383838] transition-all duration-200 hover:-translate-y-0.5"
                >
                  Get started
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-5 flex-wrap">
                {["Secure Payments", "100% Zakat Compliant", "Tax Deductible"].map(
                  (label) => (
                    <span
                      key={label}
                      className="flex items-center gap-1.5 text-[14px] text-[#383838] font-medium"
                    >
                      <span className="">
                        {CheckIcon}
                      </span>
                      {label}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Watch Video ── */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <button className="group flex items-center gap-3 pl-5 pr-3 py-2.5 rounded-full bg-white/20 hover:bg-white/30 border border-white/60 hover:border-white backdrop-blur-sm text-white font-semibold text-[15px] transition-all duration-250 shadow-lg cursor-pointer">
            Watch Video
            <span className="w-8 h-8 rounded-full bg-white/25 group-hover:bg-white flex items-center justify-center transition-all duration-250 shrink-0">
              <svg
                width="10"
                height="12"
                viewBox="0 0 10 12"
                fill="currentColor"
                className="text-white group-hover:text-gray-900 transition-colors duration-250 translate-x-[1px]"
              >
                <path d="M0 0l10 6-10 6V0z" />
              </svg>
            </span>
          </button>
        </div>

      </section>

      {/* ── Featured Campaigns ── */}
      <section className="py-24" id="campaigns">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-yellow-400 mb-2">
                Active Campaigns
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white m-0">
                Featured Campaigns
              </h2>
            </div>
            <Link
              href="/campaigns"
              className="shrink-0 px-5 py-2.5 border border-white/10 text-white/70 text-sm font-medium rounded-lg hover:text-white hover:bg-white/5 transition-all no-underline"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 bg-[#111111]" id="how-it-works">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-yellow-400 mb-2">
              Simple Process
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white m-0">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ number, title, description }) => (
              <div
                key={number}
                className="p-8 bg-[#0e0e0e] border border-white/[0.08] rounded-2xl"
              >
                <div className="text-5xl font-extrabold text-yellow-400/15 tracking-tighter leading-none mb-5">
                  {number}
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mb-3">
                  {title}
                </h3>
                <p className="text-[14px] text-white/55 leading-relaxed m-0">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Turn Awareness into Action ── */}
      <section className="py-24 bg-[#050505] border-y border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-yellow-400 mb-3">
                Why HumanConcern
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight mb-4">
                Turn Awareness
                <br />
                into Action
              </h2>
              <p className="text-[15px] text-white/45 leading-relaxed max-w-sm mb-8">
                We built a platform where generosity is simple, safe, and
                traceable — so you can give with full confidence.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center px-6 py-3 bg-yellow-400 text-black font-semibold text-[15px] rounded-lg hover:bg-yellow-300 hover:-translate-y-0.5 transition-all duration-200 no-underline"
              >
                Start Giving Today
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="p-5 bg-[#161616] border border-white/[0.08] rounded-xl hover:border-yellow-400/20 transition-colors duration-200"
                >
                  <span className="text-2xl block mb-3">{icon}</span>
                  <h4 className="text-[14px] font-bold text-white mb-1.5">
                    {title}
                  </h4>
                  <p className="text-[13px] text-white/55 m-0 leading-snug">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ways to Give ── */}
      <section className="py-24 bg-[#0e0e0e]" id="ways-to-give">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-yellow-400 mb-2">
              Flexible Giving
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white m-0">
              Ways to Give
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {waysToGive.map(({ icon, title, description }) => (
              <div
                key={title}
                className="p-7 bg-[#161616] border border-white/[0.08] rounded-2xl hover:border-yellow-400/20 hover:-translate-y-1 transition-all duration-200"
              >
                <span className="text-3xl block mb-4">{icon}</span>
                <h4 className="text-[15px] font-bold text-white tracking-tight mb-2">
                  {title}
                </h4>
                <p className="text-[13px] text-white/55 leading-relaxed m-0">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-[#111111] border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-10 lg:p-12 bg-gradient-to-br from-yellow-400/[0.06] to-yellow-400/[0.02] border border-yellow-400/15 rounded-2xl">
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
                Ready to Make a Difference?
              </h2>
              <p className="text-[15px] text-white/55 leading-relaxed m-0 max-w-lg">
                Join thousands of donors changing lives today. Your first
                donation could be someone's turning point.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap shrink-0">
              <Link
                href="/donate"
                className="px-7 py-3.5 bg-yellow-400 text-black font-semibold text-[15px] rounded-lg hover:bg-yellow-300 hover:-translate-y-0.5 transition-all no-underline"
              >
                Donate Now
              </Link>
              <Link
                href="/register"
                className="px-7 py-3.5 border border-white/10 text-white/75 font-medium text-[15px] rounded-lg hover:text-white hover:bg-white/5 hover:border-white/20 transition-all no-underline"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
