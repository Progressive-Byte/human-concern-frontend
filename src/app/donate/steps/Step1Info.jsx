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

  const [error, setError]           = useState("");
  const [editMode, setEditMode]     = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(true);
  const didAutoCollapse = useRef(false);
  const prevAuthRef     = useRef(isAuthenticated);

  const [countryCode, setCountryCode] = useState("");
  const [stateCode,   setStateCode]   = useState("");

  // ── Causes from sessionStorage (merged from Step2)
  const causes = useMemo(() => {
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      const list = meta.causes ?? [];
      return list.map((c) => ({
        id:            c.id,
        label:         c.name,
        desc:          c.description  ?? "",
        emoji:         c.iconEmoji    ?? "",
        zakatEligible: c.zakatEligible ?? false,
      }));
    } catch { return []; }
  }, []);

  // ── Objectives from sessionStorage (merged from Step3, Ramadan only)
  const objectives = useMemo(() => {
    if (!data.isRamadan) return [];
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      return (meta.donationObjectives ?? []).map((obj) => ({
        id:    obj.id,
        label: obj.name  ?? obj.label ?? "",
        desc:  obj.description ?? obj.desc ?? "",
      }));
    } catch { return []; }
  }, [data.isRamadan]);

  const selectedCauseIds = data.causeIds ?? [];

  const toggleCause = (cause) => {
    const isSelected = selectedCauseIds.includes(cause.id);
    update({
      causeIds: isSelected
        ? selectedCauseIds.filter((id) => id !== cause.id)
        : [...selectedCauseIds, cause.id],
      causes: isSelected
        ? (data.causes ?? []).filter((l) => l !== cause.label)
        : [...(data.causes ?? []), cause.label],
    });
    setError("");
  };

  // ── Effects ──────────────────────────────────────────────

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

  // Sync countryCode
  useEffect(() => {
    if (data.country && !countryCode) {
      const iso = resolveCountryIso(data.country);
      if (iso) setCountryCode(iso);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.country]);

  // Sync stateCode after countryCode resolves
  useEffect(() => {
    if (data.province && countryCode && !stateCode) {
      const iso = resolveStateIso(data.province, countryCode);
      if (iso) setStateCode(iso);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.province, countryCode]);

  // Prefill from user profile
  useEffect(() => {
    if (isAuthenticated && user) {
      update({
        organization: user.organization           ?? "",
        firstName:    user.firstName              ?? "",
        lastName:     user.lastName               ?? "",
        email:        user.email                  ?? "",
        phone:        user.phone                  ?? "",
        addressLine1: user.address?.line1         ?? user.addressLine1 ?? "",
        city:         user.address?.city          ?? user.city         ?? "",
        province:     user.address?.state         ?? user.state        ?? "",
        zip:          user.address?.postalCode    ?? user.postalCode   ?? "",
        country:      user.country                ?? user.address?.country ?? "",
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
        causeIds: [], causes: [], objective: null, objectiveLabel: "",
      });
      setCountryCode("");
      setStateCode("");
      setEditMode(false);
      didAutoCollapse.current = false;
      setAddressExpanded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Dropdown options ──────────────────────────────────────

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
    []
  );
  const stateOptions = useMemo(
    () => countryCode ? State.getStatesOfCountry(countryCode).map((s) => ({ value: s.isoCode, label: s.name })) : [],
    [countryCode]
  );
  const cityOptions = useMemo(
    () => countryCode && stateCode
      ? City.getCitiesOfState(countryCode, stateCode).map((c) => ({ value: c.name, label: c.name }))
      : [],
    [countryCode, stateCode]
  );

  // ── Field helpers ─────────────────────────────────────────

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

  // ── Validation + Submit ───────────────────────────────────

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
    if (causes.length > 0 && selectedCauseIds.length === 0) {
      setError("Please select at least one cause.");
      return;
    }
    handleNext(4);
  };

  // ── Render ────────────────────────────────────────────────

  return (
    <StepLayout
      step={1}
      title="Personal Info"
      subtitle="Fill in your details, select your cause, and configure your donation"
      onNext={validateAndNext}
      nextLabel="Payment"
    >
      <div className="flex flex-col gap-5">

        {/* ── Personal info ── */}
        <div className="flex flex-col gap-4">
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
        </div>

        {/* ── Address (collapsible) ── */}
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

        {/* ── Causes (merged from Step2) ── */}
        {causes.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#383838]">Select Cause</p>
              <span className="text-[13px] text-[#8C8C8C]">
                <span className="text-[#000000] font-normal">{selectedCauseIds.length} selected</span>
                {" "}of {causes.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {causes.map((cause) => {
                const active = selectedCauseIds.includes(cause.id);
                return (
                  <button
                    key={cause.id}
                    type="button"
                    onClick={() => toggleCause(cause)}
                    className={`flex flex-col items-start gap-2 rounded-xl p-4 border text-left transition-all cursor-pointer ${
                      active
                        ? "border-[#EA3335] bg-[#FFF5F5]"
                        : "border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    {cause.emoji && (
                      <span className="text-[28px] leading-none">{cause.emoji}</span>
                    )}
                    <div>
                      <p className="text-[14px] font-semibold text-[#383838]">{cause.label}</p>
                      {cause.desc && (
                        <p className="text-[12px] text-[#8C8C8C] mt-0.5">{cause.desc}</p>
                      )}
                      {cause.zakatEligible && (
                        <span className="inline-block mt-2 text-[11px] font-medium text-[#8C8C8C] bg-white rounded-full px-1.5 py-0.5">
                          Zakat Eligible
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Objectives (merged from Step3, Ramadan only) ── */}
        {data.isRamadan && objectives.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[13px] font-semibold text-[#383838]">
              Select Objective
              <span className="ml-1.5 text-[#8C8C8C] font-normal">(optional)</span>
            </p>
            {objectives.map((obj) => {
              const active = data.objective === obj.id;
              return (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => update({ objective: obj.id, objectiveLabel: obj.label })}
                  className={`w-full flex flex-col items-start rounded-2xl px-5 py-4 border text-left transition-all cursor-pointer ${
                    active
                      ? "border-[#EA3335] bg-white"
                      : "border-[#E5E5E5] hover:border-[#CCCCCC] bg-white"
                  }`}
                >
                  <p className="text-[14px] font-semibold text-[#383838]">{obj.label}</p>
                  {obj.desc && (
                    <p className="text-[12px] text-[#8C8C8C] mt-0.5">{obj.desc}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="text-[#EA3335] text-[13px]">{error}</p>}

      </div>
    </StepLayout>
  );
};

export default Step1Info;
