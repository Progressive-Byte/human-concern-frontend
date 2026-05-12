"use client";

import { useMemo, useRef } from "react";
import { siteUrl } from "@/utils/constants";
import SettingsSectionCard from "../SettingsSectionCard";

function BrandingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 3a5 5 0 0 1 5 5c0 2.5-1.5 4.5-4 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
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

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[120px] rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 ${props.className || ""}`.trim()}
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

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 9l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function BrandingTab({ value, onChange, loading, saving, logoBusy, onUploadLogo, onRemoveLogo, onSave }) {
  const v = value || {};
  const branding = v?.branding && typeof v.branding === "object" ? v.branding : v;
  const fileRef = useRef(null);

  const logoPath = branding?.logo?.path ? String(branding.logo.path) : "";
  const logoSrc = useMemo(() => {
    if (!logoPath) return "";
    if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;
    if (logoPath.startsWith("/")) return `${siteUrl}${logoPath}`;
    return logoPath;
  }, [logoPath]);

  const primaryColor = String(branding?.primaryColor || "");
  const accentColor = String(branding?.accentColor || "");
  const customCss = String(branding?.customCss || "");

  return (
    <SettingsSectionCard icon={<BrandingIcon />} title="Branding" subtitle="Customize your platform appearance">
      <div className="space-y-6">
        <div>
          <div className="text-[13px] font-semibold text-[#111827]">Logo</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#6B7280]">
              <UploadIcon />
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadLogo?.(f);
                e.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click?.()}
              disabled={loading || logoBusy}
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
            >
              Upload Logo
            </button>

            {logoPath ? (
              <button
                type="button"
                onClick={onRemoveLogo}
                disabled={loading || logoBusy}
                className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
              >
                Remove
              </button>
            ) : null}
          </div>

          {logoSrc ? (
            <div className="mt-4">
              <img src={logoSrc} alt="Branding logo" className="h-12 w-auto rounded-lg border border-[#E5E7EB] bg-white p-2" />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Primary Color</div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-[#E5E7EB]" style={{ backgroundColor: primaryColor || "#ffffff" }} />
              <TextInput
                value={primaryColor}
                onChange={(e) =>
                  onChange?.((prev) => {
                    const p = prev || {};
                    if (p?.branding && typeof p.branding === "object") {
                      return { ...p, branding: { ...p.branding, primaryColor: e.target.value } };
                    }
                    return { ...p, primaryColor: e.target.value };
                  })
                }
                placeholder="#0ea5e9"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Accent Color</div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-[#E5E7EB]" style={{ backgroundColor: accentColor || "#ffffff" }} />
              <TextInput
                value={accentColor}
                onChange={(e) =>
                  onChange?.((prev) => {
                    const p = prev || {};
                    if (p?.branding && typeof p.branding === "object") {
                      return { ...p, branding: { ...p.branding, accentColor: e.target.value } };
                    }
                    return { ...p, accentColor: e.target.value };
                  })
                }
                placeholder="#22c55e"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <Field label="Custom CSS">
          <TextArea
            value={customCss}
            onChange={(e) =>
              onChange?.((prev) => {
                const p = prev || {};
                if (p?.branding && typeof p.branding === "object") {
                  return { ...p, branding: { ...p.branding, customCss: e.target.value } };
                }
                return { ...p, customCss: e.target.value };
              })
            }
            placeholder="/* Add custom CSS here */"
            disabled={loading}
          />
        </Field>

        <div>
          <SaveButton onClick={onSave} disabled={saving || loading} />
        </div>
      </div>
    </SettingsSectionCard>
  );
}
