import { formatCurrency } from "@/utils/helpers";

function ScheduleStatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  const cls =
    s === "active"
      ? "bg-[#ECFDF5] text-[#047857]"
      : s === "paused"
        ? "bg-[#FEF3C7] text-[#92400E]"
        : s === "cancelled" || s === "canceled"
          ? "bg-[#FEF2F2] text-[#991B1B]"
          : "bg-[#F3F4F6] text-[#6B7280]";
  const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${cls}`}>{label}</span>;
}

function Skeleton() {
  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="h-5 w-44 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="space-y-3 px-5 py-4">
        <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      </div>
    </section>
  );
}

function formatFrequency(value) {
  const s = String(value || "").toLowerCase();
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatShortDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function DonorSchedulesCard({ schedules, loading, onViewAll }) {
  if (loading) return <Skeleton />;

  const rows = Array.isArray(schedules?.data) ? schedules.data : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Active Schedules</div>
        <button
          type="button"
          onClick={onViewAll}
          disabled={!onViewAll}
          className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-[12px] font-semibold text-[#111827] transition hover:bg-[#E5E7EB] disabled:opacity-60 disabled:hover:bg-[#F3F4F6]"
        >
          View All
        </button>
      </div>
      <div className="border-t border-[#F3F4F6]" />
      {rows.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-[#6B7280]">No active schedules.</div>
      ) : (
        <div className="px-5 py-4">
          <div className="space-y-3">
            {rows.slice(0, 6).map((sch, idx) => {
              const causeName = String(sch?.cause?.name || sch?.causeName || "—");
              const amount = Number(sch?.amount || 0);
              const frequency = formatFrequency(sch?.frequency);
              const status = sch?.status;
              const nextBilling = sch?.nextBillingDate || null;
              return (
                <div key={`${causeName}-${idx}`} className="flex items-center justify-between gap-3 rounded-xl bg-[#F9FAFB] px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-[#111827]">{causeName}</div>
                    <div className="mt-1 text-[12px] text-[#6B7280]">{formatCurrency(amount)} • {frequency}</div>
                    <div className="mt-1 text-[12px] text-[#6B7280]">Next billing: {formatShortDate(nextBilling)}</div>
                  </div>
                  <div className="shrink-0">
                    <ScheduleStatusPill status={status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
