"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useAuth } from "@/context/AuthContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout          from "./StepComponents/StepLayout";
import PersonalInfoSection from "./StepComponents/Step1components/PersonalInfoSection";
import AddressSection      from "./StepComponents/Step1components/AddressSection";
import CauseSelector       from "./StepComponents/Step1components/CauseSelector";
import DonorPreferences    from "./StepComponents/Step1components/DonorPreferences";
import { fitSplit, applyManualAmount } from "@/utils/causeSplit";
import { getUserProfile } from "@/services/donationService";
import { resolveCountryIso } from "@/utils/isoHelpers";

const CURRENCY_SYMBOLS = { USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$", NZD: "NZ$", SGD: "S$", HKD: "HK$", CHF: "CHF", JPY: "¥" };

const Step1Info = ({ campaignSlug }) => {
  const pathname = usePathname();
  const isPreview = pathname.startsWith("/admin/forms/preview");
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

  // Which fields the signed-in donor's PROFILE actually supplied. Only those are read-only until
  // they press "Edit change" — a field the donor types into must never lock itself mid-typing.
  const profilePrefilledRef = useRef({});

  // Latest draft, so the async profile refresh never clobbers what the donor has typed.
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

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
  const causeSplit       = data.causeSplit ?? {};
  const manualCauseIds   = data.manualCauseIds ?? [];
  const totalAmount      = data.donorAmount || Number(data.amount) || 0;
  const sym              = CURRENCY_SYMBOLS[data.currency ?? "USD"] ?? (data.currency ?? "$");

  const toggleCause = (cause) => {
    const isSelected = selectedCauseIds.includes(cause.id);
    const nextIds = isSelected
      ? selectedCauseIds.filter((id) => id !== cause.id)
      : [...selectedCauseIds, cause.id];
    // Causes the donor has typed into keep their amounts; only the untouched ones re-split.
    const nextManualIds = manualCauseIds.filter((id) => nextIds.includes(id));
    update({
      causeIds: nextIds,
      causes: isSelected
        ? (data.causes ?? []).filter((l) => l !== cause.label)
        : [...(data.causes ?? []), cause.label],
      manualCauseIds: nextManualIds,
      causeSplit: fitSplit({ causeIds: nextIds, causeSplit, manualIds: nextManualIds }),
    });
    setError("");
  };

  const handleSplitChange = (causeId, amount) => {
    if (totalAmount <= 0) return;
    const { causeSplit: nextSplit, manualIds } = applyManualAmount({
      causeIds: selectedCauseIds,
      causeSplit,
      manualIds: manualCauseIds,
      editedId: causeId,
      amount,
      total: totalAmount,
    });
    update({ causeSplit: nextSplit, manualCauseIds: manualIds });
  };

  const handleResetSplit = () => {
    update({
      manualCauseIds: [],
      causeSplit: fitSplit({ causeIds: selectedCauseIds, causeSplit: {}, manualIds: [] }),
    });
  };

  useEffect(() => {
    const campaign  = campaignSlug ?? searchParams.get("campaign");
    const amount    = searchParams.get("amount");
    const currency  = searchParams.get("currency");

    let campaignId    = null;
    let zakatEligible = false;
    let campaignTitle = "";
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      campaignId    = meta.id           ?? null;
      zakatEligible = meta.zakatEligible ?? false;
      campaignTitle = meta.name          ?? "";
    } catch {}

    if (campaign) {
      update({
        campaignId,
        campaign,
        zakatEligible,
        campaignTitle,
        ...(amount   && { amount }),
        ...(currency && { currency }),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPreview) return;
    if (isAuthenticated && user) {
      const prefill = {
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
        donorCountryCode: user.countryCode ?? user.donorCountryCode ?? "",
      };
      profilePrefilledRef.current = {
        ...profilePrefilledRef.current,
        ...Object.fromEntries(Object.entries(prefill).filter(([, v]) => String(v ?? "").trim() !== "")),
      };
      update(prefill);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, isPreview]);

  // The cached auth user is written at login only, so it can be stale (e.g. an address added
  // from the profile afterwards). Pull the fresh profile and fill any address field the donor
  // hasn't filled yet — never overwrite what they've already entered.
  useEffect(() => {
    if (isPreview || !isAuthenticated) return undefined;
    let alive = true;

    (async () => {
      try {
        const res = await getUserProfile();
        if (!alive) return;

        const fresh = (res?.data?.data || res?.data || {}).user || {};
        const address = fresh.address || {};
        const current = dataRef.current || {};
        const patch = {};

        const fillIfEmpty = (key, value) => {
          const next = String(value ?? "").trim();
          if (!next) return;
          if (String(current[key] ?? "").trim()) return;
          patch[key] = next;
        };

        fillIfEmpty("addressLine1", address.line1);
        fillIfEmpty("city", address.city);
        fillIfEmpty("province", address.state);
        fillIfEmpty("zip", address.postalCode);
        fillIfEmpty("country", address.country);

        if (Object.keys(patch).length > 0) {
          profilePrefilledRef.current = { ...profilePrefilledRef.current, ...patch };
          update(patch);
        }
      } catch {
        // The cached-user prefill already ran; a failed refresh just means no fresh address.
      }
    })();

    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPreview]);

  useEffect(() => {
    if (isPreview) return;
    const wasAuth = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;
    if (wasAuth && !isAuthenticated) {
      update({
        organization: "", firstName: "", lastName: "", email: "", phone: "",
        addressLine1: "", city: "", province: "", zip: "", country: "", donorCountryCode: "",
        causeIds: [], causes: [], causeSplit: {}, manualCauseIds: [], objective: null, objectiveLabel: "",
      });
      setEditMode(false);
      setHasEdited(false);
      setAddressExpanded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPreview]);

  // Locked = the profile supplied this value and the donor hasn't opened "Edit change". Reading the
  // CAPTURED prefill (not the live value) is what stops a field locking itself on the first keystroke.
  const isLocked = (key) =>
    !isPreview && isAuthenticated && !editMode && Boolean(profilePrefilledRef.current[key]);

  const personalField = (key) => ({
    value:    data[key] ?? "",
    onChange: isLocked(key) ? undefined : (e) => { update({ [key]: e.target.value }); setError(""); setHasEdited(true); },
    readOnly: isLocked(key),
  });

  const validateAndNext = () => {
    if (!data.organization?.trim()) {
      setError("Organization name is required.");
      return;
    }
    if (
      !data.firstName?.trim()    ||
      !data.lastName?.trim()     ||
      !data.email?.trim()        ||
      !data.addressLine1?.trim() ||
      !data.city?.trim()         ||
      !data.province?.trim()     ||
      !data.zip?.trim()
    ) {
      setError("Please fill in all required fields.");
      if (!addressExpanded) setAddressExpanded(true);
      return;
    }
    // The country can be pre-filled as a name without its ISO — resolve it so the payment/tax
    // country is always set (and the field isn't reported as missing).
    const countryCode = String(data.donorCountryCode || "").trim() || resolveCountryIso(data.country || "") || "";
    if (!countryCode) {
      setError("Please select your country.");
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
        countryCode,
        donorCountryCode: countryCode,
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

        <PersonalInfoSection
          isAuthenticated={isAuthenticated}
          isPreview={isPreview}
          editMode={editMode}
          hasEdited={hasEdited}
          onToggleEditMode={() => setEditMode((prev) => !prev)}
          personalField={personalField}
        />

        <AddressSection
          setError={setError}
          addressExpanded={addressExpanded}
          setAddressExpanded={setAddressExpanded}
        />

        <CauseSelector
          causes={causes}
          selectedCauseIds={selectedCauseIds}
          toggleCause={toggleCause}
          causeSplit={causeSplit}
          manualCauseIds={manualCauseIds}
          totalAmount={totalAmount}
          sym={sym}
          onSplitChange={handleSplitChange}
          onResetSplit={handleResetSplit}
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
