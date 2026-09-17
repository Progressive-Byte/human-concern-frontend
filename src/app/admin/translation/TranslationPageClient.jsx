"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminAvatarMenu from "@/app/admin/components/AdminAvatarMenu";
import {
  getAdminTranslationSettings,
  updateAdminTranslationSettings,
  translateAdminTranslation,
} from "@/services/admin";

function useHasPermission(perm) {
  try {
    const ctx = useAdminAuth();
    const admin = ctx?.admin;
    if (!admin) return true;
    const role = String(admin?.role || "").toLowerCase();
    if (role === "super_admin" || role === "super-admin" || role === "admin" || role === "owner") return true;
    const perms = Array.isArray(admin?.permissions) ? admin.permissions : [];
    if (perms.length === 0) return true;
    const required = String(perm || "").toLowerCase();
    const prefix = required.split(".")[0];
    return perms.some((x) => {
      const p = String(x || "").toLowerCase();
      return p === required || p === `${prefix}.*` || p === "*";
    });
  } catch {
    return true;
  }
}

function normalizeObj(res) {
  if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) return res.data;
  if (res?.data?.data && typeof res.data.data === "object" && !Array.isArray(res.data.data)) return res.data.data;
  return res && typeof res === "object" ? res : {};
}

const TABS = [
  { key: "languages", label: "Languages" },
  { key: "content", label: "Content" },
  { key: "geo", label: "Geo Detection" },
];

const GEO_MODES = [
  { value: "browser_then_country", label: "Browser language, then IP country" },
  { value: "browser", label: "Browser language only" },
  { value: "country", label: "IP country only" },
  { value: "off", label: "Off — always use the default language" },
];

function groupOf(key) {
  const parts = String(key || "").split(".");
  if (parts[0] === "homepage") return `homepage.${parts[1] || "other"}`;
  return `ui.${parts[1] || "other"}`;
}

const inputClass =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60";

const TranslationPageClient = () => {
  const toast = useToast();
  const { admin } = useAdminAuth();
  const canRead = useHasPermission("settings.read");

  const [tab, setTab] = useState("languages");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState("");
  const [error, setError] = useState("");

  const [languages, setLanguages] = useState([]);
  const [geo, setGeo] = useState({});
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [translations, setTranslations] = useState({});
  const [sourceStrings, setSourceStrings] = useState({});
  const [newLang, setNewLang] = useState({ code: "", name: "", rtl: false });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminTranslationSettings();
      const data = normalizeObj(res);
      setLanguages(Array.isArray(data.languages) ? data.languages : []);
      setGeo(data.geo && typeof data.geo === "object" ? data.geo : {});
      setDefaultLanguage(data.defaultLanguage || "en");
      setTranslations(data.translations && typeof data.translations === "object" ? data.translations : {});
      setSourceStrings(data.sourceStrings && typeof data.sourceStrings === "object" ? data.sourceStrings : {});
    } catch (e) {
      setError(e?.message || "Failed to load translation settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const enabledLanguages = languages.filter((l) => l.enabled !== false);
  const targetLanguages = enabledLanguages.filter((l) => l.code !== defaultLanguage);
  const sourceKeys = useMemo(() => Object.keys(sourceStrings).sort(), [sourceStrings]);

  const groups = useMemo(() => {
    const map = new Map();
    sourceKeys.forEach((k) => {
      const g = groupOf(k);
      if (!map.has(g)) map.set(g, []);
      map.get(g).push(k);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [sourceKeys]);

  async function saveSettings() {
    setSaving(true);
    setError("");
    try {
      const res = await updateAdminTranslationSettings({
        languages,
        geo,
        defaultLanguage,
      });
      const data = normalizeObj(res);
      setLanguages(Array.isArray(data.languages) ? data.languages : languages);
      setGeo(data.geo && typeof data.geo === "object" ? data.geo : geo);
      setDefaultLanguage(data.defaultLanguage || defaultLanguage);
      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function saveTranslations() {
    setSaving(true);
    setError("");
    try {
      const res = await updateAdminTranslationSettings({ translations });
      const data = normalizeObj(res);
      setTranslations(data.translations && typeof data.translations === "object" ? data.translations : translations);
      toast.success("Translations saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function setString(locale, key, value) {
    setTranslations((prev) => ({
      ...(prev || {}),
      [locale]: { ...((prev || {})[locale] || {}), [key]: value },
    }));
  }

  async function runTranslate(locale) {
    setTranslating(locale);
    setError("");
    try {
      const res = await translateAdminTranslation({ locale });
      const data = normalizeObj(res);
      toast.success(`Translated ${data.translated || 0} strings to ${locale}`);
      await load();
    } catch (e) {
      setError(e?.message || "Translate failed.");
      toast.error(e?.message || "Translate failed.");
    } finally {
      setTranslating("");
    }
  }

  function addLanguage() {
    const code = String(newLang.code || "").trim().toLowerCase();
    if (!/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(code)) {
      toast.error("Enter a valid language code, e.g. es or pt-BR");
      return;
    }
    if (languages.some((l) => l.code === code)) {
      toast.error("That language is already in the list");
      return;
    }
    setLanguages((prev) => [...prev, { code, name: String(newLang.name || "").trim(), rtl: Boolean(newLang.rtl), enabled: true }]);
    setNewLang({ code: "", name: "", rtl: false });
  }

  const translatedCount = (locale) => {
    const map = translations[locale] || {};
    return sourceKeys.filter((k) => String(map[k] || "").trim()).length;
  };

  if (!canRead) {
    return (
      <main className="min-w-0 space-y-6 p-4 md:p-6">
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-amber-800">You do not have the `settings.read` permission to access this area.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-w-0 space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold text-[#111827]">Translation</h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Manage the languages of the public website and translate its content. Donation pages stay English.
          </p>
        </div>
        <AdminAvatarMenu admin={admin} />
      </div>

      <div className="hc-animate-fade-up overflow-x-auto rounded-2xl bg-[#F3F4F6] p-1">
        <div className="flex min-w-max items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`cursor-pointer px-6 py-2.5 text-[13px] font-semibold transition ${
                tab === t.key ? "rounded-2xl bg-white text-[#111827] shadow-sm" : "rounded-2xl text-[#6B7280] hover:bg-white/60 hover:text-[#111827]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertIcon size={16} />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#6B7280]">
          Loading…
        </div>
      ) : null}

      {/* ── Languages ── */}
      {!loading && tab === "languages" ? (
        <section className="hc-animate-fade-up space-y-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-6">
          <div className="text-[16px] font-semibold text-[#111827]">Languages</div>
          <div className="space-y-2">
            {languages.map((l, i) => (
              <div key={l.code} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#F3F4F6] bg-white p-3">
                <input
                  type="checkbox"
                  checked={l.enabled !== false}
                  onChange={(e) => setLanguages((prev) => prev.map((x, k) => (k === i ? { ...x, enabled: e.target.checked } : x)))}
                  className="h-4 w-4"
                  style={{ accentColor: "#EA3335" }}
                />
                <span className="w-16 rounded-lg bg-[#F3F4F6] px-2 py-1 text-center text-[12px] font-semibold text-[#111827]">{l.code}</span>
                <input
                  value={l.name || ""}
                  onChange={(e) => setLanguages((prev) => prev.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))}
                  placeholder="Language name"
                  className={`${inputClass} max-w-[220px]`}
                />
                <label className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={Boolean(l.rtl)}
                    onChange={(e) => setLanguages((prev) => prev.map((x, k) => (k === i ? { ...x, rtl: e.target.checked } : x)))}
                    className="h-4 w-4"
                  />
                  Right-to-left
                </label>
                <label className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                  <input
                    type="radio"
                    name="defaultLanguage"
                    checked={defaultLanguage === l.code}
                    onChange={() => setDefaultLanguage(l.code)}
                    className="h-4 w-4"
                    style={{ accentColor: "#EA3335" }}
                  />
                  Default
                </label>
                <button
                  type="button"
                  onClick={() => setLanguages((prev) => prev.filter((_, k) => k !== i))}
                  disabled={l.code === "en"}
                  className="ml-auto rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[12px] font-semibold text-red-600 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Add a language</div>
            <div className="flex flex-wrap items-center gap-3">
              <input value={newLang.code} onChange={(e) => setNewLang((p) => ({ ...p, code: e.target.value }))} placeholder="es" className={`${inputClass} max-w-[100px]`} />
              <input value={newLang.name} onChange={(e) => setNewLang((p) => ({ ...p, name: e.target.value }))} placeholder="Spanish" className={`${inputClass} max-w-[220px]`} />
              <label className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                <input type="checkbox" checked={newLang.rtl} onChange={(e) => setNewLang((p) => ({ ...p, rtl: e.target.checked }))} className="h-4 w-4" />
                RTL
              </label>
              <button type="button" onClick={addLanguage} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827]">
                Add
              </button>
            </div>
          </div>

          <div className="text-[12px] text-[#6B7280]">
            The default language is the fallback used when a visitor&apos;s language isn&apos;t enabled.
          </div>

          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            Save
          </button>
        </section>
      ) : null}

      {/* ── Content ── */}
      {!loading && tab === "content" ? (
        <section className="hc-animate-fade-up space-y-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[16px] font-semibold text-[#111827]">Website content</div>
              <div className="mt-1 text-[12px] text-[#6B7280]">
                English is the source. Click Translate to auto-fill a language, then edit freely.
              </div>
            </div>
            <div className="text-[12px] text-[#6B7280]">{sourceKeys.length} strings</div>
          </div>

          {!targetLanguages.length ? (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-[13px] text-[#6B7280]">
              Enable at least one non-default language in the Languages tab to translate content.
            </div>
          ) : (
            <div className="space-y-2">
              {targetLanguages.map((l) => (
                <div key={l.code} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#F3F4F6] p-3">
                  <span className="w-16 rounded-lg bg-[#F3F4F6] px-2 py-1 text-center text-[12px] font-semibold text-[#111827]">{l.code}</span>
                  <span className="text-[12px] text-[#6B7280]">
                    {translatedCount(l.code)} / {sourceKeys.length} translated
                  </span>
                  <button
                    type="button"
                    onClick={() => runTranslate(l.code)}
                    disabled={Boolean(translating)}
                    className="ml-auto rounded-xl bg-red-600 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {translating === l.code ? "Translating…" : "Translate"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {groups.map(([group, keys]) => (
              <details key={group} className="rounded-xl border border-[#E5E7EB] p-3">
                <summary className="cursor-pointer text-[13px] font-semibold text-[#111827]">{group}</summary>
                <div className="mt-3 space-y-3">
                  {keys.map((key) => (
                    <div key={key} className="rounded-lg border border-[#F3F4F6] p-3">
                      <div className="text-[11px] font-semibold text-[#6B7280]">{key}</div>
                      <div className="mt-1 text-[13px] text-[#111827]">{sourceStrings[key]}</div>
                      {targetLanguages.length ? (
                        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                          {targetLanguages.map((l) => (
                            <input
                              key={l.code}
                              value={(translations[l.code] || {})[key] || ""}
                              onChange={(e) => setString(l.code, key, e.target.value)}
                              placeholder={`${l.code} translation`}
                              className={inputClass}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>

          <button
            type="button"
            onClick={saveTranslations}
            disabled={saving}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            Save translations
          </button>
        </section>
      ) : null}

      {/* ── Geo detection ── */}
      {!loading && tab === "geo" ? (
        <section className="hc-animate-fade-up space-y-5 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-6">
          <div>
            <div className="text-[16px] font-semibold text-[#111827]">Geo Detection</div>
            <div className="mt-1 text-[12px] text-[#6B7280]">
              How the public website picks a language for a first-time visitor.
            </div>
          </div>

          <label className="flex items-center gap-3 text-[13px] text-[#111827]">
            <input type="checkbox" checked={geo.enabled !== false} onChange={(e) => setGeo((p) => ({ ...p, enabled: e.target.checked }))} className="h-4 w-4" style={{ accentColor: "#EA3335" }} />
            Enable language detection
          </label>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Detection method</div>
            <select
              value={geo.mode || "browser_then_country"}
              onChange={(e) => setGeo((p) => ({ ...p, mode: e.target.value }))}
              className={inputClass}
            >
              {GEO_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 text-[13px] text-[#111827]">
            <input type="checkbox" checked={geo.autoSwitch !== false} onChange={(e) => setGeo((p) => ({ ...p, autoSwitch: e.target.checked }))} className="h-4 w-4" style={{ accentColor: "#EA3335" }} />
            Automatically switch to the detected language
          </label>

          <label className="flex items-center gap-3 text-[13px] text-[#111827]">
            <input type="checkbox" checked={geo.rememberChoice !== false} onChange={(e) => setGeo((p) => ({ ...p, rememberChoice: e.target.checked }))} className="h-4 w-4" style={{ accentColor: "#EA3335" }} />
            Remember the visitor&apos;s manual language choice
          </label>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Country header</div>
            <input
              value={geo.countryHeader || ""}
              onChange={(e) => setGeo((p) => ({ ...p, countryHeader: e.target.value }))}
              placeholder="cf-ipcountry"
              className={`${inputClass} max-w-[280px]`}
            />
            <div className="mt-1 text-[12px] text-[#6B7280]">
              The header your CDN/host forwards with the visitor&apos;s ISO country (e.g. Cloudflare&apos;s
              <span className="font-semibold"> cf-ipcountry</span>). Leave blank to skip country detection.
            </div>
          </div>

          <div className="text-[12px] text-[#6B7280]">
            Fallback language: <span className="font-semibold text-[#111827]">{defaultLanguage}</span>
          </div>

          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            Save
          </button>
        </section>
      ) : null}
    </main>
  );
};

export default TranslationPageClient;
