const styles = {
  draft: "bg-[#F3F4F6] text-[#6B7280]",
  published: "bg-[#ECFDF5] text-[#047857]",
  archived: "bg-[#F3F4F6] text-[#6B7280]",
};

export default function StatusPill({ status }) {
  const key = String(status || "").toLowerCase();
  const className = styles[key] || "bg-[#F3F4F6] text-[#6B7280]";
  const label = key || "—";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${className}`.trim()}>
      {label}
    </span>
  );
}

