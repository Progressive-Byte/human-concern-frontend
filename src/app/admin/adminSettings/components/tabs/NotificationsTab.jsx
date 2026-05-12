"use client";

import SettingsSectionCard from "../SettingsSectionCard";

function ToggleSwitch({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(enabled)}
      disabled={disabled}
      onClick={() => onChange?.(!enabled)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-60 ${
        enabled ? "bg-[#111827]" : "bg-[#D1D5DB]"
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SaveButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#111827]/90 disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 3v5h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      Save Changes
    </button>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M4 6h16v12H4V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function NotificationsTab({ value, onChange, loading, saving, onSave }) {
  const v = value || {};

  const rows = [
    { key: "emailEnabled", title: "Email Notifications", desc: "Receive notifications via email" },
    { key: "newDonationReceived", title: "New donation received", desc: "" },
    { key: "campaignGoalReached", title: "Campaign goal reached", desc: "" },
    { key: "newDonorRegistration", title: "New donor registration", desc: "" },
    { key: "failedTransaction", title: "Failed transaction", desc: "" },
    { key: "weeklySummaryReport", title: "Weekly summary report", desc: "" },
  ];

  return (
    <SettingsSectionCard icon={<MailIcon />} title="Email Notifications" subtitle="Configure email notification preferences">
      <div className="space-y-5">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-6 border-b border-[#F3F4F6] pb-5 last:border-b-0 last:pb-0">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-[#111827]">{r.title}</div>
              {r.desc ? <div className="mt-1 text-[12px] text-[#6B7280]">{r.desc}</div> : null}
            </div>
            <ToggleSwitch
              enabled={Boolean(v[r.key])}
              onChange={(next) => onChange?.((prev) => ({ ...(prev || {}), [r.key]: Boolean(next) }))}
              disabled={loading}
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <SaveButton onClick={onSave} disabled={saving || loading} />
      </div>
    </SettingsSectionCard>
  );
}

