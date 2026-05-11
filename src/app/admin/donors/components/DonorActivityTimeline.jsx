import { formatCurrency } from "@/utils/helpers";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function Skeleton() {
  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <div className="h-5 w-44 animate-pulse rounded bg-[#F3F4F6]" />
      </div>
      <div className="border-t border-[#F3F4F6]" />
      <div className="space-y-3 px-5 py-4">
        <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
      </div>
    </section>
  );
}

export default function DonorActivityTimeline({ activity, loading }) {
  if (loading) return <Skeleton />;

  const rows = Array.isArray(activity?.data) ? activity.data : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="text-[18px] font-semibold text-[#111827]">Activity Timeline</div>
      </div>
      <div className="border-t border-[#F3F4F6]" />
      {rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No activity yet.</div>
      ) : (
        <div className="px-5 py-4">
          <div className="space-y-4">
            {rows.map((ev, idx) => {
              const summary = String(ev?.summary || ev?.description || ev?.message || "Activity");
              const ts = ev?.at || ev?.timestamp || ev?.createdAt || ev?.time || null;
              const meta = ev?.meta && typeof ev.meta === "object" ? ev.meta : null;
              const formName = typeof meta?.formName === "string" ? meta.formName : "";
              const amount = meta?.amount ?? ev?.amount;
              const currency = String(meta?.currency || ev?.currency || "USD");
              const showAmount = typeof amount === "number" && Number.isFinite(amount);
              return (
                <div key={`${idx}-${summary}`} className="flex items-start gap-3">
                  <div className="mt-1.5 flex h-3 w-3 items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl bg-[#F9FAFB] px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0 truncate text-[13px] font-semibold text-[#111827]">{summary}</div>
                      <div className="shrink-0 text-[12px] text-[#6B7280]">{formatDateTime(ts)}</div>
                    </div>
                    {formName ? <div className="mt-1 text-[12px] text-[#6B7280]">{formName}</div> : null}
                    {showAmount ? <div className="mt-1 text-[12px] font-semibold text-[#111827]">{formatCurrency(amount, currency)}</div> : null}
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
