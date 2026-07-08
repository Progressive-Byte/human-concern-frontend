"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Country } from "country-state-city";
import CustomDropdown from "@/components/common/CustomDropdown";

// country-state-city stores some phonecodes as "+1-684" (dependent territories
// sharing a country code) or "1-809 and 1-829" (multiple area codes) — reduce
// to just the leading numeric calling code, e.g. "684" territories -> "1".
function normalizePhonecode(raw) {
  return String(raw ?? "").replace(/^\+/, "").split(/[\s-]/)[0];
}

const ALL_COUNTRIES = Country.getAllCountries()
  .filter((c) => c.phonecode)
  .map((c) => ({ ...c, phonecode: normalizePhonecode(c.phonecode) }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Longest dial code first, so e.g. "+1242" (Bahamas) is matched before "+1" (US).
const BY_LONGEST_CODE = [...ALL_COUNTRIES].sort((a, b) => b.phonecode.length - a.phonecode.length);

const DEFAULT_ISO = "US";

function splitPhone(value) {
  const raw = String(value ?? "").trim();
  if (!raw.startsWith("+")) return { iso: DEFAULT_ISO, number: raw };
  const digits = raw.slice(1);
  const match = BY_LONGEST_CODE.find((c) => digits.startsWith(c.phonecode));
  if (!match) return { iso: DEFAULT_ISO, number: digits };
  return { iso: match.isoCode, number: digits.slice(match.phonecode.length) };
}

const PhoneField = ({ value, onChange, readOnly }) => {
  const [phone, setPhone] = useState(() => splitPhone(value));
  const { iso, number } = phone;
  const lastEmitted = useRef(value ?? "");

  // Re-sync if the value changes from outside (auth pre-fill, logout reset, back-nav) —
  // but not when the change originated from this component's own onChange calls.
  useEffect(() => {
    if ((value ?? "") === lastEmitted.current) return;
    lastEmitted.current = value ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing an external (context) value in, not deriving local state
    setPhone(splitPhone(value));
  }, [value]);

  const options = useMemo(
    () => ALL_COUNTRIES.map((c) => ({
      value: c.isoCode,
      label: `${c.name} +${c.phonecode}`,
      flag: c.flag,
      phonecode: c.phonecode,
      name: c.name,
    })),
    []
  );

  const emit = (nextIso, nextNumber) => {
    const country = ALL_COUNTRIES.find((c) => c.isoCode === nextIso);
    const combined = nextNumber ? `+${country?.phonecode ?? ""}${nextNumber}` : "";
    lastEmitted.current = combined;
    onChange?.({ target: { value: combined } });
  };

  const handleCountryChange = (isoCode) => {
    setPhone({ iso: isoCode, number });
    emit(isoCode, number);
  };

  const handleNumberChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    setPhone({ iso, number: digits });
    emit(iso, digits);
  };

  return (
    <div>
      <label className="text-[13px] font-medium text-[#111827] mb-1.5 block">Phone (Optional)</label>
      <div className={`flex items-stretch rounded-xl border transition-colors ${
        readOnly ? "border-[#E5E7EB] bg-[#F3F4F6]" : "border-dashed border-[#E5E7EB] focus-within:border-[#EA3335]/60"
      }`}>
        <CustomDropdown
          variant="compact"
          options={options}
          value={iso}
          onChange={handleCountryChange}
          label="Countries"
          placeholder="Country name"
          panelWidth="w-72"
          maxHeight="240px"
          disabled={readOnly}
          renderTrigger={(selected) => (
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[16px] leading-none">{selected?.flag}</span>
              <span className={readOnly ? "text-[#9CA3AF]" : "text-[#383838]"}>
                +{selected?.phonecode ?? ""}
              </span>
            </span>
          )}
          renderOption={(opt, isActive) => (
            <span className="flex items-center gap-2.5 min-w-0">
              <span className="text-[16px] leading-none shrink-0">{opt.flag}</span>
              <span className={`shrink-0 ${isActive ? "text-[#EA3335]" : "text-[#737373]"}`}>+{opt.phonecode}</span>
              <span className="truncate">{opt.name}</span>
            </span>
          )}
        />
        <span className="w-px my-2 bg-[#E5E7EB] shrink-0" />
        <input
          type="tel"
          value={number}
          onChange={readOnly ? undefined : handleNumberChange}
          readOnly={readOnly}
          placeholder="1-800-583-5841"
          className={`flex-1 min-w-0 px-4 py-3 text-[15px] outline-none bg-transparent ${
            readOnly ? "text-[#9CA3AF] cursor-default" : "text-[#383838]"
          }`}
        />
      </div>
    </div>
  );
};

export default PhoneField;
