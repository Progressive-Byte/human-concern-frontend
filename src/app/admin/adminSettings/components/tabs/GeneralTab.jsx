"use client";

import SettingsSectionCard from "../SettingsSectionCard";

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

function SaveButton({ onClick, disabled, children }) {
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
      {children}
    </button>
  );
}

function OrgIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M4 21V5a2 2 0 0 1 2-2h7v18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 8h5a2 2 0 0 1 2 2v11H13V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 7h2M7 11h2M7 15h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9z" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3a15 15 0 0 1 0 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3a15 15 0 0 0 0 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TipIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 2a7 7 0 0 0-4 12.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function GeneralTab({ value, onChange, loading, saving, onSaveOrganization, onSaveLocalization }) {
  const organization = value?.organization || {};
  const localization = value?.localization || {};

  return (
    <div className="space-y-6">
      <SettingsSectionCard icon={<OrgIcon />} title="Organization Details" subtitle="Basic information about your organization">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Organization Name">
            <TextInput
              value={organization.organizationName || ""}
              onChange={(e) => onChange?.((prev) => ({ ...prev, organization: { ...(prev?.organization || {}), organizationName: e.target.value } }))}
              placeholder="Organization name"
              disabled={loading}
            />
          </Field>
          <Field label="Tax ID / EIN">
            <TextInput
              value={organization.taxId || ""}
              onChange={(e) => onChange?.((prev) => ({ ...prev, organization: { ...(prev?.organization || {}), taxId: e.target.value } }))}
              placeholder="XX-XXXXXXX"
              disabled={loading}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Address">
              <TextInput
                value={organization.address || ""}
                onChange={(e) => onChange?.((prev) => ({ ...prev, organization: { ...(prev?.organization || {}), address: e.target.value } }))}
                placeholder="123 Charity Lane, City, State, ZIP"
                disabled={loading}
              />
            </Field>
          </div>
          <Field label="Phone">
            <TextInput
              value={organization.phone || ""}
              onChange={(e) => onChange?.((prev) => ({ ...prev, organization: { ...(prev?.organization || {}), phone: e.target.value } }))}
              placeholder="+1 (555) 123-4567"
              disabled={loading}
            />
          </Field>
          <Field label="Contact Email">
            <TextInput
              value={organization.contactEmail || ""}
              onChange={(e) => onChange?.((prev) => ({ ...prev, organization: { ...(prev?.organization || {}), contactEmail: e.target.value } }))}
              placeholder="contact@example.org"
              disabled={loading}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Timezone">
              <SelectInput
                value={organization.timezone || ""}
                onChange={(e) => onChange?.((prev) => ({ ...prev, organization: { ...(prev?.organization || {}), timezone: e.target.value } }))}
                disabled={loading}
              >
                <option value="">Select timezone</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="America/Denver">America/Denver</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="UTC">UTC</option>
              </SelectInput>
            </Field>
          </div>
        </div>

        <div className="mt-6">
          <SaveButton onClick={onSaveOrganization} disabled={saving || loading}>
            Save Changes
          </SaveButton>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard icon={<TipIcon />} title="Tipping" subtitle="Customize the tip text shown to donors">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Tip Label">
            <TextInput
              value={organization.tipLabel || ""}
              onChange={(e) => onChange?.((prev) => ({ ...prev, organization: { ...(prev?.organization || {}), tipLabel: e.target.value } }))}
              placeholder="Platform Support Fees"
              disabled={loading}
            />
          </Field>

          <Field label="Tip Description">
            <TextInput
              value={organization.tipDescription || ""}
              onChange={(e) => onChange?.((prev) => ({ ...prev, organization: { ...(prev?.organization || {}), tipDescription: e.target.value } }))}
              placeholder="Voluntary support for platform maintenance"
              disabled={loading}
            />
          </Field>
        </div>

        <div className="mt-6">
          <SaveButton onClick={onSaveOrganization} disabled={saving || loading}>
            Save Changes
          </SaveButton>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard icon={<GlobeIcon />} title="Localization" subtitle="Language and currency preferences">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Default Language">
            <SelectInput
              value={localization.defaultLanguage || ""}
              onChange={(e) => onChange?.((prev) => ({ ...prev, localization: { ...(prev?.localization || {}), defaultLanguage: e.target.value } }))}
              disabled={loading}
            >
              <option value="">Select language</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="ar">Arabic</option>
              <option value="fr">French</option>
            </SelectInput>
          </Field>

          <Field label="Default Currency">
            <SelectInput
              value={localization.defaultCurrency || ""}
              onChange={(e) => onChange?.((prev) => ({ ...prev, localization: { ...(prev?.localization || {}), defaultCurrency: e.target.value } }))}
              disabled={loading}
            >
              <option value="">Select currency</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </SelectInput>
          </Field>
        </div>

        <div className="mt-6">
          <SaveButton onClick={onSaveLocalization} disabled={saving || loading}>
            Save Changes
          </SaveButton>
        </div>
      </SettingsSectionCard>
    </div>
  );
}

