"use client";

const styles = {
  draft: "bg-[#F3F4F6] text-[#6B7280]",
  published: "bg-[#ECFDF5] text-[#047857]",
  archived: "bg-[#FEF3C7] text-[#92400E]",
};

const labels = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const StatusPill = ({ status }) => {
  const key = String(status || "draft").toLowerCase();
  const cls = styles[key] || styles.draft;
  const label = labels[key] || key.charAt(0).toUpperCase() + key.slice(1);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default StatusPill;

