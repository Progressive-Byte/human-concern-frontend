"use client";

const styles = {
  completed: "bg-[#ECFDF5] text-[#047857]",
  succeeded: "bg-[#ECFDF5] text-[#047857]",
  processing: "bg-[#EEF2FF] text-[#3730A3]",
  pending: "bg-[#FEF3C7] text-[#92400E]",
  failed: "bg-red-500/10 text-red-600",
  refunded: "bg-[#EEF2FF] text-[#3730A3]",
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M12 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function getIcon(key) {
  if (key === "completed" || key === "succeeded") return <CheckIcon />;
  if (key === "failed") return <XIcon />;
  if (key === "pending" || key === "processing") return <ClockIcon />;
  return null;
}

export default function DonationStatusPill({ status }) {
  const key = String(status || "").toLowerCase();
  const cls = styles[key] || "bg-[#F3F4F6] text-[#6B7280]";
  const label = key || "—";
  const icon = getIcon(key);

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold ${cls}`.trim()}>
      {icon ? <span className="inline-flex h-4 w-4 items-center justify-center">{icon}</span> : null}
      <span className="capitalize">{label}</span>
    </span>
  );
}
