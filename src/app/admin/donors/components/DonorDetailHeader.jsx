"use client";

function initialsFrom(value) {
  const s = String(value || "").trim();
  if (!s) return "—";
  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  const out = `${first}${last}`.toUpperCase();
  return out || "—";
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function StatusChip({ status }) {
  const s = String(status || "").toLowerCase();
  const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
  const cls =
    s === "active"
      ? "bg-[#ECFDF5] text-[#047857]"
      : s === "inactive"
        ? "bg-[#F3F4F6] text-[#6B7280]"
        : "bg-[#F3F4F6] text-[#6B7280]";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold ${cls}`}>
      <span className={`h-2 w-2 rounded-full ${s === "active" ? "bg-[#10B981]" : s === "inactive" ? "bg-[#9CA3AF]" : "bg-[#9CA3AF]"}`} />
      {label}
    </span>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M4 6h16v12H4V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M7 2v3M17 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 8h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Skeleton() {
  return (
    <section className="hc-animate-fade-up relative overflow-hidden rounded-2xl bg-[#6B7280] p-6 text-white">
      <div className="pointer-events-none absolute -right-24 top-1/2 h-[240px] w-[240px] -translate-y-1/2 rounded-full bg-black/10" />
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 animate-pulse rounded-full bg-white/15" />
          <div className="min-w-0">
            <div className="h-7 w-56 animate-pulse rounded bg-white/15" />
            <div className="mt-2 h-4 w-40 animate-pulse rounded bg-white/15" />
          </div>
        </div>
        <div className="h-11 w-36 animate-pulse rounded-xl bg-white/15" />
      </div>
    </section>
  );
}

export default function DonorDetailHeader({ donor, loading, onSendEmail }) {
  if (loading) return <Skeleton />;

  const name =
    String(donor?.name || "").trim() ||
    String([donor?.firstName, donor?.lastName].filter(Boolean).join(" ")).trim() ||
    String(donor?.email || "").trim() ||
    "Donor";
  const email = String(donor?.email || "").trim();
  const phone = String(donor?.phone || "").trim();
  const createdAt = donor?.createdAt || null;
  const emailOrPhone = email || phone || "—";

  return (
    <section className="hc-animate-fade-up relative overflow-hidden rounded-2xl bg-[#6B7280] p-6 text-white">
      <div className="pointer-events-none absolute -right-24 top-1/2 h-[240px] w-[240px] -translate-y-1/2 rounded-full bg-black/10" />

      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[22px] font-semibold">
            {initialsFrom(name)}
          </div>

          <div className="min-w-0">
            <div className="truncate text-[28px] font-semibold leading-none">{name}</div>

            <div className="mt-3 flex flex-wrap items-center gap-5 text-[13px] text-white/85">
              <span className="inline-flex items-center gap-2">
                <MailIcon />
                <span className="truncate">{emailOrPhone}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarIcon />
                <span>
                  Member since <span className="font-semibold text-white">{formatDate(createdAt)}</span>
                </span>
              </span>
              <StatusChip status={donor?.status} />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSendEmail?.()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 bg-transparent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/10 md:self-center"
        >
          <MailIcon />
          Send Email
        </button>
      </div>
    </section>
  );
}
