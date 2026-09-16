"use client";

import SettingsSectionCard from "../SettingsSectionCard";

function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</div>
      {children}
      {error ? (
        <div className="mt-1.5 text-[12px] text-red-600">{error}</div>
      ) : hint ? (
        <div className="mt-1.5 text-[12px] text-[#6B7280]">{hint}</div>
      ) : null}
    </label>
  );
}

function TextInput({ invalid, ...props }) {
  return (
    <input
      {...props}
      aria-invalid={invalid ? "true" : undefined}
      className={`w-full rounded-xl border bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] ${
        invalid
          ? "border-[#EA3335] focus:border-[#EA3335]"
          : "border-[#E5E7EB] focus:border-[#111827]/30"
      } ${props.className || ""}`.trim()}
    />
  );
}

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

function SaveButton({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 3v5h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      {children}
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

function StatusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const SOURCE_LABEL = {
  admin: "Configured",
  none: "Not configured",
};

const HOSTNAME_RE = /^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors the API validator (settingsValidators.emailPatchBody) plus the service's
// "host and From Email must be set together" rule.
export function validateSmtpConfig(email) {
  const errors = {};
  const host = String(email?.host || "").trim();
  const fromEmail = String(email?.fromEmail || "").trim();
  const portRaw = String(email?.port ?? "").trim();

  if (host && !HOSTNAME_RE.test(host)) {
    errors.host = "Enter a valid hostname (no protocol, port or path).";
  }
  if (host && !fromEmail) {
    errors.fromEmail = "From Email is required when an SMTP host is set.";
  }
  if (!host && fromEmail) {
    errors.host = "SMTP host is required when a From Email is set.";
  }

  const port = Number(portRaw);
  if (!portRaw) {
    errors.port = "Port is required.";
  } else if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.port = "Port must be a whole number between 1 and 65535.";
  }

  if (fromEmail && !EMAIL_RE.test(fromEmail)) {
    errors.fromEmail = "Enter a valid email address.";
  }

  if (String(email?.fromName || "").length > 120) errors.fromName = "Maximum 120 characters.";
  if (String(email?.username || "").length > 255) errors.username = "Maximum 255 characters.";
  if (String(email?.password || "").length > 255) errors.password = "Maximum 255 characters.";

  return errors;
}

function formatDateTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
}

const EmailTab = ({ value, resolved, testTo, onChangeTestTo, onChange, loading, saving, testing, onSave, onSendTest }) => {
  const email = value || {};
  const transport = resolved || {};
  const source = String(transport.source || "none");
  const passwordSet = Boolean(email.hasPassword);

  const errors = validateSmtpConfig(email);
  const hasErrors = Object.keys(errors).length > 0;
  const testToError = testTo && !EMAIL_RE.test(String(testTo).trim()) ? "Enter a valid email address." : "";

  const handleSave = () => {
    if (hasErrors) return;
    onSave?.();
  };

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        icon={<MailIcon />}
        title="SMTP Configuration"
        subtitle="The server this platform uses to send password resets, donation receipts and donor notifications"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="SMTP Host"
            hint="Required — email cannot be sent until a host and From Email are saved."
            error={errors.host}
          >
            <TextInput
              value={email.host || ""}
              onChange={(e) => onChange?.((prev) => ({ ...(prev || {}), host: e.target.value }))}
              placeholder="smtp.example.com"
              invalid={Boolean(errors.host)}
              disabled={loading}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Port" error={errors.port}>
              <TextInput
                type="number"
                min={1}
                max={65535}
                value={email.port ?? 587}
                onChange={(e) => onChange?.((prev) => ({ ...(prev || {}), port: e.target.value }))}
                placeholder="587"
                invalid={Boolean(errors.port)}
                disabled={loading}
              />
            </Field>
            <div className="flex items-end pb-1">
              <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] px-3 py-2.5">
                <span className="text-[13px] text-[#111827]">TLS / SSL</span>
                <ToggleSwitch
                  enabled={Boolean(email.secure)}
                  onChange={(next) => onChange?.((prev) => ({ ...(prev || {}), secure: Boolean(next) }))}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <Field label="Username" hint="Leave blank for relays that authenticate by IP." error={errors.username}>
            <TextInput
              value={email.username || ""}
              onChange={(e) => onChange?.((prev) => ({ ...(prev || {}), username: e.target.value }))}
              placeholder="mailer@example.com"
              autoComplete="off"
              invalid={Boolean(errors.username)}
              disabled={loading}
            />
          </Field>
          <Field
            label="Password"
            hint={passwordSet
              ? `A password is saved (••••${email.passwordLast4 || ""}). Leave blank to keep it.`
              : "Stored encrypted. Leave blank to keep the current value."}
            error={errors.password}
          >
            <TextInput
              type="password"
              value={email.password || ""}
              onChange={(e) => onChange?.((prev) => ({ ...(prev || {}), password: e.target.value }))}
              placeholder={passwordSet ? "••••••••" : "SMTP password"}
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
              disabled={loading}
            />
          </Field>

          <Field
            label="From Name"
            hint="Defaults to your organization name from the General tab."
            error={errors.fromName}
          >
            <TextInput
              value={email.fromName || ""}
              onChange={(e) => onChange?.((prev) => ({ ...(prev || {}), fromName: e.target.value }))}
              placeholder="Helping Hands"
              invalid={Boolean(errors.fromName)}
              disabled={loading}
            />
          </Field>
          <Field
            label="From Email"
            hint="Required — this is the address donors see."
            error={errors.fromEmail}
          >
            <TextInput
              type="email"
              value={email.fromEmail || ""}
              onChange={(e) => onChange?.((prev) => ({ ...(prev || {}), fromEmail: e.target.value }))}
              placeholder="no-reply@example.com"
              invalid={Boolean(errors.fromEmail)}
              disabled={loading}
            />
          </Field>
        </div>

        <div className="mt-6">
          <SaveButton onClick={handleSave} disabled={saving || loading || hasErrors}>
            Save Changes
          </SaveButton>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={<StatusIcon />}
        title="Delivery status"
        subtitle="What the platform is actually using right now, and a way to verify it"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#E5E7EB] px-4 py-3">
            <div className="text-[12px] text-[#6B7280]">Source</div>
            <div className="mt-1 text-[13px] font-semibold text-[#111827]">{SOURCE_LABEL[source] || source}</div>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] px-4 py-3">
            <div className="text-[12px] text-[#6B7280]">Driver</div>
            <div className="mt-1 text-[13px] font-semibold text-[#111827]">{transport.driver || "—"}</div>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] px-4 py-3">
            <div className="text-[12px] text-[#6B7280]">Server</div>
            <div className="mt-1 text-[13px] font-semibold text-[#111827]">
              {transport.host ? `${transport.host}${transport.port ? `:${transport.port}` : ""}` : "—"}
            </div>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] px-4 py-3">
            <div className="text-[12px] text-[#6B7280]">From</div>
            <div className="mt-1 truncate text-[13px] font-semibold text-[#111827]" title={transport.from || ""}>
              {transport.from || "—"}
            </div>
          </div>
        </div>

        {email.lastTestAt ? (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-[13px] ${
              email.lastTestOk
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                : "border-red-500/30 bg-red-500/10 text-red-700"
            }`}
          >
            {email.lastTestOk ? "Last test email sent successfully" : "Last test email failed"} to{" "}
            {email.lastTestTo || "—"} on {formatDateTime(email.lastTestAt)}
            {!email.lastTestOk && email.lastTestError ? <div className="mt-1">{email.lastTestError}</div> : null}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field
              label="Send test to"
              hint="Leave blank to use the From Email / organization contact."
              error={testToError}
            >
              <TextInput
                type="email"
                value={testTo || ""}
                onChange={(e) => onChangeTestTo?.(e.target.value)}
                placeholder="you@example.com"
                invalid={Boolean(testToError)}
                disabled={loading || testing}
              />
            </Field>
          </div>
          <SaveButton onClick={onSendTest} disabled={testing || loading || Boolean(testToError)}>
            {testing ? "Sending…" : "Send test email"}
          </SaveButton>
        </div>
      </SettingsSectionCard>
    </div>
  );
};

export default EmailTab;
