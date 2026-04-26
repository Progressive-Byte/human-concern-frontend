"use client";

import { useEffect, useState } from "react";
import { useDonation } from "@/context/DonationContext";
import { useAuth } from "@/context/AuthContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import Field from "@/components/ui/Field";

const COUNTRIES = [
  "USA", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Pakistan", "Bangladesh", "India", "Other",
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

export default function Step1PersonalInfo() {
  const { data, update } = useDonation();
  const { user, isAuthenticated } = useAuth();
  const { handleNext } = useStepNavigation();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      update({
        organization: user.organization ?? "",
        firstName:    user.firstName   ?? "",
        lastName:     user.lastName    ?? "",
        email:        user.email       ?? "",
        phone:        user.phone       ?? "",
        addressLine1: user.addressLine1 ?? "",
        city:         user.city        ?? "",
        province:     user.state       ?? "",
        zip:          user.postalCode  ?? "",
        country:      user.country     ?? "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const validateAndNext = () => {
    if (
      !data.firstName?.trim() ||
      !data.lastName?.trim() ||
      !data.email?.trim() ||
      !data.addressLine1?.trim() ||
      !data.city?.trim() ||
      !data.province?.trim() ||
      !data.zip?.trim() ||
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

  const selectClass = (disabled) =>
    `w-full appearance-none border rounded-xl px-4 py-3 text-[14px] pr-9 focus:outline-none transition-colors ${
      disabled
        ? "border-[#E0E0E0] bg-[#F5F5F5] text-[#888888] cursor-default"
        : "border-[#CCCCCC] text-[#383838] bg-white focus:border-[#383838]"
    }`;

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

        {/* Organization */}
        <Field
          label="Organization"
          placeholder="xyz ltd"
          {...field("organization")}
        />

        {/* First / Last */}
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="First Name"
            required
            placeholder="John"
            {...field("firstName")}
          />
          <Field
            label="Last Name"
            required
            placeholder="Doe"
            {...field("lastName")}
          />
        </div>

        {/* Email / Phone */}
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Email"
            required
            type="email"
            placeholder="you@example.com"
            {...field("email")}
          />
          <Field
            label="Phone (Optional)"
            type="tel"
            placeholder="018******"
            {...field("phone")}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-[#F0F0F0] my-1" />

        {/* Address Line 1 */}
        <Field
          label="Address Line 1"
          required
          placeholder="Street number, house number and street name"
          {...field("addressLine1")}
        />

        {/* City / Province */}
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="City"
            required
            placeholder="e.g. Texas"
            {...field("city")}
          />
          <Field
            label="Province or State"
            required
            placeholder="e.g. Texas"
            {...field("province")}
          />
        </div>

        {/* Zip / Country */}
        <div className="grid grid-cols-2 gap-4">

          {/* Zip */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-[#383838]">
              Zip or Postal Code<span className="text-[#EA3335]">*</span>
            </label>
            {isAuthenticated ? (
              <input
                readOnly
                value={data.zip ?? ""}
                className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-[14px] text-[#888888] bg-[#F5F5F5] cursor-default focus:outline-none"
              />
            ) : (
              <div className="relative">
                <select
                  value={data.zip ?? ""}
                  onChange={(e) => { update({ zip: e.target.value }); setError(""); }}
                  className={selectClass(false)}
                >
                  <option value="" disabled>Select</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 5l4 4 4-4" stroke="#AEAEAE" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-[#383838]">
              Country<span className="text-[#EA3335]">*</span>
            </label>
            <div className="relative">
              <select
                value={data.country ?? "USA"}
                onChange={(e) => { update({ country: e.target.value }); setError(""); }}
                disabled={isAuthenticated}
                className={selectClass(isAuthenticated)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {!isAuthenticated && (
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 5l4 4 4-4" stroke="#AEAEAE" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-[#EA3335] text-[13px]">{error}</p>
        )}

      </div>
    </StepLayout>
  );
}
