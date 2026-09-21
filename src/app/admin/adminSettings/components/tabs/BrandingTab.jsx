"use client";

import { useRef } from "react";
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

function normalizeHex(value) {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) return v;
  if (/^[0-9a-fA-F]{6}$/.test(v)) return `#${v}`;
  if (/^[0-9a-fA-F]{3}$/.test(v)) return `#${v}`;
  return v;
}

function ColorPickerField({ label, value, onChange, disabled }) {
  const hex = normalizeHex(value);
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(hex) || /^#[0-9a-fA-F]{3}$/.test(hex) ? hex : "#ffffff";

  return (
    <div>
      <div className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</div>
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 rounded-xl border border-[#E5E7EB]" style={{ backgroundColor: safeColor }}>
          <input
            type="color"
            value={safeColor}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            aria-label={`${label} picker`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </div>
        <TextInput value={hex} onChange={(e) => onChange?.(e.target.value)} placeholder="#0ea5e9" disabled={disabled} />
      </div>
    </div>
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
      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
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

function resolveBrandingSrc(path) {
  const p = String(path || "");
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${siteUrl}${p}`;
  return p;
}

/**
 * One brand-image slot (picker + optional preview). Rendered twice — the logo and the favicon are
 * separate uploads feeding separate places, so they get the same UI without sharing state.
 */
function ImageUploadField({
  label,
  hint,
  uploadLabel,
  previewAlt,
  previewSize = "h-12",
  path,
  busy,
  disabled,
  inputRef,
  onUpload,
  onRemove,
}) {
  const src = resolveBrandingSrc(path);
  return (
    <div>
      <div className="text-[13px] font-semibold text-[#111827]">{label}</div>
      {hint ? <div className="mt-1 text-[12px] text-[#6B7280]">{hint}</div> : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#6B7280]">
          <UploadIcon />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload?.(f);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click?.()}
          disabled={disabled || busy}
          className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          {uploadLabel}
        </button>

        {path ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled || busy}
            className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
      </div>

      {src ? (
        <div className="mt-4">
          <img
            src={src}
            alt={previewAlt}
            className={`w-auto rounded-lg border border-[#E5E7EB] bg-white p-2 ${previewSize}`}
          />
        </div>
      ) : null}
    </div>
  );
}

const BrandingTab = ({ value, onChange, loading, saving, logoBusy, onUploadLogo, onRemoveLogo, faviconBusy, onUploadFavicon, onRemoveFavicon, onSave }) => {
  const v = value || {};
  const branding = v?.branding && typeof v.branding === "object" ? v.branding : v;
  const logoRef = useRef(null);
  const faviconRef = useRef(null);

  const logoPath = branding?.logo?.path ? String(branding.logo.path) : "";
  const faviconPath = branding?.favicon?.path ? String(branding.favicon.path) : "";

  const primaryColor = String(branding?.primaryColor || "");
  const accentColor = String(branding?.accentColor || "");
  const customCss = String(branding?.customCss || "");

  return (
    <SettingsSectionCard icon={<BrandingIcon />} title="Branding" subtitle="Customize your platform appearance">
      <div className="space-y-6">
        <ImageUploadField
          label="Logo"
          hint="Shown in the site header, footer and admin sidebar."
          uploadLabel="Upload Logo"
          previewAlt="Branding logo"
          previewSize="h-12"
          path={logoPath}
          busy={logoBusy}
          disabled={loading}
          inputRef={logoRef}
          onUpload={onUploadLogo}
          onRemove={onRemoveLogo}
        />

        <ImageUploadField
          label="Favicon"
          hint="The small icon shown in the browser tab."
          uploadLabel="Upload Favicon"
          previewAlt="Branding favicon"
          previewSize="h-12 w-12"
          path={faviconPath}
          busy={faviconBusy}
          disabled={loading}
          inputRef={faviconRef}
          onUpload={onUploadFavicon}
          onRemove={onRemoveFavicon}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ColorPickerField
            label="Primary Color"
            value={primaryColor}
            disabled={loading}
            onChange={(next) =>
              onChange?.((prev) => {
                const p = prev || {};
                if (p?.branding && typeof p.branding === "object") {
                  return { ...p, branding: { ...p.branding, primaryColor: next } };
                }
                return { ...p, primaryColor: next };
              })
            }
          />

          <ColorPickerField
            label="Accent Color"
            value={accentColor}
            disabled={loading}
            onChange={(next) =>
              onChange?.((prev) => {
                const p = prev || {};
                if (p?.branding && typeof p.branding === "object") {
                  return { ...p, branding: { ...p.branding, accentColor: next } };
                }
                return { ...p, accentColor: next };
              })
            }
          />
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
export default BrandingTab;
