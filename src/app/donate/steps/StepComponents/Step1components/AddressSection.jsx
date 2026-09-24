"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Country, State, City } from "country-state-city";
import { useDonation } from "@/context/DonationContext";
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";
import Field from "@/components/ui/Field";
import CustomDropdown from "@/components/common/CustomDropdown";
import GooglePlacesInput from "@/components/common/GooglePlacesInput";
import { ChevronIcon } from "@/components/common/SvgIcon";
import { resolveCountryIso, resolveStateIso } from "@/utils/isoHelpers";

const AddressSection = ({ setError, addressExpanded, setAddressExpanded, addressManual, setAddressManual }) => {
  const { data, update } = useDonation();
  const { user } = useAuth();
  // null = the key is still loading, '' = loaded and not configured.
  const { googleMapsApiKey } = useBranding();
  const noKey = googleMapsApiKey === "";
  // With no key there is nothing to search, so the full field set is the only usable mode.
  const isManual = addressManual || noKey;

  // Country is the single source of truth for this form. Selecting it writes both
  // `country` (name, used for the address) and `donorCountryCode` (ISO, used for
  // payment processing and tax receipts) so the two can never drift apart.
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const prefillAttempted = useRef(false);

  // On mount only: an address that is already filled (draft or profile prefill) starts
  // collapsed. Deliberately NOT reactive — watching addressLine1/city here collapsed the
  // section the instant the donor typed the first character into an empty one.
  useEffect(() => {
    if (data.addressLine1?.trim() || data.city?.trim()) setAddressExpanded(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const existing = resolveCountryIso(data.donorCountryCode) || resolveCountryIso(data.country);
    if (existing) {
      setCountryCode((prev) => (prev === existing ? prev : existing));
      // A pre-filled country usually arrives as a NAME with no ISO (e.g. from the profile),
      // and payment/tax country + step validation both need the code. Keep the draft in step.
      if (String(data.donorCountryCode || "").toUpperCase() !== existing) {
        update({ donorCountryCode: existing });
      }
      return;
    }
    if (prefillAttempted.current) return;
    prefillAttempted.current = true;

    const fromUser = resolveCountryIso(user?.country || "") || resolveCountryIso(user?.address?.country || "");
    if (fromUser) {
      const c = Country.getCountryByCode(fromUser);
      setCountryCode(fromUser);
      if (c) update({ country: c.name, donorCountryCode: c.isoCode });
      return;
    }

    // No country from the draft or the donor's profile: the donor picks one from the dropdown.
    // (There used to be an ipapi.co IP lookup here — dropped: it needed a third-party request on
    // the donate path, failed CORS intermittently, and only replaced one manual selection.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.donorCountryCode, data.country, user]);

  useEffect(() => {
    if (data.province) {
      if (countryCode && !stateCode) {
        const iso = resolveStateIso(data.province, countryCode);
        if (iso) setStateCode(iso);
      }
    } else {
      setStateCode("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.province, countryCode]);

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
    []
  );
  const stateOptions = useMemo(
    () => countryCode
      ? State.getStatesOfCountry(countryCode).map((s) => ({ value: s.isoCode, label: s.name }))
      : [],
    [countryCode]
  );
  const cityOptions = useMemo(
    () => countryCode && stateCode
      ? City.getCitiesOfState(countryCode, stateCode).map((c) => ({ value: c.name, label: c.name }))
      : [],
    [countryCode, stateCode]
  );

  const addressField = (key) => ({
    value:    data[key] ?? "",
    onChange: (e) => { update({ [key]: e.target.value }); setError(""); },
  });

  const handleCountryChange = (isoCode) => {
    const country = Country.getCountryByCode(isoCode);
    setCountryCode(isoCode);
    setStateCode("");
    update({
      country: country?.name ?? "",
      donorCountryCode: country?.isoCode ?? isoCode,
      province: "",
      city: "",
    });
    setError("");
  };

  const handleStateChange = (isoCode) => {
    const state = State.getStateByCodeAndCountry(isoCode, countryCode);
    setStateCode(isoCode);
    update({ province: state?.name ?? "", city: "" });
    setError("");
  };

  const handleCityChange = (cityName) => {
    update({ city: cityName });
    setError("");
  };

  // called when Google Places autocomplete selects an address.
  // Country name + ISO code both come from here so the single Country field,
  // the address, and the payment/tax country never drift apart.
  const handlePlaceSelect = useCallback((parsed) => {
    setStateCode(parsed.stateCode);
    update({
      addressLine1: parsed.addressLine1,
      country:      parsed.country,
      ...(parsed.countryCode ? { donorCountryCode: parsed.countryCode } : {}),
      province:     parsed.province,
      city:         parsed.city,
      zip:          parsed.zip,
    });
    setError("");
  }, [update, setError]);

  return (
    <div className="border border-dashed border-[#E5E7EB] rounded-2xl">
      <button
        type="button"
        onClick={() => setAddressExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#F9F9F9] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-[#383838]">Address Information</p>
          {!addressExpanded && data.addressLine1?.trim() && (
            <span className="text-[11px] text-[#737373] bg-white border border-[#E5E5E5] rounded-full px-2 py-0.5">
              {data.city ? `${data.city}, ${data.country}` : data.country}
            </span>
          )}
        </div>
        <ChevronIcon open={addressExpanded} />
      </button>

      {addressExpanded && (
        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[13px] font-medium text-[#111827]">
                Address Line 1<span className="text-[#EA3335] ml-0.5">*</span>
              </label>
              {!noKey && (
                <button
                  type="button"
                  onClick={() => setAddressManual((v) => !v)}
                  className="shrink-0 text-[11px] font-medium text-[#EA3335] hover:underline cursor-pointer"
                >
                  {addressManual ? "Use address search" : "Enter address manually"}
                </button>
              )}
            </div>
            <GooglePlacesInput
              value={data.addressLine1 ?? ""}
              onChange={(e) => { update({ addressLine1: e.target.value }); setError(""); }}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Start typing your address…"
              apiKey={googleMapsApiKey || ""}
            />
            <p className="text-[11px] text-[#AEAEAE]">
              {noKey
                ? "Enter your full address below."
                : "Select from suggestions to auto-fill country, state and city — or type manually."}
            </p>
          </div>

          {/* Search mode hides these: picking a suggestion fills them behind the scenes. */}
          {isManual && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium text-[#111827]">
                  Country<span className="text-[#EA3335] ml-0.5">*</span>
                </label>
                <CustomDropdown
                  variant="form"
                  options={countryOptions}
                  value={countryCode}
                  onChange={handleCountryChange}
                  placeholder="Select country"
                  label="Countries"
                  maxHeight="220px"
                />
                <p className="text-[11px] text-[#AEAEAE]">
                  Used for payment processing and tax receipt eligibility.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-medium text-[#111827]">
                    Province or State<span className="text-[#EA3335] ml-0.5">*</span>
                  </label>
                  {!stateCode && data.province?.trim() ? (
                    <div className="relative">
                      <input
                        readOnly
                        value={data.province}
                        className="w-full border border-dashed border-[#E5E7EB] rounded-xl px-4 py-3 text-[15px] text-[#383838] bg-[#F3F4F6] cursor-default focus:outline-none pr-16"
                      />
                      <button
                        type="button"
                        onClick={() => { update({ province: "", city: "" }); setStateCode(""); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#EA3335] hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <CustomDropdown
                      variant="form"
                      options={stateOptions}
                      value={stateCode}
                      onChange={handleStateChange}
                      placeholder={countryCode ? "Select state" : "Select country first"}
                      label="States"
                      maxHeight="220px"
                      disabled={!countryCode}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-medium text-[#111827]">
                    City<span className="text-[#EA3335] ml-0.5">*</span>
                  </label>
                  {!stateCode && data.city?.trim() ? (
                    <div className="relative">
                      <input
                        readOnly
                        value={data.city}
                        className="w-full border border-dashed border-[#E5E7EB] rounded-xl px-4 py-3 text-[15px] text-[#383838] bg-[#F3F4F6] cursor-default focus:outline-none pr-16"
                      />
                      <button
                        type="button"
                        onClick={() => { update({ city: "" }); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#EA3335] hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <CustomDropdown
                      variant="form"
                      options={cityOptions}
                      value={data.city ?? ""}
                      onChange={handleCityChange}
                      placeholder={stateCode ? "Select city" : "Select state first"}
                      label="Cities"
                      maxHeight="220px"
                      disabled={!stateCode}
                    />
                  )}
                </div>
              </div>

              <Field
                label="Zip or Postal Code"
                required
                placeholder="e.g. 10001"
                {...addressField("zip")}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSection;
