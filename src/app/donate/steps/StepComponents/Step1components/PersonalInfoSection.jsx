"use client";

import { useEffect, useState } from "react";
import { useDonation } from "@/context/DonationContext";
import Field from "@/components/ui/Field";
import PhoneField from "@/components/ui/PhoneField";
import MarketingConsent from "./MarketingConsent";
import { EditIcon } from "@/components/common/SvgIcon";

const PersonalInfoSection = ({
  isAuthenticated,
  isPreview,
  editMode,
  hasEdited,
  onToggleEditMode,
  personalField,
}) => {
  const { data, update } = useDonation();
  const [showOrganization, setShowOrganization] = useState(Boolean(String(data.organization ?? "").trim()));

  // A profile or schedule prefill can supply an organization after mount.
  useEffect(() => {
    if (String(data.organization ?? "").trim()) setShowOrganization(true);
  }, [data.organization]);

  const handleOrganizationToggle = (next) => {
    setShowOrganization(next);
    if (!next) update({ organization: "" });
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[15px] sm:text-[17px] font-bold leading-snug text-[#1A1A1A]">Personal Information</p>
        {isAuthenticated && (
          <button
            type="button"
            onClick={onToggleEditMode}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors cursor-pointer select-none ${
              hasEdited
                ? "border-[#EA3335]/40 bg-[#FFF5F5] text-[#EA3335] hover:bg-[#FFEBEB]"
                : "border-[#E5E7EB] bg-white text-[#383838] hover:border-[#EA3335]/50 hover:text-[#EA3335]"
            }`}
          >
            {editMode ? null : (
              <span className="inline-flex h-4 w-4 items-center justify-center">{EditIcon}</span>
            )}
            {editMode ? "Save change" : "Edit change"}
          </button>
        )}
      </div>

      {isAuthenticated && !editMode && !isPreview && (
        <p className="text-[13px] text-[#055A46] bg-[#F0FAF7] border border-[#C3E8DC] rounded-xl px-4 py-2.5">
          These details are pre-filled from your account. If anything has changed, click{" "}
          <strong>Edit change</strong> to update it before continuing.
        </p>
      )}

      {/*
        All the typed fields first, in the order a donor reads them, then the optional
        tick-boxes grouped in one panel. Before this they were interleaved — a checkbox
        between Email and First Name, then more further down — which read as clutter.
        The marketing opt-in stays directly under Email, where it has always been.
      */}
      <Field label="Email" required type="email" placeholder="you@example.com" {...personalField("email")} />

      <MarketingConsent />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4">
        <Field label="First Name" required placeholder="John" {...personalField("firstName")} />
        <Field label="Last Name"  required placeholder="Doe"  {...personalField("lastName")}  />
      </div>

      <PhoneField {...personalField("phone")} />

      {/*
        The optional tick-boxes form one panel. The Organization field opens inside that panel,
        directly under the box that revealed it — outside, it read as an unrelated field
        floating below a group it did not appear to belong to.
      */}
      <div className="flex flex-col divide-y divide-[#F0F0F0] rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-3">
        <div className="py-3">
          <label className="flex cursor-pointer select-none items-start gap-2.5">
            <input
              type="checkbox"
              checked={showOrganization}
              onChange={(e) => handleOrganizationToggle(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#CCCCCC] accent-[#EA3335] focus:ring-[#EA3335]"
            />
            <span className="text-[13px] leading-snug text-[#383838]">
              I am giving on behalf of a company/organization
            </span>
          </label>

          {showOrganization && (
            <div className="mt-3 pl-[26px]">
              <Field label="Organization" placeholder="xyz ltd" {...personalField("organization")} />
            </div>
          )}
        </div>

        <label className="flex cursor-pointer select-none items-start gap-2.5 py-3">
          <input
            type="checkbox"
            checked={Boolean(data.anonymous)}
            onChange={(e) => update({ anonymous: e.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#CCCCCC] accent-[#EA3335] focus:ring-[#EA3335]"
          />
          <span className="text-[13px] leading-snug text-[#383838]">Give anonymously</span>
        </label>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
