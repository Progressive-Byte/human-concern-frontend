"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/services/api";
import { HOMEPAGE_DEFAULTS, resolveHomepageContent, applyHomepageTranslations } from "@/utils/homepageDefaults";
import { useLanguage } from "@/context/LanguageContext";

const HomepageContentContext = createContext(HOMEPAGE_DEFAULTS);

/**
 * Loads the landing-page CMS content once, then overlays the visitor's language translations on top
 * of it. Fails safe: any error (or an empty response) leaves the built-in defaults in place.
 */
export function HomepageContentProvider({ children }) {
  const { strings } = useLanguage();
  const [raw, setRaw] = useState(HOMEPAGE_DEFAULTS);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiRequest("settings/homepage", { cache: "no-store" });
        const data = res?.data?.homepage ?? res?.data ?? null;
        if (!alive || !data || typeof data !== "object") return;
        setRaw(resolveHomepageContent(data));
      } catch (e) {
        // Keep the defaults — never let a content fetch break the page.
        console.error("[HomepageContent] load failed:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // CMS copy is the English source; `strings` only contains the active (non-default) locale.
  const content = useMemo(() => applyHomepageTranslations(raw, strings), [raw, strings]);

  return (
    <HomepageContentContext.Provider value={content}>{children}</HomepageContentContext.Provider>
  );
}

export function useHomepageContent() {
  return useContext(HomepageContentContext);
}
