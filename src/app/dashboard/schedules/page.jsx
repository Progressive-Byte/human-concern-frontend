import DashboardHeader from "../components/DashboardHeader";

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

const CalendarSquareIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
  </svg>
);

const ClockIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PauseIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="8" y1="5" x2="8" y2="19" />
    <line x1="16" y1="5" x2="16" y2="19" />
  </svg>
);

const PlayIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const EditIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const PlusIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function SchedulesPage() {
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
              {/* Top section */}
              <div className="flex items-start gap-3 md:gap-4">
                {/* Calendar icon */}
                <div className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#ECF9F3] flex items-center justify-center text-[#055A46]">
                  {CalendarSquareIcon}
                </div>

                {/* Middle: title + meta */}
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-center flex-wrap gap-2">
                    <h3 className="font-semibold text-[#383838] text-sm md:text-base leading-snug">
                      {s.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#ECF9F3] text-[#055A46]"
                          : "bg-[#FFF8EC] text-[#B45309]"
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

                  {/* Meta row */}
                  <p className="text-xs text-[#8C8C8C] mt-1">
                    {s.frequency}&nbsp;•&nbsp;{s.cause}&nbsp;•&nbsp;Started {s.started}
                  </p>
                </div>

                {/* Right: amount + actions — hidden on mobile, shown md+ */}
                <div className="hidden md:flex items-start gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#055A46] leading-none">${s.amount}</p>
                    <p className="text-xs text-[#8C8C8C] mt-1">
                      {frequencyLabel[s.frequency] ?? s.frequency.toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ActionButtons isActive={isActive} />
                  </div>
                </div>
              </div>

              {/* Mobile: amount + actions row */}
              <div className="flex md:hidden items-center justify-between mt-3 pt-3 border-t border-[#F5F5F5]">
                <div>
                  <span className="text-xl font-bold text-[#055A46]">${s.amount}</span>
                  <span className="text-xs text-[#8C8C8C] ml-1.5">
                    {frequencyLabel[s.frequency] ?? s.frequency.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ActionButtons isActive={isActive} />
                </div>
              </div>

              {/* Bottom: next donation + total */}
              <div className="mt-3 pt-3 border-t border-[#F0F0F0] flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#8C8C8C]">
                <span className="inline-flex items-center gap-1.5">
                  {ClockIcon}
                  Next donation:&nbsp;
                  <span className="font-semibold text-[#383838]">{s.next}</span>
                </span>
                <span className="flex items-center gap-1">
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

function ActionButtons({ isActive }) {
  return (
    <>
      <button
        type="button"
        title={isActive ? "Pause" : "Resume"}
        className="w-8 h-8 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#8C8C8C] hover:border-[#055A46]/40 hover:text-[#055A46] hover:bg-[#ECF9F3] transition-colors cursor-pointer"
      >
        {isActive ? PauseIcon : PlayIcon}
      </button>
      <button
        type="button"
        title="Edit"
        className="w-8 h-8 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#8C8C8C] hover:border-[#055A46]/40 hover:text-[#055A46] hover:bg-[#ECF9F3] transition-colors cursor-pointer"
      >
        {EditIcon}
      </button>
      <button
        type="button"
        title="Cancel"
        className="w-8 h-8 rounded-lg border border-[#EBEBEB] flex items-center justify-center text-[#8C8C8C] hover:border-[#EA3335]/40 hover:text-[#EA3335] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
      >
        {TrashIcon}
      </button>
    </>
  );
}
