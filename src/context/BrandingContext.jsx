"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getPublicBranding } from "@/services/campaignService";

const DEFAULT_PRIMARY = "#EA3335";
const DEFAULT_ACCENT = "#055A46";

const BrandingContext = createContext({
  primaryColor: DEFAULT_PRIMARY,
  accentColor: DEFAULT_ACCENT,
});

function normalizeHex(value, fallback) {
  const input = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(input)) return input.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(input)) {
    const short = input.slice(1);
    return `#${short.split("").map((ch) => ch + ch).join("")}`.toUpperCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(input)) return `#${input}`.toUpperCase();
  if (/^[0-9a-fA-F]{3}$/.test(input)) {
    return `#${input.split("").map((ch) => ch + ch).join("")}`.toUpperCase();
  }
  return fallback;
}

function hexToRgb(hex) {
  const value = hex.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function mixColors(baseHex, mixHex, weight) {
  const base = hexToRgb(baseHex);
  const mix = hexToRgb(mixHex);
  const ratio = Math.max(0, Math.min(1, Number(weight) || 0));
  return rgbToHex({
    r: base.r + (mix.r - base.r) * ratio,
    g: base.g + (mix.g - base.g) * ratio,
    b: base.b + (mix.b - base.b) * ratio,
  });
}

function buildThemeStyle(primaryColor, accentColor) {
  const primary = normalizeHex(primaryColor, DEFAULT_PRIMARY);
  const accent = normalizeHex(accentColor, DEFAULT_ACCENT);
  const primaryRgb = hexToRgb(primary);
  const accentRgb = hexToRgb(accent);

  return {
    "--brand-primary": primary,
    "--brand-primary-rgb": `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`,
    "--brand-primary-50": mixColors(primary, "#FFFFFF", 0.94),
    "--brand-primary-100": mixColors(primary, "#FFFFFF", 0.88),
    "--brand-primary-700": mixColors(primary, "#000000", 0.16),
    "--brand-accent": accent,
    "--brand-accent-rgb": `${accentRgb.r} ${accentRgb.g} ${accentRgb.b}`,
    "--brand-accent-50": mixColors(accent, "#FFFFFF", 0.94),
    "--brand-accent-100": mixColors(accent, "#FFFFFF", 0.86),
    "--brand-accent-200": mixColors(accent, "#FFFFFF", 0.75),
  };
}

export function BrandingProvider({ children }) {
  const [brandingState, setBrandingState] = useState({
    primaryColor: DEFAULT_PRIMARY,
    accentColor: DEFAULT_ACCENT,
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await getPublicBranding();
        if (!alive) return;

        const body = res?.data && typeof res.data === "object" ? res.data : res;
        const branding = body?.branding && typeof body.branding === "object" ? body.branding : body;

        setBrandingState({
          primaryColor: normalizeHex(branding?.primaryColor, DEFAULT_PRIMARY),
          accentColor: normalizeHex(branding?.accentColor, DEFAULT_ACCENT),
        });
      } catch {
        if (!alive) return;
        setBrandingState({ primaryColor: DEFAULT_PRIMARY, accentColor: DEFAULT_ACCENT });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const themeStyle = useMemo(
    () => buildThemeStyle(brandingState.primaryColor, brandingState.accentColor),
    [brandingState.primaryColor, brandingState.accentColor]
  );
  const value = useMemo(() => brandingState, [brandingState]);

  return (
    <BrandingContext.Provider value={value}>
      <div className="hc-brand-theme" style={themeStyle}>
        {children}
      </div>
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
