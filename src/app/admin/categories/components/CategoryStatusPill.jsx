export default function CategoryStatusPill({ status }) {
  const s = String(status || "").toLowerCase();

  const cls =
    s === "active"
      ? "bg-[#ECFDF5] text-[#047857]"
      : s === "inactive"
        ? "bg-[#F3F4F6] text-[#6B7280]"
        : "bg-[#F3F4F6] text-[#6B7280]";

  const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${cls}`}>{label}</span>;
}

