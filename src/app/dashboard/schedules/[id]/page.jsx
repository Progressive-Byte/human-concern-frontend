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
  { date: "February 8, 2024", amount: 50, cause: "Zakat", status: "Completed" },
  { date: "February 1, 2024", amount: 50, cause: "Zakat", status: "Completed" },
  { date: "January 25, 2024", amount: 50, cause: "Zakat", status: "Completed" },
  { date: "January 18, 2024", amount: 50, cause: "Zakat", status: "Completed" },
];

const frequencyLabel = { Weekly: "week", Monthly: "month", Daily: "day" };

const ScheduleDetailPage = async ({ params }) => {
  const { id } = await params;
  const schedule = schedules.find((s) => s.id === Number(id));
  if (!schedule) notFound();

  const perLabel = frequencyLabel[schedule.frequency] ?? schedule.frequency.toLowerCase();

  return (
    <>
      <DashboardHeader
        title={schedule.title}
        subtitle={null}
      />

      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-5">
        {/* Back link */}
        <Link
          href="/dashboard/schedules"
          className="inline-flex items-center gap-1.5 text-sm text-[#055A46] hover:text-[#044035] font-medium transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Schedules
        </Link>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 items-start">
          {/* Left column */}
          <div className="flex-1 min-w-0 space-y-4 md:space-y-5">
            {/* Schedule Details */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#1A1A1A] mb-5">Schedule Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-[#8C8C8C] uppercase mb-1">Frequency</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{schedule.frequency}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-[#8C8C8C] uppercase mb-1">Donation Amount</p>
                  <p className="text-2xl font-bold text-[#055A46]">${schedule.amount}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-[#8C8C8C] uppercase mb-1">Next Donation</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{schedule.next}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-[#8C8C8C] uppercase mb-1">Total Donated</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">${schedule.totalDonated}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-[#8C8C8C] uppercase mb-1">Created On</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{schedule.started}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-[#8C8C8C] uppercase mb-1">Payment Method</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{schedule.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Allocated Causes */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">Allocated Causes</h2>
              <div className="flex items-center justify-between rounded-xl bg-[#F7F7F7] px-4 py-3">
                <span className="text-sm font-medium text-[#383838]">{schedule.cause}</span>
                <span className="text-sm font-semibold text-[#055A46]">
                  ${schedule.amount}&nbsp;/&nbsp;{perLabel}
                </span>
              </div>
            </div>

            {/* Donation History */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 md:p-6">
              <h2 className="text-base font-semibold text-[#1A1A1A] mb-4">Donation History</h2>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="bg-[#F7F7F7]">
                      {["Date", "Amount", "Cause", "Status", "Receipt"].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[11px] font-semibold tracking-widest text-[#8C8C8C] uppercase px-4 py-2.5 first:rounded-l-lg last:rounded-r-lg"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {donationHistory.map((row, i) => (
                      <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-4 py-3 text-[#383838]">{row.date}</td>
                        <td className="px-4 py-3 text-[#383838]">${row.amount}</td>
                        <td className="px-4 py-3 text-[#383838]">{row.cause}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ECF9F3] text-[#055A46]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#055A46]" />
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-[#055A46] font-medium hover:text-[#044035] hover:underline transition-colors cursor-pointer"
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

          {/* Right sidebar */}
          <div className="w-full lg:w-64 xl:w-72 shrink-0 space-y-4">
            {/* Total Contributed */}
            <div className="rounded-2xl bg-[#1A1A1A] px-5 py-6">
              <p className="text-xs text-[#8C8C8C] font-medium mb-1">Total Contributed</p>
              <p className="text-3xl font-bold text-white">${schedule.totalDonated}</p>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Actions</h3>
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm text-[#8C8C8C] hover:text-[#EA3335] transition-colors cursor-pointer py-1"
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
      </div>
    </>
  );
};

export default ScheduleDetailPage;
