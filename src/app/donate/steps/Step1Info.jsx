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

const Step1PersonalInfo = () => {
  const { data, update } = useDonation();
  const { user, isAuthenticated } = useAuth();
  const { handleNext } = useStepNavigation();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");

  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    const campaignId = searchParams.get("campaignId");
    const amount     = searchParams.get("amount");
    const currency   = searchParams.get("currency");
    if (campaignId) {
      update({
        campaignId,
        ...(amount   && { amount }),
        ...(currency && { currency }),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []);

  useEffect(() => {
    if (!isAuthenticated && data.country && !countryCode) {
      const found = Country.getAllCountries().find((c) => c.name === data.country);
      if (found) {
        setCountryCode(found.isoCode);
        if (data.province) {
          const foundState = State.getStatesOfCountry(found.isoCode).find(
            (s) => s.name === data.province
          );
          if (foundState) setStateCode(foundState.isoCode);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Effect 3: Update personal fields when user logs in or when user data changes
  useEffect(() => {
    if (isAuthenticated && user) {
      update({
        organization: user.organization  ?? "",
        firstName:    user.firstName     ?? "",
        lastName:     user.lastName      ?? "",
        email:        user.email         ?? "",
        phone:        user.phone         ?? "",
        addressLine1: user.addressLine1  ?? "",
        city:         user.city          ?? "",
        province:     user.state         ?? "",
        zip:          user.postalCode    ?? "",
        country:      user.country       ?? "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // ── Effect 4: Clear personal fields only when user actually logs out (not on mount)
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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Dropdown option lists (memoised)
  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
    []
  );

  const stateOptions = useMemo(
    () =>
      countryCode
        ? State.getStatesOfCountry(countryCode).map((s) => ({ value: s.isoCode, label: s.name }))
        : [],
    [countryCode]
  );

  const cityOptions = useMemo(
    () =>
      countryCode && stateCode
        ? City.getCitiesOfState(countryCode, stateCode).map((c) => ({ value: c.name, label: c.name }))
        : [],
    [countryCode, stateCode]
  );

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
      return;
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      setError("Enter a valid email address.");
      return;
    }
    handleNext(2);
  };

  const field = (key) => ({
    value:    data[key] ?? "",
    onChange: isAuthenticated ? undefined : (e) => { update({ [key]: e.target.value }); setError(""); },
    readOnly: isAuthenticated,
  });

  const readOnlyInput = (key) => (
    <input
      readOnly
      value={data[key] ?? ""}
      className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-[14px] text-[#888888] bg-[#F5F5F5] cursor-default focus:outline-none"
    />
  );

  return (
    <StepLayout
      step={1}
      title="Personal Info"
      subtitle="Share some necessary personal information for security"
      onNext={validateAndNext}
      nextLabel="Cause"
    >
      <div className="flex flex-col gap-4">

        {isAuthenticated && (
          <p className="text-[13px] text-[#055A46] bg-[#F0FAF7] border border-[#C3E8DC] rounded-xl px-4 py-2.5">
            Your account information has been pre-filled. These fields are read-only.
          </p>
        )}

        <Field label="Organization" placeholder="xyz ltd" {...field("organization")} />

        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" required placeholder="John" {...field("firstName")} />
          <Field label="Last Name"  required placeholder="Doe"  {...field("lastName")}  />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email"            required type="email" placeholder="you@example.com" {...field("email")} />
          <Field label="Phone (Optional)" type="tel"            placeholder="018******"       {...field("phone")} />
        </div>

        <div className="h-px bg-[#F0F0F0] my-1" />
        <Field
          label="Address Line 1"
          required
          placeholder="Street number, house number and street name"
          {...field("addressLine1")}
        />
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-[#383838]">
            Country<span className="text-[#EA3335] ml-0.5">*</span>
          </label>
          {isAuthenticated ? readOnlyInput("country") : (
            <CustomDropdown
              variant="form"
              options={countryOptions}
              value={countryCode}
              onChange={handleCountryChange}
              placeholder="Select country"
              label="Countries"
              maxHeight="220px"
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-[#383838]">
              Province or State<span className="text-[#EA3335] ml-0.5">*</span>
            </label>
            {isAuthenticated ? readOnlyInput("province") : (
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
            <label className="text-[13px] font-medium text-[#383838]">
              City<span className="text-[#EA3335] ml-0.5">*</span>
            </label>
            {isAuthenticated ? readOnlyInput("city") : (
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
          {...field("zip")}
        />

        {error && <p className="text-[#EA3335] text-[13px]">{error}</p>}

      </div>
    </StepLayout>
  );
}
export default Step1PersonalInfo;