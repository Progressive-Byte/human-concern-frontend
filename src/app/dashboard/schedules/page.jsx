import { CalendarIcon, ClockIcon, EditIcon, PauseIcon, PlayIcon, PlusIcon, TrashIcon } from "@/components/common/SvgIcon";
import DashboardHeader from "../components/DashboardHeader";
import ActionButtons from "../components/ActionButtons";

const schedules = [
  {
    id: 1,
    title: "Ramadan Food Distribution",
    amount: 50,
    frequency: "Weekly",
    cause: "Zakat",
    started: "Jan 1, 2024",
    next: "February 15, 2024",
    totalDonated: 200,
    status: "Active",
  },
  {
    id: 2,
    title: "Orphan Sponsorship Program",
    amount: 100,
    frequency: "Monthly",
    cause: "Sadaqah",
    started: "Dec 1, 2023",
    next: "March 1, 2024",
    totalDonated: 300,
    status: "Active",
  },
  {
    id: 3,
    title: "Friday Jummah Giving",
    amount: 25,
    frequency: "Weekly",
    cause: "Sadaqah",
    started: "Nov 15, 2023",
    next: "February 16, 2024",
    totalDonated: 175,
    status: "Paused",
  },
];

const frequencyLabel = { Weekly: "per week", Monthly: "per month", Daily: "per day" };

const SchedulesPage = () => {
  return (
    <>
      <DashboardHeader
        title="Recurring Schedules"
        subtitle="Manage your recurring donation schedules"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#055A46] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#044035] transition-colors cursor-pointer"
          >
            {PlusIcon}
            New Schedule
          </button>
        }
      />

      <div className="flex-1 p-4 md:p-6 space-y-4">
        {schedules.map((s) => {
          const isActive = s.status === "Active";
          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-[#EBEBEB] p-4 md:p-5 hover:border-[#055A46]/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#ECF9F3] flex items-center justify-center text-[#055A46]">
                  {CalendarIcon}
                </div>

                <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                  {/* Left: title + badge + meta */}
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <h3 className="font-semibold text-[#383838] text-sm md:text-base leading-snug">
                        {s.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isActive ? "bg-[#ECF9F3] text-[#055A46]" : "bg-[#FFF8EC] text-[#B45309]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-[#055A46] animate-pulse" : "bg-[#B45309]"
                          }`}
                        />
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#8C8C8C] mt-1">
                      {s.frequency}&nbsp;•&nbsp;{s.cause}&nbsp;•&nbsp;Started {s.started}
                    </p>
                  </div>

                  {/* Right: amount + actions */}
                  <div className="shrink-0 flex items-center gap-2 md:gap-3">
                    <div className="text-right">
                      <p className="text-xl md:text-2xl font-bold text-[#055A46] leading-none">
                        ${s.amount}
                      </p>
                      <p className="text-[11px] text-[#8C8C8C] mt-0.5">
                        {frequencyLabel[s.frequency] ?? s.frequency.toLowerCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <ActionButtons isActive={isActive} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer row */}
              <div className="mt-3 pt-3 border-t border-[#F0F0F0] flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#8C8C8C]">
                <span className="inline-flex items-center gap-1.5">
                  {ClockIcon}
                  Next donation:&nbsp;
                  <span className="font-semibold text-[#383838]">{s.next}</span>
                </span>
                <span>
                  Total donated:&nbsp;
                  <span className="font-semibold text-[#383838]">${s.totalDonated}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
export default SchedulesPage;