"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "@/services/api";
import { HOMEPAGE_DEFAULTS, resolveHomepageContent } from "@/utils/homepageDefaults";

const HomepageContentContext = createContext(HOMEPAGE_DEFAULTS);

/**
 * Loads the landing-page CMS content once and makes it available to the header, homepage sections
 * and footer. Fails safe: any error (or an empty response) leaves the built-in defaults in place, so
 * the page renders exactly as it did before the CMS existed.
 */
export function HomepageContentProvider({ children }) {
  const [content, setContent] = useState(HOMEPAGE_DEFAULTS);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiRequest("settings/homepage", { cache: "no-store" });
        const data = res?.data?.homepage ?? res?.data ?? null;
        if (!alive || !data || typeof data !== "object") return;
        setContent(resolveHomepageContent(data));
      } catch (e) {
        // Keep the defaults — never let a content fetch break the page.
        console.error("[HomepageContent] load failed:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <HomepageContentContext.Provider value={content}>{children}</HomepageContentContext.Provider>
  );
}

export function useHomepageContent() {
  return useContext(HomepageContentContext);
}
