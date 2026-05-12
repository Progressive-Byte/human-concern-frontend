"use client";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function iconFor(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("processed") || t.includes("succeeded")) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function ScheduleRecentActivityCard({ items = [], loading = false }) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#6B7280]" fill="none">
          <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8z" stroke="currentColor" strokeWidth="2" />
        </svg>
        Recent Activity
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-xl bg-[#F9FAFB] px-4 py-4 text-sm text-[#6B7280]">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl bg-[#F9FAFB] px-4 py-4 text-sm text-[#6B7280]">No activity.</div>
        ) : (
          rows.slice(0, 6).map((ev, idx) => {
            const summary = String(ev?.summary || ev?.description || ev?.message || "Activity");
            const at = ev?.at || ev?.timestamp || ev?.createdAt || null;
            const type = ev?.type || "";
            return (
              <div key={`${idx}-${summary}`} className="flex items-start gap-3 rounded-xl bg-[#F9FAFB] px-4 py-3">
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#111827]">
                  {iconFor(type)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[#111827]">{summary}</div>
                  <div className="mt-1 text-[12px] text-[#6B7280]">{formatDateTime(at)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

