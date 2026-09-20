import { formatCurrency, formatDate } from "@/utils/helpers";

const STATUS_FILTERS = [
  { key: "active", label: "Active" },
  { key: "all", label: "All" },
];

function ScheduleStatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  const cls =
    s === "active"
      ? "bg-[#ECFDF5] text-[#047857]"
      : s === "paused"
        ? "bg-[#FEF3C7] text-[#92400E]"
        : s === "cancelled" || s === "canceled"
          ? "bg-[#FEF2F2] text-[#991B1B]"
          : s === "completed"
            ? "bg-[#EFF6FF] text-[#1D4ED8]"
            : "bg-[#F3F4F6] text-[#6B7280]";
  const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${cls}`}>{label}</span>;
}

function Skeleton() {
  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="h-5 w-52 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="space-y-3 px-5 py-4">
        <div className="h-16 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-16 animate-pulse rounded-xl bg-[#F3F4F6]" />
      </div>
    </section>
  );
}

function MetaItem({ label, value }) {
  if (!value) return null;
  return (
    <span className="text-[12px] text-[#6B7280]">
      {label}: <span className="font-medium text-[#374151]">{value}</span>
    </span>
  );
}

const DonorSchedulesCard = ({ schedules, loading, status = "active", onStatusChange, onViewAll }) => {
  if (loading) return <Skeleton />;

  const rows = Array.isArray(schedules?.data) ? schedules.data : [];
  const summary = schedules?.summary || null;

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Recurring Schedules</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-[#F3F4F6] p-1">
            {STATUS_FILTERS.map((f) => {
              const active = status === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => onStatusChange?.(f.key)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${
                    active ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onViewAll}
            disabled={!onViewAll}
            className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-[12px] font-semibold text-[#111827] transition hover:bg-[#E5E7EB] disabled:opacity-60 disabled:hover:bg-[#F3F4F6]"
          >
            View All
          </button>
        </div>
      </div>
      <div className="border-t border-[#F3F4F6]" />

      {summary ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 pt-3 text-[12px] text-[#6B7280]">
          <span>Active: <span className="font-semibold text-[#111827]">{summary.activeSchedules ?? 0}</span></span>
          <span>Paused: <span className="font-semibold text-[#111827]">{summary.pausedSchedules ?? 0}</span></span>
          <span>Cancelled: <span className="font-semibold text-[#111827]">{summary.cancelledSchedules ?? 0}</span></span>
          <span>Completed: <span className="font-semibold text-[#111827]">{summary.completedSchedules ?? 0}</span></span>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-[#6B7280]">No schedules found.</div>
      ) : (
        <div className="space-y-3 px-5 py-4">
          {rows.map((sch, idx) => {
            const title = String(sch?.fundLabel || sch?.campaignName || "Recurring donation");
            const baseAmount = Number(sch?.baseAmount || 0);
            const nextAmount = sch?.nextAmount ?? sch?.installmentAmount;
            const currency = String(sch?.currency || "USD");
            const designation = sch?.designationCode ? `Designation ${sch.designationCode}` : "";
            const fund = sch?.fundCode ? `Fund ${sch.fundCode}` : "";
            const fundMeta = [fund, designation].filter(Boolean).join(" · ");
            const payment = [sch?.paymentMethod, sch?.paymentMask].filter(Boolean).join(" ").trim();
            const term = [sch?.startDate ? formatDate(sch.startDate) : "", sch?.endDate ? formatDate(sch.endDate) : ""]
              .filter(Boolean)
              .join(" → ");

            return (
              <div key={sch?.scheduleId || `${title}-${idx}`} className="rounded-xl bg-[#F9FAFB] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-[#111827]">{title}</div>
                    <div className="mt-1 text-[12px] text-[#6B7280]">
                      {formatCurrency(baseAmount, currency)} · {sch?.frequencyLabel || "Custom"}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ScheduleStatusPill status={sch?.scheduleStatus} />
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <MetaItem
                    label="Next charge"
                    value={
                      sch?.nextDueDate
                        ? `${formatDate(sch.nextDueDate)}${typeof nextAmount === "number" ? ` · ${formatCurrency(nextAmount, currency)}` : ""}`
                        : "—"
                    }
                  />
                  <MetaItem label="Campaign" value={sch?.campaignName} />
                  <MetaItem label="Form" value={sch?.formName} />
                  <MetaItem label="Fund" value={fundMeta} />
                  <MetaItem label="Payment" value={payment || (sch?.paymentMethod ? "" : "Card on file")} />
                  <MetaItem label="Term" value={term} />
                  <MetaItem
                    label="Installments"
                    value={
                      sch?.installmentCount
                        ? `${sch.paidCount || 0}/${sch.installmentCount} paid`
                        : null
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DonorSchedulesCard;
