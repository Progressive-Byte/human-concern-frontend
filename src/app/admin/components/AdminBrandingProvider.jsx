"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAdminSettingsBranding, getAdminSettingsGeneral } from "@/services/admin";
import { siteUrl } from "@/utils/constants";

const DEFAULT_PRIMARY = "#DC2626";
const DEFAULT_ACCENT = "#111827";
const DEFAULT_NAME = "Human Concern USA";

const AdminBrandingContext = createContext({
  primaryColor: DEFAULT_PRIMARY,
  accentColor: DEFAULT_ACCENT,
  organizationName: DEFAULT_NAME,
  brandLogoUrl: "",
});

function resolveAssetUrl(value) {
  const raw =
    typeof value === "string"
      ? value
      : value && typeof value === "object"
        ? value?.url || value?.path || value?.location || value?.src
        : "";
  const path = String(raw || "").trim();
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${siteUrl}${path}`;
  return `${siteUrl}/${path}`;
}

function normalizeHex(value, fallback = DEFAULT_PRIMARY) {
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
  const normalized = normalizeHex(hex);
  const value = normalized.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
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
  const primary = normalizeHex(primaryColor);
  const accent = normalizeHex(accentColor, DEFAULT_ACCENT);
  const { r, g, b } = hexToRgb(primary);
  const accentRgb = hexToRgb(accent);
  const primary200 = mixColors(primary, "#FFFFFF", 0.72);
  const primary600 = mixColors(primary, "#000000", 0.05);
  const primary700 = mixColors(primary, "#000000", 0.16);
  const accent200 = mixColors(accent, "#FFFFFF", 0.78);
  const accent600 = mixColors(accent, "#000000", 0.04);
  const accent700 = mixColors(accent, "#000000", 0.14);

  return {
    "--admin-primary": primary,
    "--admin-primary-rgb": `${r} ${g} ${b}`,
    "--admin-primary-200": primary200,
    "--admin-primary-600": primary600,
    "--admin-primary-700": primary700,
    "--admin-accent": accent,
    "--admin-accent-rgb": `${accentRgb.r} ${accentRgb.g} ${accentRgb.b}`,
    "--admin-accent-200": accent200,
    "--admin-accent-600": accent600,
    "--admin-accent-700": accent700,
  };
}

export function AdminBrandingProvider({ children }) {
  const [brandingState, setBrandingState] = useState({
    primaryColor: DEFAULT_PRIMARY,
    accentColor: DEFAULT_ACCENT,
    organizationName: DEFAULT_NAME,
    brandLogoUrl: "",
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [brandingRes, generalRes] = await Promise.all([
          getAdminSettingsBranding(),
          getAdminSettingsGeneral(),
        ]);
        if (!alive) return;

        const brandingData = brandingRes?.data?.data || brandingRes?.data || {};
        const generalData = generalRes?.data?.data || generalRes?.data || {};
        const branding = brandingData?.branding && typeof brandingData.branding === "object" ? brandingData.branding : brandingData;

        setBrandingState({
          primaryColor: normalizeHex(branding?.primaryColor, DEFAULT_PRIMARY),
          accentColor: normalizeHex(branding?.accentColor, DEFAULT_ACCENT),
          organizationName: String(generalData?.organization?.organizationName || "").trim() || DEFAULT_NAME,
          brandLogoUrl: resolveAssetUrl(branding?.logo || brandingData?.logo),
        });
      } catch {
        if (!alive) return;
        setBrandingState({
          primaryColor: DEFAULT_PRIMARY,
          accentColor: DEFAULT_ACCENT,
          organizationName: DEFAULT_NAME,
          brandLogoUrl: "",
        });
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
    <AdminBrandingContext.Provider value={value}>
      <div className="hc-admin-theme" style={themeStyle}>
        {children}
      </div>
    </AdminBrandingContext.Provider>
  );
}

export function useAdminBranding() {
  return useContext(AdminBrandingContext);
}
