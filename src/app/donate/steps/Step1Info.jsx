"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Country, State, City } from "country-state-city";
import { useDonation } from "@/context/DonationContext";
import { useAuth } from "@/context/AuthContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import Field from "@/components/ui/Field";
import CustomDropdown from "@/components/common/CustomDropdown";
import { ChevronIcon } from "@/components/common/SvgIcon";

// Common 3-letter ISO → 2-letter ISO map for countries stored as abbreviations
const ISO3_TO_ISO2 = {
  USA: "US", GBR: "GB", CAN: "CA", AUS: "AU", ARE: "AE",
  IND: "IN", PAK: "PK", BGD: "BD", NZL: "NZ", DEU: "DE",
  FRA: "FR", SAU: "SA", QAT: "QA", KWT: "KW", TUR: "TR",
};

function resolveCountryIso(value) {
  if (!value) return null;
  const all = Country.getAllCountries();
  const upper = value.toUpperCase();
  return (
    all.find((c) => c.name === value)?.isoCode ||
    all.find((c) => c.isoCode === upper)?.isoCode ||
    all.find((c) => c.isoCode === ISO3_TO_ISO2[upper])?.isoCode ||
    all.find((c) => c.name.toLowerCase() === value.toLowerCase())?.isoCode ||
    null
  );
}

function resolveStateIso(stateName, countryIso) {
  if (!stateName || !countryIso) return null;
  const states = State.getStatesOfCountry(countryIso);
  return (
    states.find((s) => s.name === stateName)?.isoCode ||
    states.find((s) => s.isoCode === stateName.toUpperCase())?.isoCode ||
    states.find((s) => s.name.toLowerCase() === stateName.toLowerCase())?.isoCode ||
    null
  );
}

const Step1Info = ({ campaignSlug }) => {
  const { data, update } = useDonation();
  const { user, isAuthenticated } = useAuth();
  const { handleNext } = useStepNavigation();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(true);
  const didAutoCollapse = useRef(false);

  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");

  const prevAuthRef = useRef(isAuthenticated);

  // Read sessionStorage campaign data on mount
  useEffect(() => {
    const campaign = campaignSlug ?? searchParams.get("campaign");
    const amount    = searchParams.get("amount");
    const currency  = searchParams.get("currency");
    const isRamadan = sessionStorage.getItem("donationIsRamadan") === "1";

    let campaignId = null;
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      campaignId = meta.id ?? null;
    } catch {}

    if (campaign) {
      update({
        campaignId,
        campaign,
        isRamadan,
        ...(amount   && { amount }),
        ...(currency && { currency }),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-collapse address section the first time address data arrives
  useEffect(() => {
    if (!didAutoCollapse.current && (data.addressLine1?.trim() || data.city?.trim())) {
      setAddressExpanded(false);
      didAutoCollapse.current = true;
    }
  }, [data.addressLine1, data.city]);

  // Sync countryCode — handles full names, 2-letter codes, and 3-letter abbreviations (e.g. "USA")
  useEffect(() => {
    if (data.country && !countryCode) {
      const iso = resolveCountryIso(data.country);
      if (iso) setCountryCode(iso);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.country]);

  // Sync stateCode after countryCode is resolved
  useEffect(() => {
    if (data.province && countryCode && !stateCode) {
      const iso = resolveStateIso(data.province, countryCode);
      if (iso) setStateCode(iso);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.province, countryCode]);

  // Prefill personal + address fields from user profile
  useEffect(() => {
    if (isAuthenticated && user) {
      update({
        organization: user.organization             ?? "",
        firstName:    user.firstName                ?? "",
        lastName:     user.lastName                 ?? "",
        email:        user.email                    ?? "",
        phone:        user.phone                    ?? "",
        addressLine1: user.address?.line1           ?? user.addressLine1   ?? "",
        city:         user.address?.city            ?? user.city           ?? "",
        province:     user.address?.state           ?? user.state          ?? "",
        zip:          user.address?.postalCode      ?? user.postalCode     ?? "",
        country:      user.country                  ?? user.address?.country ?? "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Clear fields on logout
  useEffect(() => {
    const wasAuth = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;
    if (wasAuth && !isAuthenticated) {
      update({
        organization: "", firstName: "", lastName: "", email: "", phone: "",
        addressLine1: "", city: "", province: "", zip: "", country: "",
      });
      setCountryCode("");
      setStateCode("");
      setEditMode(false);
      didAutoCollapse.current = false;
      setAddressExpanded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
    []
  );
  const stateOptions = useMemo(
    () => countryCode ? State.getStatesOfCountry(countryCode).map((s) => ({ value: s.isoCode, label: s.name })) : [],
    [countryCode]
  );
  const cityOptions = useMemo(
    () => countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode).map((c) => ({ value: c.name, label: c.name })) : [],
    [countryCode, stateCode]
  );

  // Personal field is locked when authenticated, not editing, and has a value
  const isLocked = (key) => isAuthenticated && !editMode && Boolean(data[key]?.trim());

  const personalField = (key) => ({
    value:    data[key] ?? "",
    onChange: isLocked(key) ? undefined : (e) => { update({ [key]: e.target.value }); setError(""); },
    readOnly: isLocked(key),
  });

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

  const validateAndNext = () => {
    if (
      !data.firstName?.trim()    ||
      !data.lastName?.trim()     ||
      !data.email?.trim()        ||
      !data.addressLine1?.trim() ||
      !data.city?.trim()         ||
      !data.province?.trim()     ||
      !data.zip?.trim()          ||
      !data.country?.trim()
    ) {
      setError("Please fill in all required fields.");
      if (!addressExpanded) setAddressExpanded(true);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      setError("Enter a valid email address.");
      return;
    }
    handleNext(2);
  };

  return (
    <StepLayout
      step={1}
      title="Personal Info"
      subtitle="Share some necessary personal information for security"
      onNext={validateAndNext}
      nextLabel="Cause"
    >
      <div className="flex flex-col gap-4">

        {/* Personal info header */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#383838]">Personal Information</p>
          {isAuthenticated && !editMode && (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="text-[12px] font-medium text-[#EA3335] hover:underline transition-colors cursor-pointer"
            >
              Edit Information
            </button>
          )}
          {isAuthenticated && editMode && (
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="text-[12px] font-medium text-[#737373] hover:text-[#383838] transition-colors cursor-pointer"
            >
              Lock Fields
            </button>
          )}
        </div>

        {isAuthenticated && !editMode && (
          <p className="text-[13px] text-[#055A46] bg-[#F0FAF7] border border-[#C3E8DC] rounded-xl px-4 py-2.5">
            Your account information has been pre-filled. Click <strong>Edit Information</strong> to make changes.
          </p>
        )}

        <Field label="Organization" placeholder="xyz ltd" {...personalField("organization")} />

        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" required placeholder="John" {...personalField("firstName")} />
          <Field label="Last Name"  required placeholder="Doe"  {...personalField("lastName")}  />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email"            required type="email" placeholder="you@example.com" {...personalField("email")} />
          <Field label="Phone (Optional)" type="tel"            placeholder="018******"       {...personalField("phone")} />
        </div>

        {/* Address section - collapsible */}
        <div className="border border-dashed border-[#E5E7EB] rounded-2xl overflow-hidden">
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
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-medium text-[#111827]">
                    City<span className="text-[#EA3335] ml-0.5">*</span>
                  </label>
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

        {error && <p className="text-[#EA3335] text-[13px]">{error}</p>}

      </div>
    </StepLayout>
  );
};

export default Step1Info;
