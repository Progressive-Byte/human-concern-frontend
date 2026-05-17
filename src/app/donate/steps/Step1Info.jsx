"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useAuth } from "@/context/AuthContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "./StepComponents/StepLayout";
import Field from "@/components/ui/Field";
import AddressSection   from "./StepComponents/Step1components/AddressSection";
import CauseSelector    from "./StepComponents/Step1components/CauseSelector";
import DonorPreferences from "./StepComponents/Step1components/DonorPreferences";

const Step1Info = ({ campaignSlug }) => {
  const { data, update } = useDonation();
  const { user, isAuthenticated, updateUser } = useAuth();
  const { handleNext } = useStepNavigation();
  const searchParams = useSearchParams();

  const [anonymous,        setAnonymous]        = useState(data.anonymous ?? false);
  const [showMessage,      setShowMessage]      = useState(!!data.donorMessage);
  const [error,            setError]            = useState("");
  const [editMode,         setEditMode]         = useState(false);
  const [hasEdited,        setHasEdited]        = useState(false);
  const [addressExpanded,  setAddressExpanded]  = useState(true);
  const prevAuthRef = useRef(isAuthenticated);

  const causes = useMemo(() => {
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      return (meta.causes ?? []).map((c) => ({
        id:            c.id,
        label:         c.name,
        desc:          c.description  ?? "",
        emoji:         c.iconEmoji    ?? "",
        zakatEligible: c.zakatEligible ?? false,
      }));
    } catch { return []; }
  }, []);

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

  useEffect(() => {
    const campaign  = campaignSlug ?? searchParams.get("campaign");
    const amount    = searchParams.get("amount");
    const currency  = searchParams.get("currency");

    let campaignId    = null;
    let zakatEligible = false;
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      campaignId    = meta.id ?? null;
      zakatEligible = meta.zakatEligible ?? false;
    } catch {}

    if (campaign) {
      update({
        campaignId,
        campaign,
        zakatEligible,
        ...(amount   && { amount }),
        ...(currency && { currency }),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    const wasAuth = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;
    if (wasAuth && !isAuthenticated) {
      update({
        organization: "", firstName: "", lastName: "", email: "", phone: "",
        addressLine1: "", city: "", province: "", zip: "", country: "",
        causeIds: [], causes: [], objective: null, objectiveLabel: "",
      });
      setEditMode(false);
      setHasEdited(false);
      setAddressExpanded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const isLocked = (key) => isAuthenticated && !editMode && Boolean(data[key]?.trim());

  const personalField = (key) => ({
    value:    data[key] ?? "",
    onChange: isLocked(key) ? undefined : (e) => { update({ [key]: e.target.value }); setError(""); setHasEdited(true); },
    readOnly: isLocked(key),
  });

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
    if (isAuthenticated) {
      updateUser({
        organization: data.organization,
        firstName:    data.firstName,
        lastName:     data.lastName,
        email:        data.email,
        phone:        data.phone,
        country:      data.country,
        address: {
          ...(user?.address ?? {}),
          line1:      data.addressLine1,
          city:       data.city,
          state:      data.province,
          postalCode: data.zip,
          country:    data.country,
        },
      });
      if (editMode) setEditMode(false);
    }
    handleNext(2);
  };

  return (
    <StepLayout
      step={1}
      title="Personal Info"
      subtitle="Fill in your details, select your cause, and configure your donation"
      onNext={validateAndNext}
      nextLabel="Payment"
    >
      <div className="flex flex-col gap-5">

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#383838]">Personal Information</p>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setEditMode((prev) => !prev)}
                className={`text-[12px] font-medium transition-colors cursor-pointer select-none ${
                  hasEdited
                    ? "text-[#EA3335] hover:underline"
                    : "text-[#AEAEAE] opacity-60"
                }`}
              >
                {editMode ? "Save change" : "Edit change"}
              </button>
            )}
          </div>

          {isAuthenticated && !editMode && (
            <p className="text-[13px] text-[#055A46] bg-[#F0FAF7] border border-[#C3E8DC] rounded-xl px-4 py-2.5">
              Your account information has been pre-filled. Click <strong>Edit change</strong> to make changes.
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

        <AddressSection
          setError={setError}
          addressExpanded={addressExpanded}
          setAddressExpanded={setAddressExpanded}
        />

        <CauseSelector
          causes={causes}
          selectedCauseIds={selectedCauseIds}
          toggleCause={toggleCause}
        />

        <DonorPreferences
          anonymous={anonymous}
          setAnonymous={setAnonymous}
          showMessage={showMessage}
          setShowMessage={setShowMessage}
        />

        {error && <p className="text-[#EA3335] text-[13px]">{error}</p>}

      </div>
    </StepLayout>
  );
};

export default Step1Info;
