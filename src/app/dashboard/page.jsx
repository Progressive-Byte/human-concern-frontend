import { DollarIcon, DonationContentIcon } from "@/components/common/SvgIcon";
import DashboardHeader from "./components/DashboardHeader";
import StatCard from "./components/StatCard";

const CalendarIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Static placeholder data — replace with API fetch when wired up.    */
/* ------------------------------------------------------------------ */
const stats = [
  {
    label: "Total Donated",
    value: "$4,250",
    hint: "Lifetime contributions",
    icon: DollarIcon,
    accent: "#055A46",
    bgColor: "#ECF2FF",
    borderColor: "#D8E4FF",
  },
  {
    label: "Active Schedules",
    value: "3",
    hint: "Recurring donations",
    icon: CalendarIcon,
    accent: "#383838",
    bgColor: "#FFF6EC",
    borderColor: "#FFE7CC",
  },
  {
    label: "Next Payment",
    value: "$50",
    hint: "Feb 15, 2026",
    icon: ClockIcon,
    accent: "#EA3335",
    bgColor: "#ECF2FF",
    borderColor: "#D8E4FF",
  },
];

const recentDonations = [
  { id: 1, title: "Ramadan Food Distribution",   date: "Feb 1, 2026",  amount: 100, cause: "Zakat" },
  { id: 2, title: "Earthquake Emergency Relief", date: "Jan 25, 2026", amount: 250, cause: "Emergency" },
  { id: 3, title: "Orphan Sponsorship Program",  date: "Jan 15, 2026", amount: 50,  cause: "Sadaqah" },
];

const causeBadgeStyles = {
  Zakat:     "bg-emerald-50 text-[#055A46]",
  Sadaqah:   "bg-amber-50 text-amber-700",
  Emergency: "bg-red-50 text-[#EA3335]",
  Fitrana:   "bg-blue-50 text-blue-700",
};

const fundBreakdown = [
  { label: "Zakat",            amount: 2500, percent: 65 },
  { label: "Sadaqah",          amount: 1200, percent: 25 },
  { label: "Emergency Relief", amount: 350,  percent: 8  },
];

const RANGE_COLOR = "#94C794";

const activeSchedules = [
  { id: 1, title: "Ramadan Food Distribution", amount: 50,  frequency: "Weekly",  next: "Feb 15" },
  { id: 2, title: "Orphan Sponsorship Program", amount: 100, frequency: "Monthly", next: "Mar 1"  },
];

const DashboardPage = () => {
  return (
    <>
      <DashboardHeader />

      <div className="flex-1 p-6 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </section>

        {/* Recent Donations + Fund Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Recent Donations */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#26262633] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-[#383838]">Recent Donations</h2>
              <a
                href="/dashboard/donation-history"
                className="text-sm text-[#055A46] hover:underline font-medium"
              >
                View All →
              </a>
            </div>

            <div className="space-y-2">
              {recentDonations.map((d, idx) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between py-3 ${
                    idx !== recentDonations.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#055A46]">
                      {DonationContentIcon}
                    </div>
                    <div>
                      <p className="font-medium text-[#383838]">{d.title}</p>
                      <p className="text-xs text-[#737373] mt-0.5">{d.date}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-semibold text-[#383838] text-lg leading-none">${d.amount}</p>
                    <span
                      className={`text-[11px] px-3 py-0.5 rounded-full font-medium ${
                        causeBadgeStyles[d.cause] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.cause}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fund Breakdown */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#26262633] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-[#383838]">Fund Breakdown</h2>
              <a
                href="/dashboard/fund-breakdown"
                className="text-sm text-[#055A46] hover:underline font-medium"
              >
                Details
              </a>
            </div>

            <div className="space-y-5 mt-2">
              {fundBreakdown.map((f) => (
                <div key={f.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#383838]">{f.label}</span>
                    <span className="font-medium text-[#383838]">
                      ${f.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${f.percent}%`, backgroundColor: f.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Schedules */}
        <div className="bg-white rounded-2xl border border-[#26262633] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#383838]">Active Schedules</h2>
            <a
              href="/dashboard/schedules"
              className="text-sm text-[#055A46] hover:underline font-medium"
            >
              Manage All →
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSchedules.map((s) => (
              <div
                key={s.id}
                className="border border-gray-100 rounded-2xl p-5 hover:border-[#055A46]/30 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-emerald-50 text-[#055A46] px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-[#055A46] rounded-full animate-pulse" />
                      ACTIVE
                    </span>
                    <p className="mt-4 font-medium text-[#383838] leading-tight">
                      {s.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-[#055A46]">${s.amount}</p>
                    <p className="text-xs text-[#737373] mt-0.5">{s.frequency}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-[#737373]">
                  Next donation:{" "}
                  <span className="font-medium text-[#383838]">{s.next}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
