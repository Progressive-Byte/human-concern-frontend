import { CalendarIcon, ClockIcon, DollarIcon, DonationContentIcon } from "@/components/common/SvgIcon";
import DashboardHeader from "./components/DashboardHeader";
import StatCard from "./components/StatCard";

const stats = [
  {
    label: "Total Donated",
    value: "$4,250",
    hint: "Lifetime contributions",
    icon: DollarIcon,
    accent: "#EA3335",
    bgColor: "#FFF5F5",
    borderColor: "#FECACA",
  },
  {
    label: "Active Schedules",
    value: "3",
    hint: "Recurring donations",
    icon: CalendarIcon,
    accent: "#B45309",
    bgColor: "#FFF6EC",
    borderColor: "#FFE7CC",
  },
  {
    label: "Next Payment",
    value: "$50",
    hint: "Feb 15, 2026",
    icon: ClockIcon,
    accent: "#EA3335",
    bgColor: "#FFF5F5",
    borderColor: "#FFCCCC",
  },
];

const recentDonations = [
  { id: 1, title: "Ramadan Food Distribution",   date: "Feb 1, 2026",  amount: 100, cause: "Zakat" },
  { id: 2, title: "Earthquake Emergency Relief", date: "Jan 25, 2026", amount: 250, cause: "Emergency" },
  { id: 3, title: "Orphan Sponsorship Program",  date: "Jan 15, 2026", amount: 50,  cause: "Sadaqah" },
];

const causeBadgeStyles = {
  Zakat:     "bg-[#ECFDF5] text-[#047857]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};

const fundBreakdown = [
  { label: "Zakat",            amount: 2500, percent: 65 },
  { label: "Sadaqah",          amount: 1200, percent: 25 },
  { label: "Emergency Relief", amount: 350,  percent: 8  },
];

const activeSchedules = [
  { id: 1, title: "Ramadan Food Distribution",  amount: 50,  frequency: "Weekly",  next: "Feb 15" },
  { id: 2, title: "Orphan Sponsorship Program", amount: 100, frequency: "Monthly", next: "Mar 1"  },
];

const DashboardPage = () => {
  return (
    <>
      <DashboardHeader />

      <div className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </section>

        {/* Recent Donations + Fund Breakdown */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Recent Donations */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl font-semibold text-[#111827]">Recent Donations</h2>
              <a
                href="/dashboard/donation-history"
                className="text-sm text-[#EA3335] hover:underline font-medium"
              >
                View All →
              </a>
            </div>

            <div className="space-y-1">
              {recentDonations.map((d, idx) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between py-3 ${
                    idx !== recentDonations.length - 1 ? "border-b border-[#E5E7EB]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
                      {DonationContentIcon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#111827] text-sm truncate">{d.title}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{d.date}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-3">
                    <p className="font-semibold text-[#111827] text-base leading-none">${d.amount}</p>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                        causeBadgeStyles[d.cause] || "bg-[#F3F4F6] text-[#6B7280]"
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
          <div className="lg:col-span-5 bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg md:text-xl font-semibold text-[#111827]">Fund Breakdown</h2>
              <a
                href="/dashboard/fund-breakdown"
                className="text-sm text-[#EA3335] hover:underline font-medium"
              >
                Details
              </a>
            </div>

            <div className="space-y-5 mt-2">
              {fundBreakdown.map((f) => (
                <div key={f.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#111827]">{f.label}</span>
                    <span className="font-medium text-[#111827]">${f.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-[#EA3335]"
                      style={{ width: `${f.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Schedules */}
        <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
          <div className="flex items-center justify-between mb-5 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-[#111827]">Active Schedules</h2>
            <a
              href="/dashboard/schedules"
              className="text-sm text-[#EA3335] hover:underline font-medium"
            >
              Manage All →
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSchedules.map((s) => (
              <div
                key={s.id}
                className="border border-dashed border-[#E5E7EB] rounded-2xl p-4 md:p-5 hover:border-red-500/30 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide bg-[#ECFDF5] text-[#047857] px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-[#047857] rounded-full animate-pulse" />
                      ACTIVE
                    </span>
                    <p className="mt-3 font-medium text-[#111827] leading-snug text-sm">
                      {s.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-[#EA3335]">${s.amount}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{s.frequency}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
                  Next donation:{" "}
                  <span className="font-semibold text-[#111827]">{s.next}</span>
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
