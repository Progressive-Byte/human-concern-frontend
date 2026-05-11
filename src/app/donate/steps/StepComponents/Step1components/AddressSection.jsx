"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Country, State, City } from "country-state-city";
import { useDonation } from "@/context/DonationContext";
import Field from "@/components/ui/Field";
import CustomDropdown from "@/components/common/CustomDropdown";
import { ChevronIcon } from "@/components/common/SvgIcon";
import { resolveCountryIso, resolveStateIso } from "@/utils/isoHelpers";

const AddressSection = ({ setError, addressExpanded, setAddressExpanded }) => {
  const { data, update } = useDonation();

  const [countryCode, setCountryCode] = useState("");
  const [stateCode,   setStateCode]   = useState("");
  const didAutoCollapse = useRef(false);

  useEffect(() => {
    if (!didAutoCollapse.current && (data.addressLine1?.trim() || data.city?.trim())) {
      setAddressExpanded(false);
      didAutoCollapse.current = true;
    }
  }, [data.addressLine1, data.city, setAddressExpanded]);

  useEffect(() => {
    if (data.country) {
      if (!countryCode) {
        const iso = resolveCountryIso(data.country);
        if (iso) setCountryCode(iso);
      }
    } else {
      setCountryCode("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.country]);

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
    update({ country: country?.name ?? "", province: "", city: "" });
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
          <Field
            label="Address Line 1"
            required
            placeholder="Street number, house number and street name"
            {...addressField("addressLine1")}
          />

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
        </div>
      )}
    </div>
  );
};

export default AddressSection;
