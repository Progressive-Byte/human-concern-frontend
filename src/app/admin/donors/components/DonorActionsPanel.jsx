"use client";

function ActionButton({ label, icon, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2 rounded-xl bg-[#F3F4F6] px-4 py-3 text-left text-[13px] font-semibold text-[#111827] transition hover:bg-[#E5E7EB] disabled:opacity-60 disabled:hover:bg-[#F3F4F6]"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#111827]">{icon}</span>
      <span className="min-w-0">{label}</span>
    </button>
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 6l1 16h10l1-16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 9l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="h-5 w-40 animate-pulse rounded bg-[#F3F4F6]" />
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-14 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-14 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-14 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-14 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-14 animate-pulse rounded-xl bg-[#F3F4F6]" />
        <div className="h-14 animate-pulse rounded-xl bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

export default function DonorActionsPanel({ donor, loading, onSendEmail, onToggleStatus, onEditProfile }) {
  if (loading) return <Skeleton />;

  const active = String(donor?.status || "").toLowerCase() === "active";

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <div className="text-[16px] font-semibold text-[#111827]">Admin Actions</div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <ActionButton label="Send Email" icon={<MailIcon />} onClick={onSendEmail} />
        <ActionButton label={active ? "Suspend Account" : "Activate Account"} icon={<ShieldIcon />} onClick={onToggleStatus} />
        <ActionButton label="Generate Report" icon={<FileIcon />} disabled />
        <ActionButton label="Edit Profile" icon={<EditIcon />} onClick={onEditProfile} disabled={!onEditProfile} />
        <ActionButton label="Delete Account" icon={<TrashIcon />} disabled />
        <ActionButton label="Export Data" icon={<DownloadIcon />} disabled />
      </div>
    </section>
  );
}
