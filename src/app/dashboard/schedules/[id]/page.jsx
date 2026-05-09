import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardHeader from "../../components/DashboardHeader";

const schedules = [
  {
    id: 1,
    title: "Ramadan Food Distribution",
    amount: 50,
    frequency: "Weekly",
    cause: "Zakat",
    started: "January 1, 2024",
    next: "February 15, 2024",
    totalDonated: 200,
    status: "Active",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: 2,
    title: "Orphan Sponsorship Program",
    amount: 100,
    frequency: "Monthly",
    cause: "Sadaqah",
    started: "December 1, 2023",
    next: "March 1, 2024",
    totalDonated: 300,
    status: "Active",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: 3,
    title: "Friday Jummah Giving",
    amount: 25,
    frequency: "Weekly",
    cause: "Sadaqah",
    started: "November 15, 2023",
    next: "February 16, 2024",
    totalDonated: 175,
    status: "Paused",
    paymentMethod: "Visa •••• 4242",
  },
];

const donationHistory = [
  { date: "February 8, 2024",  amount: 50, cause: "Zakat", status: "Completed" },
  { date: "February 1, 2024",  amount: 50, cause: "Zakat", status: "Completed" },
  { date: "January 25, 2024",  amount: 50, cause: "Zakat", status: "Completed" },
  { date: "January 18, 2024",  amount: 50, cause: "Zakat", status: "Completed" },
];

const causeBadgeStyles = {
  Zakat:     "bg-[#ECFDF5] text-[#047857]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};

const frequencyLabel = { Weekly: "week", Monthly: "month", Daily: "day" };

const DetailRow = ({ label, value, valueClass = "text-sm font-semibold text-[#111827]" }) => (
  <div>
    <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] mb-1">{label}</p>
    <p className={valueClass}>{value}</p>
  </div>
);

const ScheduleDetailPage = async ({ params }) => {
  const { id } = await params;
  const schedule = schedules.find((s) => s.id === Number(id));
  if (!schedule) notFound();

  const perLabel = frequencyLabel[schedule.frequency] ?? schedule.frequency.toLowerCase();

  return (
    <>
      <DashboardHeader title={schedule.title} subtitle={null} />

      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-5">
        {/* Back link */}
        <Link
          href="/dashboard/schedules"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#EA3335] hover:text-red-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Schedules
        </Link>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 items-start">
          {/* ── Left column ── */}
          <div className="flex-1 min-w-0 space-y-4 md:space-y-5">

            {/* Schedule Details */}
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#111827] mb-5">Schedule Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <DetailRow label="Frequency" value={schedule.frequency} />
                <DetailRow
                  label="Donation Amount"
                  value={`$${schedule.amount}`}
                  valueClass="text-2xl font-bold text-[#EA3335]"
                />
                <DetailRow label="Next Donation" value={schedule.next} />
                <DetailRow label="Total Donated" value={`$${schedule.totalDonated}`} />
                <DetailRow label="Created On" value={schedule.started} />
                <DetailRow label="Payment Method" value={schedule.paymentMethod} />
              </div>
            </div>

            {/* Allocated Causes */}
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#111827] mb-4">Allocated Causes</h2>
              <div className="flex items-center justify-between rounded-xl bg-[#F9FAFB] border border-dashed border-[#E5E7EB] px-4 py-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${causeBadgeStyles[schedule.cause] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                  {schedule.cause}
                </span>
                <span className="text-sm font-semibold text-[#EA3335]">
                  ${schedule.amount}&nbsp;/&nbsp;{perLabel}
                </span>
              </div>
            </div>

            {/* Donation History */}
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#111827] mb-4">Donation History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="text-left border-b border-[#E5E7EB]">
                      {["Date", "Amount", "Cause", "Status", "Receipt"].map((h) => (
                        <th
                          key={h}
                          className="pb-3 px-2 first:pl-0 last:pr-0 text-[11px] font-semibold tracking-widest uppercase text-[#6B7280]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {donationHistory.map((row, i) => (
                      <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-2 first:pl-0 text-[#111827] font-medium">{row.date}</td>
                        <td className="py-3.5 px-2 text-[#111827] font-semibold">${row.amount}</td>
                        <td className="py-3.5 px-2">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${causeBadgeStyles[row.cause] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                            {row.cause}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#047857]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" />
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 last:pr-0">
                          <button
                            type="button"
                            className="text-sm font-medium text-[#EA3335] hover:text-red-700 hover:underline transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-full lg:w-64 xl:w-72 shrink-0 space-y-4">

            {/* Total Contributed */}
            <div className="rounded-2xl bg-[#1A1A1A] px-5 py-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-1">Total Contributed</p>
              <p className="text-3xl font-bold text-white">${schedule.totalDonated}</p>
              <p className="mt-1 text-xs text-[#6B7280]">Lifetime for this schedule</p>
            </div>

            {/* Next Donation */}
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] mb-1">Next Donation</p>
              <p className="text-sm font-semibold text-[#111827]">{schedule.next}</p>
              <div className="mt-3 pt-3 border-t border-dashed border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                <span>{schedule.frequency}</span>
                <span className="font-semibold text-[#EA3335]">${schedule.amount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5">
              <h3 className="text-sm font-semibold text-[#111827] mb-3">Actions</h3>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#EA3335] transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleDetailPage;
