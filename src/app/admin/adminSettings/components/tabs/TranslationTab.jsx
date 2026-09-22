"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SettingsSectionCard from "../SettingsSectionCard";
import { AlertIcon } from "@/components/common/SvgIcon";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { getAdminTranslationSettings, updateAdminTranslationSettings } from "@/services/admin";

const inputClass =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:opacity-60";

function normalizeObj(res) {
  if (res?.data && typeof res.data === "object" && !Array.isArray(res.data)) return res.data;
  if (res?.data?.data && typeof res.data.data === "object" && !Array.isArray(res.data.data)) return res.data.data;
  return res && typeof res === "object" ? res : {};
}

const TranslateIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path d="M3 6h9M7.5 4v2c0 4-2 7-4.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 20l4-9 4 9M13.4 17h5.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Google Translate API key. The key is write-only: it is stored encrypted, only its last 4
// characters are ever returned, and the field is cleared after a successful save.
const TranslationTab = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [last4, setLast4] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getAdminTranslationSettings();
        if (!alive) return;
        const data = normalizeObj(res);
        setHasKey(Boolean(data.hasGoogleApiKey));
        setLast4(String(data.googleApiKeyLast4 || ""));
      } catch (e) {
        if (alive) setError(e?.message || "Failed to load translation settings.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function save(patch) {
    setSaving(true);
    setError("");
    try {
      const res = await updateAdminTranslationSettings(patch);
      const data = normalizeObj(res);
      setHasKey(Boolean(data.hasGoogleApiKey));
      setLast4(String(data.googleApiKeyLast4 || ""));
      setDraft("");
      toast.success("Saved");
    } catch (e) {
      setError(e?.message || "Save failed.");
      toast.error(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <SettingsSectionCard
        icon={TranslateIcon}
        title="Google Translate API key"
        subtitle="Used by the Translate button that fills a language in automatically. Stored encrypted — the key is never shown again after saving."
      >
        {error ? (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertIcon size={16} />
            <div className="text-sm text-red-600">{error}</div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          <span className="text-[#6B7280]">Status:</span>
          {loading ? (
            <span className="text-[#6B7280]">Loading…</span>
          ) : hasKey ? (
            <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 font-semibold text-[#047857]">
              Saved{last4 ? ` (••••${last4})` : ""}
            </span>
          ) : (
            <span className="rounded-full bg-[#FFF8EC] px-2.5 py-0.5 font-semibold text-[#B45309]">Not set</span>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="password"
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste your Google Translate API key"
            disabled={loading || saving}
            className={inputClass}
          />
          <p className="text-[12px] text-[#6B7280]">
            Google Cloud Translation v2 key (usually starts with <span className="font-mono">AIza</span>). Leave
            this empty to keep the key you already saved.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => save({ googleApiKey: draft })}
              disabled={loading || saving || !draft.trim()}
              className="cursor-pointer rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save key"}
            </button>
            {hasKey ? (
              <button
                type="button"
                onClick={() => save({ clearGoogleApiKey: true })}
                disabled={loading || saving}
                className="cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-[13px] font-semibold text-red-600 transition hover:border-red-300 disabled:opacity-60"
              >
                Clear key
              </button>
            ) : null}
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={TranslateIcon}
        title="Languages & website content"
        subtitle="Enable languages, translate the website and set up geo detection on the Translation page."
      >
        <Link
          href="/admin/translation"
          className="inline-flex rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] no-underline transition hover:border-[#111827]/30"
        >
          Open Translation
        </Link>
      </SettingsSectionCard>
    </div>
  );
};

export default TranslationTab;
