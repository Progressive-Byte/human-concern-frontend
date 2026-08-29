"use client";

import { useEffect, useMemo, useState } from "react";
import { Country } from "country-state-city";
import CustomDropdown from "@/components/common/CustomDropdown";
import { resolveCountryIso } from "@/utils/isoHelpers";

const FLAG_EMOJI_BASE = 127397;

function isoToFlagEmoji(isoCode) {
  if (!isoCode || isoCode.length !== 2) return "🌍";
  try {
    const codePoints = isoCode
      .toUpperCase()
      .split("")
      .map((c) => c.charCodeAt(0) + FLAG_EMOJI_BASE);
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌍";
  }
}

const DonorCountrySelector = ({
  value,
  onChange,
  userCountry = "",
  addressCountry = "",
  required = true,
  label = "Your Country",
  helpText,
  className = "",
  disabled = false,
}) => {
  const [countryCode, setCountryCode] = useState("");
  const [geoIpFetched, setGeoIpFetched] = useState(false);

  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({
        value: c.isoCode,
        label: c.name,
        flag: isoToFlagEmoji(c.isoCode),
      })),
    []
  );

  useEffect(() => {
    if (value) {
      const iso = resolveCountryIso(value);
      if (iso) queueMicrotask(() => setCountryCode(iso));
      return;
    }
    if (countryCode) return;

    let prefillIso = null;
    if (userCountry) prefillIso = resolveCountryIso(userCountry);
    if (!prefillIso && addressCountry) prefillIso = resolveCountryIso(addressCountry);
    if (prefillIso) {
      queueMicrotask(() => setCountryCode(prefillIso));
      const country = Country.getCountryByCode(prefillIso);
      if (country && typeof onChange === "function") {
        queueMicrotask(() => onChange(country.isoCode, country.name));
      }
      return;
    }

    if (geoIpFetched) return;
    queueMicrotask(() => setGeoIpFetched(true));
    const abort = new AbortController();
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: abort.signal });
        if (!res.ok) return;
        const data = await res.json();
        const iso = data?.country_code;
        if (!iso) return;
        const resolved = resolveCountryIso(iso);
        if (!resolved) return;
        queueMicrotask(() => setCountryCode(resolved));
        const country = Country.getCountryByCode(resolved);
        if (country && typeof onChange === "function") {
          queueMicrotask(() => onChange(country.isoCode, country.name));
        }
      } catch {}
    })();
    return () => abort.abort();
  }, [value, userCountry, addressCountry, geoIpFetched]);

  useEffect(() => {
    if (!value) return;
    const iso = resolveCountryIso(value);
    if (iso && iso !== countryCode) queueMicrotask(() => setCountryCode(iso));
  }, [value, countryCode]);

  const handleChange = (isoCode) => {
    const country = Country.getCountryByCode(isoCode);
    setCountryCode(isoCode);
    if (typeof onChange === "function") {
      onChange(country?.isoCode ?? isoCode, country?.name ?? "");
    }
  };

  const selectedOption = countryOptions.find((o) => o.value === countryCode);
  const flag = selectedOption?.flag ?? "🌍";

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <label className="text-[13px] font-semibold text-[#111827]">
        {label}
        {required && <span className="text-[#EA3335] ml-0.5">*</span>}
      </label>
      <CustomDropdown
        variant="form"
        options={countryOptions}
        value={countryCode}
        onChange={handleChange}
        placeholder="Select your country"
        label="Countries"
        maxHeight="240px"
        disabled={disabled}
        renderTrigger={(opt) => (
          <span className="flex items-center gap-2.5 min-w-0">
            <span className="shrink-0 text-[18px] leading-none">{flag}</span>
            <span
              className={`truncate ${
                opt?.value ? "text-[#383838]" : "text-[#AEAEAE]"
              }`}
            >
              {opt?.label ?? "Select your country"}
            </span>
          </span>
        )}
        renderOption={(opt, isActive) => (
          <span className="flex items-center gap-2.5 min-w-0">
            <span className="shrink-0 text-[18px] leading-none">{opt.flag}</span>
            <span className={`truncate ${isActive ? "" : "text-gray-700"}`}>
              {opt.label}
            </span>
          </span>
        )}
      />
      {helpText && <p className="text-[11px] text-[#AEAEAE]">{helpText}</p>}
    </div>
  );
};

export default DonorCountrySelector;
