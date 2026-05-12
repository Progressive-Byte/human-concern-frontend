"use client";

export default function ScheduleAllocatedCausesCard({ allocatedCauses, loading = false }) {
  const causes = Array.isArray(allocatedCauses?.causes) ? allocatedCauses.causes : Array.isArray(allocatedCauses?.items) ? allocatedCauses.items : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-[#111827]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#6B7280]" fill="none">
          <path
            d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Allocated Causes
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#F3F4F6]">
        {loading ? (
          <div className="px-4 py-4 text-sm text-[#6B7280]">Loading...</div>
        ) : causes.length === 0 ? (
          <div className="px-4 py-4 text-sm text-[#6B7280]">No causes.</div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {causes.map((c, idx) => {
              const name = String(c?.name || c?.label || "—");
              const type = c?.causeType ? String(c.causeType) : "";
              return (
                <div key={`${idx}-${name}`} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-[#111827]">{name}</div>
                    {type ? <div className="mt-1 text-[12px] text-[#6B7280]">{type}</div> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

