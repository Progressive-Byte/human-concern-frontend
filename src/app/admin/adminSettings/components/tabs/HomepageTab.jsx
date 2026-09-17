"use client";

import { useMemo, useRef, useState } from "react";
import { siteUrl } from "@/utils/constants";
import SettingsSectionCard from "../SettingsSectionCard";

/* ── small primitives (mirrors the other settings tabs) ─────────────────── */

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
      className={`w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60 ${props.className || ""}`.trim()}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[90px] rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60 ${props.className || ""}`.trim()}
    />
  );
}

function Toggle({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(enabled)}
      disabled={disabled}
      onClick={() => onChange?.(!enabled)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
        enabled ? "bg-red-600" : "bg-[#CCCCCC]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${enabled ? "left-[22px]" : "left-0.5"}`}
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
      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
    >
      Save Changes
    </button>
  );
}

function imageSrc(path) {
  const p = String(path || "").trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${siteUrl}${p}`;
  return p;
}

/** Immutably sets a nested path (dot notation) on a plain object. */
function setIn(obj, path, value) {
  const keys = String(path).split(".");
  const clone = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const k = keys[i];
    const next = cur[k];
    cur[k] = Array.isArray(next) ? [...next] : { ...(next || {}) };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

function HomepageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V21h14V9.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 21v-6h4v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function Group({ title, subtitle, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <summary className="cursor-pointer list-none">
        <span className="text-[13px] font-semibold text-[#111827]">{title}</span>
        {subtitle ? <div className="mt-1 text-[12px] text-[#6B7280]">{subtitle}</div> : null}
      </summary>
      <div className="mt-4 space-y-4 border-t border-[#F3F4F6] pt-4">{children}</div>
    </details>
  );
}

function EnabledRow({ enabled, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
      <span className="text-[13px] font-semibold text-[#111827]">Show this section</span>
      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  );
}

/* ── image + list widgets ──────────────────────────────────────────────── */

function ImageField({ label, path, disabled, onUpload, onClear }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const src = useMemo(() => imageSrc(path), [path]);

  async function pick(file) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const next = await onUpload?.(file);
      if (next) onClear?.(next);
    } catch (e) {
      setError(e?.message || "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
      <div className="mb-2 text-[12px] font-semibold text-[#111827]">{label}</div>
      <div className="flex items-center gap-3">
        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
          {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click?.()}
          disabled={disabled || busy}
          className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
        {path ? (
          <button
            type="button"
            onClick={() => onClear?.("")}
            disabled={disabled || busy}
            className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
      </div>
      {error ? <div className="mt-2 text-[12px] text-red-600">{error}</div> : null}
    </div>
  );
}

/** A simple add / remove / reorder list of plain string rows. */
function BadgeList({ items, disabled, onChange, max = 6 }) {
  const list = Array.isArray(items) ? items : [];
  const move = (i, dir) => {
    const next = [...list];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {list.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <TextInput value={b} disabled={disabled} onChange={(e) => onChange(list.map((x, k) => (k === i ? e.target.value : x)))} />
          <button type="button" disabled={disabled} onClick={() => move(i, -1)} className="rounded-lg border border-[#E5E7EB] px-2 py-2 text-[12px]">↑</button>
          <button type="button" disabled={disabled} onClick={() => move(i, 1)} className="rounded-lg border border-[#E5E7EB] px-2 py-2 text-[12px]">↓</button>
          <button type="button" disabled={disabled} onClick={() => onChange(list.filter((_, k) => k !== i))} className="rounded-lg border border-[#E5E7EB] px-2 py-2 text-[12px] text-red-600">✕</button>
        </div>
      ))}
      {list.length < max ? (
        <button type="button" disabled={disabled} onClick={() => onChange([...list, ""])} className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-semibold text-[#111827]">
          + Add
        </button>
      ) : null}
    </div>
  );
}

/** A generic add / remove / reorder list of object rows. */
function ObjectList({ items, disabled, onChange, blank, addLabel, max, renderRow }) {
  const list = Array.isArray(items) ? items : [];
  const move = (i, dir) => {
    const next = [...list];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const setRow = (i, patch) => onChange(list.map((row, k) => (k === i ? { ...(row || {}), ...(patch || {}) } : row)));
  return (
    <div className="space-y-3">
      {list.map((row, i) => (
        <div key={i} className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B7280]">#{i + 1}</span>
            <div className="flex items-center gap-1">
              <button type="button" disabled={disabled} onClick={() => move(i, -1)} className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[12px]">↑</button>
              <button type="button" disabled={disabled} onClick={() => move(i, 1)} className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[12px]">↓</button>
              <button type="button" disabled={disabled} onClick={() => onChange(list.filter((_, k) => k !== i))} className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1 text-[12px] text-red-600">✕</button>
            </div>
          </div>
          {renderRow(row, (patch) => setRow(i, patch), i)}
        </div>
      ))}
      {(!max || list.length < max) ? (
        <button type="button" disabled={disabled} onClick={() => onChange([...list, { ...blank }])} className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[12px] font-semibold text-[#111827]">
          {addLabel || "+ Add"}
        </button>
      ) : null}
    </div>
  );
}

function ButtonFields({ prefix, button, onChange, disabled }) {
  const b = button || {};
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field label={`${prefix} label`}>
        <TextInput value={b.label || ""} disabled={disabled} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label={`${prefix} link`}>
        <TextInput value={b.href || ""} disabled={disabled} onChange={(e) => onChange({ href: e.target.value })} />
      </Field>
    </div>
  );
}

const STAT_ICONS = [
  { value: "", label: "None" },
  { value: "aid", label: "Aid delivered" },
  { value: "donor", label: "Donors" },
  { value: "country", label: "Countries" },
  { value: "impact", label: "Impact" },
];

/* ── tab ───────────────────────────────────────────────────────────────── */

const HomepageTab = ({ value, onChange, loading, saving, onSave, onUploadImage }) => {
  const homepage = value && typeof value === "object" ? value : {};
  const set = (path, next) => onChange?.((prev) => setIn(prev || {}, path, next));

  const sections = homepage.sections || {};
  const header = homepage.header || {};
  const footer = homepage.footer || {};
  const hero = sections.hero || {};
  const stats = sections.stats || {};
  const featured = sections.featured || {};
  const sharedLove = sections.sharedLove || {};
  const howItWorks = sections.howItWorks || {};
  const waysToGive = sections.waysToGive || {};
  const ctaBanner = sections.ctaBanner || {};
  const noticeBar = header.noticeBar || {};

  const imageProps = (path) => ({
    disabled: loading,
    onUpload: onUploadImage,
    onClear: (nextPath) => set(path, { ...(path.split(".").reduce((o, k) => (o ? o[k] : undefined), homepage) || {}), path: nextPath }),
  });

  return (
    <SettingsSectionCard icon={<HomepageIcon />} title="Homepage" subtitle="Edit the landing page content, images and layout">
      <div className="space-y-4">
        {/* ── Hero ── */}
        <Group title="Hero" defaultOpen>
          <EnabledRow enabled={hero.enabled !== false} onChange={(v) => set("sections.hero.enabled", v)} disabled={loading} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Title (start)">
              <TextInput value={hero.title || ""} disabled={loading} onChange={(e) => set("sections.hero.title", e.target.value)} placeholder="Give with" />
            </Field>
            <Field label="Title (accent, italic)">
              <TextInput value={hero.titleAccent || ""} disabled={loading} onChange={(e) => set("sections.hero.titleAccent", e.target.value)} placeholder="Purpose. Transform" />
            </Field>
          </div>
          <Field label="Subtitle">
            <TextArea value={hero.subtitle || ""} disabled={loading} onChange={(e) => set("sections.hero.subtitle", e.target.value)} />
          </Field>
          <ButtonFields prefix="Primary button" button={hero.primaryButton} disabled={loading} onChange={(patch) => set("sections.hero.primaryButton", { ...(hero.primaryButton || {}), ...patch })} />
          <ButtonFields prefix="Secondary button" button={hero.secondaryButton} disabled={loading} onChange={(patch) => set("sections.hero.secondaryButton", { ...(hero.secondaryButton || {}), ...patch })} />
          <ImageField label="Background image" path={hero.backgroundImage?.path} {...imageProps("sections.hero.backgroundImage")} />
          <Field label="Trust badges">
            <BadgeList items={hero.trustBadges} disabled={loading} onChange={(next) => set("sections.hero.trustBadges", next)} />
          </Field>
          <Field label="Video URL (YouTube)">
            <TextInput value={hero.videoUrl || ""} disabled={loading} onChange={(e) => set("sections.hero.videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </Field>
        </Group>

        {/* ── Stats ── */}
        <Group title="Statistics">
          <EnabledRow enabled={stats.enabled !== false} onChange={(v) => set("sections.stats.enabled", v)} disabled={loading} />
          <ObjectList
            items={stats.items}
            disabled={loading}
            max={6}
            blank={{ value: "", label: "", icon: "" }}
            addLabel="+ Add stat"
            onChange={(next) => set("sections.stats.items", next)}
            renderRow={(row, setRow) => (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <TextInput value={row.value || ""} disabled={loading} placeholder="$2.4M+" onChange={(e) => setRow({ value: e.target.value })} />
                <TextInput value={row.label || ""} disabled={loading} placeholder="Active Donors" onChange={(e) => setRow({ label: e.target.value })} />
                <select
                  value={row.icon || ""}
                  disabled={loading}
                  onChange={(e) => setRow({ icon: e.target.value })}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none"
                >
                  {STAT_ICONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}
          />
        </Group>

        {/* ── Featured campaigns ── */}
        <Group title="Featured Campaigns">
          <EnabledRow enabled={featured.enabled !== false} onChange={(v) => set("sections.featured.enabled", v)} disabled={loading} />
          <Field label="Title">
            <TextInput value={featured.title || ""} disabled={loading} onChange={(e) => set("sections.featured.title", e.target.value)} />
          </Field>
          <Field label="Subtitle">
            <TextArea value={featured.subtitle || ""} disabled={loading} onChange={(e) => set("sections.featured.subtitle", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Button label">
              <TextInput value={featured.ctaLabel || ""} disabled={loading} onChange={(e) => set("sections.featured.ctaLabel", e.target.value)} />
            </Field>
            <Field label="Button link">
              <TextInput value={featured.ctaHref || ""} disabled={loading} onChange={(e) => set("sections.featured.ctaHref", e.target.value)} />
            </Field>
          </div>
        </Group>

        {/* ── Shared love ── */}
        <Group title="#Sharedlove collage">
          <EnabledRow enabled={sharedLove.enabled !== false} onChange={(v) => set("sections.sharedLove.enabled", v)} disabled={loading} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Eyebrow">
              <TextInput value={sharedLove.eyebrow || ""} disabled={loading} onChange={(e) => set("sections.sharedLove.eyebrow", e.target.value)} />
            </Field>
            <Field label="Title">
              <TextInput value={sharedLove.title || ""} disabled={loading} onChange={(e) => set("sections.sharedLove.title", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => {
              const slot = sharedLove.images?.[i] || {};
              return (
                <ImageField
                  key={i}
                  label={`Photo ${i + 1}`}
                  path={slot.path}
                  disabled={loading}
                  onUpload={onUploadImage}
                  onClear={(nextPath) => set(`sections.sharedLove.images.${i}`, { ...(slot || {}), path: nextPath })}
                />
              );
            })}
          </div>
          <div className="text-[12px] text-[#6B7280]">
            The collage always shows 9 photos; an empty slot falls back to the built-in image.
          </div>
        </Group>

        {/* ── How it works ── */}
        <Group title="How It Works">
          <EnabledRow enabled={howItWorks.enabled !== false} onChange={(v) => set("sections.howItWorks.enabled", v)} disabled={loading} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Title">
              <TextInput value={howItWorks.title || ""} disabled={loading} onChange={(e) => set("sections.howItWorks.title", e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <TextInput value={howItWorks.subtitle || ""} disabled={loading} onChange={(e) => set("sections.howItWorks.subtitle", e.target.value)} />
            </Field>
          </div>
          <ImageField label="Section background" path={howItWorks.backgroundImage?.path} {...imageProps("sections.howItWorks.backgroundImage")} />
          <ObjectList
            items={howItWorks.steps}
            disabled={loading}
            max={6}
            blank={{ eyebrow: "", title: "", description: "", image: { path: "", alt: "" } }}
            addLabel="+ Add step"
            onChange={(next) => set("sections.howItWorks.steps", next)}
            renderRow={(row, setRow) => (
              <div className="space-y-2">
                <TextInput value={row.eyebrow || ""} disabled={loading} placeholder="Sign up &" onChange={(e) => setRow({ eyebrow: e.target.value })} />
                <TextInput value={row.title || ""} disabled={loading} placeholder="Choose Your Cause" onChange={(e) => setRow({ title: e.target.value })} />
                <TextArea value={row.description || ""} disabled={loading} onChange={(e) => setRow({ description: e.target.value })} />
                <ImageField
                  label="Image"
                  path={row.image?.path}
                  disabled={loading}
                  onUpload={onUploadImage}
                  onClear={(nextPath) => setRow({ image: { ...(row.image || {}), path: nextPath } })}
                />
              </div>
            )}
          />
        </Group>

        {/* ── Ways to give ── */}
        <Group title="Ways to Give">
          <EnabledRow enabled={waysToGive.enabled !== false} onChange={(v) => set("sections.waysToGive.enabled", v)} disabled={loading} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Title">
              <TextInput value={waysToGive.title || ""} disabled={loading} onChange={(e) => set("sections.waysToGive.title", e.target.value)} />
            </Field>
            <Field label="Subtitle">
              <TextInput value={waysToGive.subtitle || ""} disabled={loading} onChange={(e) => set("sections.waysToGive.subtitle", e.target.value)} />
            </Field>
          </div>
          <ObjectList
            items={waysToGive.cards}
            disabled={loading}
            max={6}
            blank={{ title: "", description: "", image: { path: "", alt: "" } }}
            addLabel="+ Add card"
            onChange={(next) => set("sections.waysToGive.cards", next)}
            renderRow={(row, setRow) => (
              <div className="space-y-2">
                <TextInput value={row.title || ""} disabled={loading} placeholder="Zakat" onChange={(e) => setRow({ title: e.target.value })} />
                <TextArea value={row.description || ""} disabled={loading} onChange={(e) => setRow({ description: e.target.value })} />
                <ImageField
                  label="Image"
                  path={row.image?.path}
                  disabled={loading}
                  onUpload={onUploadImage}
                  onClear={(nextPath) => setRow({ image: { ...(row.image || {}), path: nextPath } })}
                />
              </div>
            )}
          />
        </Group>

        {/* ── CTA banner ── */}
        <Group title="CTA banner">
          <EnabledRow enabled={ctaBanner.enabled !== false} onChange={(v) => set("sections.ctaBanner.enabled", v)} disabled={loading} />
          <Field label="Title">
            <TextInput value={ctaBanner.title || ""} disabled={loading} onChange={(e) => set("sections.ctaBanner.title", e.target.value)} />
          </Field>
          <Field label="Description">
            <TextArea value={ctaBanner.description || ""} disabled={loading} onChange={(e) => set("sections.ctaBanner.description", e.target.value)} />
          </Field>
          <ButtonFields prefix="Primary button" button={ctaBanner.primaryButton} disabled={loading} onChange={(patch) => set("sections.ctaBanner.primaryButton", { ...(ctaBanner.primaryButton || {}), ...patch })} />
          <ButtonFields prefix="Secondary button" button={ctaBanner.secondaryButton} disabled={loading} onChange={(patch) => set("sections.ctaBanner.secondaryButton", { ...(ctaBanner.secondaryButton || {}), ...patch })} />
          <ImageField label="Background image" path={ctaBanner.backgroundImage?.path} {...imageProps("sections.ctaBanner.backgroundImage")} />
        </Group>

        {/* ── Header ── */}
        <Group title="Header">
          <Field label="Navigation links">
            <ObjectList
              items={header.navLinks}
              disabled={loading}
              max={10}
              blank={{ label: "", href: "" }}
              addLabel="+ Add link"
              onChange={(next) => set("header.navLinks", next)}
              renderRow={(row, setRow) => (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <TextInput value={row.label || ""} disabled={loading} placeholder="Campaigns" onChange={(e) => setRow({ label: e.target.value })} />
                  <TextInput value={row.href || ""} disabled={loading} placeholder="/campaigns" onChange={(e) => setRow({ href: e.target.value })} />
                </div>
              )}
            />
          </Field>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <div className="mb-3 text-[13px] font-semibold text-[#111827]">Top promo bar</div>
            <EnabledRow enabled={noticeBar.enabled !== false} onChange={(v) => set("header.noticeBar.enabled", v)} disabled={loading} />
            <div className="mt-3">
              <ImageField label="Background image" path={noticeBar.backgroundImage?.path} {...imageProps("header.noticeBar.backgroundImage")} />
            </div>
            <div className="mt-3">
              <div className="mb-2 text-[13px] font-semibold text-[#111827]">Chips</div>
              <ObjectList
                items={noticeBar.chips}
                disabled={loading}
                max={3}
                blank={{ label: "", href: "" }}
                addLabel="+ Add chip"
                onChange={(next) => set("header.noticeBar.chips", next)}
                renderRow={(row, setRow) => (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <TextInput value={row.label || ""} disabled={loading} placeholder="Ramadan Food Campaign 2026" onChange={(e) => setRow({ label: e.target.value })} />
                    <TextInput value={row.href || ""} disabled={loading} placeholder="/campaigns" onChange={(e) => setRow({ href: e.target.value })} />
                  </div>
                )}
              />
            </div>
          </div>
        </Group>

        {/* ── Footer ── */}
        <Group title="Footer">
          <Field label="Mission text">
            <TextArea value={footer.mission || ""} disabled={loading} onChange={(e) => set("footer.mission", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Contact email">
              <TextInput value={footer.contact?.email || ""} disabled={loading} onChange={(e) => set("footer.contact.email", e.target.value)} />
            </Field>
            <Field label="Contact phone">
              <TextInput value={footer.contact?.phone || ""} disabled={loading} onChange={(e) => set("footer.contact.phone", e.target.value)} />
            </Field>
            <Field label="Address">
              <TextInput value={footer.contact?.address || ""} disabled={loading} onChange={(e) => set("footer.contact.address", e.target.value)} />
            </Field>
            <Field label="Tax-exempt ID">
              <TextInput value={footer.contact?.taxId || ""} disabled={loading} onChange={(e) => set("footer.contact.taxId", e.target.value)} />
            </Field>
          </div>
          <Field label="Social links">
            <ObjectList
              items={footer.socials}
              disabled={loading}
              max={10}
              blank={{ label: "", href: "" }}
              addLabel="+ Add social"
              onChange={(next) => set("footer.socials", next)}
              renderRow={(row, setRow) => (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <TextInput value={row.label || ""} disabled={loading} placeholder="Facebook" onChange={(e) => setRow({ label: e.target.value })} />
                  <TextInput value={row.href || ""} disabled={loading} placeholder="https://..." onChange={(e) => setRow({ href: e.target.value })} />
                </div>
              )}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Newsletter title">
              <TextInput value={footer.newsletter?.title || ""} disabled={loading} onChange={(e) => set("footer.newsletter.title", e.target.value)} />
            </Field>
            <Field label="Newsletter subtitle">
              <TextInput value={footer.newsletter?.subtitle || ""} disabled={loading} onChange={(e) => set("footer.newsletter.subtitle", e.target.value)} />
            </Field>
            <Field label="Newsletter button">
              <TextInput value={footer.newsletter?.buttonLabel || ""} disabled={loading} onChange={(e) => set("footer.newsletter.buttonLabel", e.target.value)} />
            </Field>
          </div>
          <Field label="Copyright name">
            <TextInput value={footer.copyrightName || ""} disabled={loading} onChange={(e) => set("footer.copyrightName", e.target.value)} placeholder="HC USA" />
          </Field>
        </Group>

        <div>
          <SaveButton onClick={onSave} disabled={saving || loading} />
        </div>
      </div>
    </SettingsSectionCard>
  );
};

export default HomepageTab;
