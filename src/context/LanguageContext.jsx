"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/services/api";
import { LOCALE_COOKIE, DEFAULT_LOCALE } from "@/utils/constants";

const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  dir: "ltr",
  languages: [],
  defaultLanguage: DEFAULT_LOCALE,
  strings: {},
  setLanguage: () => {},
  t: (key, fallback) => (fallback !== undefined ? fallback : key),
});

function readCookie(name) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function writeCookie(name, value) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${oneYear}; samesite=lax`;
}

/**
 * Public-website language. Order: the visitor's saved cookie → server detection (browser language,
 * then IP country) → the default language. Fails safe to English so the site never breaks.
 */
export function LanguageProvider({ children }) {
  const [languages, setLanguages] = useState([]);
  const [defaultLanguage, setDefaultLanguage] = useState(DEFAULT_LOCALE);
  const [geo, setGeo] = useState({});
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [localeStrings, setLocaleStrings] = useState({});
  const [ready, setReady] = useState(false);

  // 1) Load the language config and resolve the initial locale.
  useEffect(() => {
    let alive = true;
    (async () => {
      let cfg = { languages: [], defaultLanguage: DEFAULT_LOCALE, geo: {} };
      try {
        const res = await apiRequest("settings/translation", { cache: "no-store" });
        cfg = res?.data || cfg;
      } catch (e) {
        console.error("[Language] config load failed:", e);
      }

      const configured = Array.isArray(cfg.languages) ? cfg.languages : [];
      const def = String(cfg.defaultLanguage || DEFAULT_LOCALE).toLowerCase();
      const list = configured.length ? configured : [{ code: def, name: def, rtl: false }];
      const enabled = list.map((l) => ({ code: String(l.code || "").toLowerCase(), name: l.name || "", rtl: Boolean(l.rtl) }));
      const isEnabled = (code) => enabled.some((l) => l.code === code);

      let chosen = "";
      const cookie = String(readCookie(LOCALE_COOKIE) || "").toLowerCase();
      const remember = cfg.geo?.rememberChoice !== false;
      if (remember && cookie && isEnabled(cookie)) chosen = cookie;

      // Auto-switch off + no saved choice → keep the default.
      const autoSwitch = cfg.geo?.autoSwitch !== false;
      if (!chosen && autoSwitch && cfg.geo?.enabled !== false) {
        try {
          const res = await apiRequest("settings/detect-language", { cache: "no-store" });
          const detected = String(res?.data?.locale || "").toLowerCase();
          if (detected && isEnabled(detected)) chosen = detected;
        } catch (e) {
          // Country/browser detection is best-effort.
        }
      }
      if (!chosen) chosen = isEnabled(def) ? def : (enabled[0]?.code || DEFAULT_LOCALE);

      if (!alive) return;
      setLanguages(enabled);
      setDefaultLanguage(def);
      setGeo(cfg.geo || {});
      setLocale(chosen);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 2) Load the translated strings for the active locale (the default locale needs none).
  useEffect(() => {
    if (!ready || !locale || locale === defaultLanguage) return undefined;
    let alive = true;
    (async () => {
      try {
        const res = await apiRequest(`settings/translations/${encodeURIComponent(locale)}`, { cache: "no-store" });
        if (alive) setLocaleStrings(res?.data?.strings && typeof res.data.strings === "object" ? res.data.strings : {});
      } catch (e) {
        console.error("[Language] translations load failed:", e);
        if (alive) setLocaleStrings({});
      }
    })();
    return () => {
      alive = false;
    };
  }, [ready, locale, defaultLanguage]);

  // The English source needs no overrides, so the default locale always resolves to an empty map.
  const strings = useMemo(
    () => (locale === defaultLanguage ? {} : (localeStrings || {})),
    [locale, defaultLanguage, localeStrings],
  );

  const dir = useMemo(
    () => (languages.find((l) => l.code === locale)?.rtl ? "rtl" : "ltr"),
    [languages, locale],
  );

  const setLanguage = useCallback(
    (code) => {
      const next = String(code || "").toLowerCase();
      if (!languages.some((l) => l.code === next)) return;
      setLocale(next);
      writeCookie(LOCALE_COOKIE, next);
      if (typeof document !== "undefined") document.documentElement.lang = next;
    },
    [languages],
  );

  /** Translate a `ui.*` key, falling back to the provided English text. */
  const t = useCallback(
    (key, fallback) => {
      const value = strings ? strings[key] : "";
      if (typeof value === "string" && value.trim()) return value;
      return fallback !== undefined ? fallback : key;
    },
    [strings],
  );

  const value = useMemo(
    () => ({ locale, dir, languages, defaultLanguage, geo, strings, setLanguage, t }),
    [locale, dir, languages, defaultLanguage, geo, strings, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
