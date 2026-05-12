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

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</div>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 ${props.className || ""}`.trim()}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 ${props.className || ""}`.trim()}
    />
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SecurityTab({ value, onChange, loading, saving, passwordForm, onChangePasswordForm, onSave }) {
  const v = value || {};
  const sessionTimeoutMinutes = v.sessionTimeoutMinutes ?? "";
  const twoFactorEnabled = Boolean(v.twoFactorEnabled);

  const timeouts = [5, 10, 15, 30, 60, 120, 240, 480, 720, 1440];

  return (
    <SettingsSectionCard icon={<ShieldIcon />} title="Security Settings" subtitle="Configure security and authentication options">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-6 border-b border-[#F3F4F6] pb-5">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#111827]">Two-Factor Authentication</div>
            <div className="mt-1 text-[12px] text-[#6B7280]">Add an extra layer of security</div>
          </div>
          <ToggleSwitch enabled={twoFactorEnabled} onChange={(next) => onChange?.((prev) => ({ ...(prev || {}), twoFactorEnabled: Boolean(next) }))} disabled={loading} />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-[#F3F4F6] pb-5">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#111827]">Session Timeout</div>
            <div className="mt-1 text-[12px] text-[#6B7280]">Automatically log out after inactivity</div>
          </div>
          <div className="w-full md:w-[180px]">
            <SelectInput
              value={sessionTimeoutMinutes === "" ? "" : String(sessionTimeoutMinutes)}
              onChange={(e) => onChange?.((prev) => ({ ...(prev || {}), sessionTimeoutMinutes: Number(e.target.value) }))}
              disabled={loading}
            >
              <option value="">Select</option>
              {timeouts.map((m) => (
                <option key={m} value={String(m)}>
                  {m} minutes
                </option>
              ))}
            </SelectInput>
          </div>
        </div>

        <div>
          <div className="text-[13px] font-semibold text-[#111827]">Change Password</div>
          <div className="mt-1 text-[12px] text-[#6B7280]">Update your account password</div>

          <div className="mt-4 space-y-3">
            <Field label="">
              <TextInput
                type="password"
                value={passwordForm?.currentPassword || ""}
                onChange={(e) => onChangePasswordForm?.((prev) => ({ ...(prev || {}), currentPassword: e.target.value }))}
                placeholder="Current password"
                disabled={loading}
              />
            </Field>
            <Field label="">
              <TextInput
                type="password"
                value={passwordForm?.newPassword || ""}
                onChange={(e) => onChangePasswordForm?.((prev) => ({ ...(prev || {}), newPassword: e.target.value }))}
                placeholder="New password"
                disabled={loading}
              />
            </Field>
            <Field label="">
              <TextInput
                type="password"
                value={passwordForm?.confirmNewPassword || ""}
                onChange={(e) => onChangePasswordForm?.((prev) => ({ ...(prev || {}), confirmNewPassword: e.target.value }))}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <SaveButton onClick={onSave} disabled={saving || loading} />
      </div>
    </SettingsSectionCard>
  );
}

