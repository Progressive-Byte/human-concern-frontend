"use client";

import { useLanguage } from "@/context/LanguageContext";

/**
 * Applies the active language's direction to the public site only. English-only surfaces (the
 * donation wizard, dashboard, admin) render outside this wrapper and stay LTR.
 */
export default function SiteShell({ children }) {
  const { dir, locale } = useLanguage();
  return (
    <div dir={dir} lang={locale} className={dir === "rtl" ? "text-right" : undefined}>
      {children}
    </div>
  );
}
