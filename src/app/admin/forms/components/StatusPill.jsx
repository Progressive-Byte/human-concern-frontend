"use client";

const styles = {
  draft: "bg-[#F3F4F6] text-[#6B7280]",
  published: "bg-[#ECFDF5] text-[#047857]",
  archived: "bg-[#FEF3C7] text-[#92400E]",
};

export default function StatusPill({ status }) {
  const key = String(status || "draft").toLowerCase();
  const cls = styles[key] || styles.draft;
  const label = key ? key : "draft";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

