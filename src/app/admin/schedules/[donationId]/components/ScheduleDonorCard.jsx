"use client";

export default function ScheduleDonorCard({ schedule, loading = false }) {
  const donorDisplay = schedule?.donorDisplay && typeof schedule.donorDisplay === "object" ? schedule.donorDisplay : null;
  const label = String(donorDisplay?.label || "—");
  const email = donorDisplay?.email ? String(donorDisplay.email) : "";
  const initials = label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111827]/10 text-[12px] font-semibold text-[#111827]">
            {loading ? "—" : initials || "—"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-[#111827]">{loading ? "Loading..." : label}</div>
            <div className="mt-1 truncate text-[12px] text-[#6B7280]">{loading ? "—" : email || "—"}</div>
          </div>
        </div>

        <div className="text-[12px] text-[#6B7280]">View Full Profile</div>
      </div>
    </section>
  );
}

