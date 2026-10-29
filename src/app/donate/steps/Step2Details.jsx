"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useAuth } from "@/context/AuthContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import { validateDetailsStep } from "@/utils/donationStepValidation";
import { getUserProfile } from "@/services/donationService";
import { resolveCountryIso } from "@/utils/isoHelpers";
import StepLayout from "./StepComponents/StepLayout";
import PersonalInfoSection from "./StepComponents/Step1components/PersonalInfoSection";
import AddressSection from "./StepComponents/Step1components/AddressSection";
import DonorIntentions from "./StepComponents/Step1components/DonorIntentions";

function normalizeNoteFields(value) {
  return Array.isArray(value) ? value.filter((field) => field && typeof field === "object") : [];
}

const Step2Details = () => {
  const pathname = usePathname();
  const isPreview = pathname.startsWith("/admin/forms/preview");
  const { data, update } = useDonation();
  const { user, isAuthenticated, updateUser } = useAuth();
  const { handleNext, handlePrev } = useStepNavigation();

  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(true);
  const [addressManual, setAddressManual] = useState(false);
  const prevAuthRef = useRef(isAuthenticated);

  // Which fields the signed-in donor's PROFILE actually supplied. Only those are read-only until
  // they press "Edit change" — a field the donor types into must never lock itself mid-typing.
  const profilePrefilledRef = useRef({});

  // Latest draft, so the async profile refresh never clobbers what the donor has typed.
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // Campaign questions live on Step 2 now.
  const campaignMeta = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem("campaignData") || "{}"); }
    catch { return {}; }
  }, []);
  const customNotes = useMemo(
    () => (Array.isArray(campaignMeta.goalsDates?.customNotes) ? campaignMeta.goalsDates.customNotes : []),
    [campaignMeta]
  );
  const showGlobalNote = Boolean(campaignMeta.goalsDates?.showGlobalNote);
  const [globalNoteFields] = useState(() => normalizeNoteFields(campaignMeta.globalNote));

  const customNoteFields = useMemo(() => {
    const combined = [...customNotes];
    const existingKeys = new Set(combined.map((f) => String(f.key).trim()));
    if (showGlobalNote) {
      globalNoteFields.forEach((f) => {
        const key = String(f.key).trim();
        if (!existingKeys.has(key)) {
          existingKeys.add(key);
          combined.push(f);
        }
      });
    }
    return combined;
  }, [customNotes, showGlobalNote, globalNoteFields]);

  const [customNoteValues, setCustomNoteValues] = useState(() => {
    const saved = data.customNoteValues ?? {};
    return Object.fromEntries(
      customNoteFields.map((f) => [
        f.key,
        saved[f.key] !== undefined
          ? saved[f.key]
          : (f.type === "checkbox" ? (f.defaultValue ?? false) : (f.defaultValue ?? "")),
      ])
    );
  });
  const [noteErrors, setNoteErrors] = useState({});

  // Mirror the note answers into the shared context so Step 3 can submit them.
  useEffect(() => {
    update({ customNoteValues });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customNoteValues]);

  useEffect(() => {
    setCustomNoteValues((prev) => {
      const next = { ...(prev || {}) };
      customNoteFields.forEach((field) => {
        if (field?.key in next) return;
        next[field.key] = field.type === "checkbox" ? (field.defaultValue ?? false) : (field.defaultValue ?? "");
      });
      return next;
    });
  }, [customNoteFields]);

  // Prefill from the signed-in donor's cached profile.
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

  // Pull the fresh profile and fill any address field the donor hasn't filled yet.
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

  // Log-out clears the details that came from the account.
  useEffect(() => {
    if (isPreview) return;
    const wasAuth = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;
    if (wasAuth && !isAuthenticated) {
      update({
        organization: "", firstName: "", lastName: "", email: "", phone: "",
        addressLine1: "", city: "", province: "", zip: "", country: "", donorCountryCode: "",
      });
      setEditMode(false);
      setHasEdited(false);
      setAddressExpanded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPreview]);

  const isLocked = (key) =>
    !isPreview && isAuthenticated && !editMode && Boolean(profilePrefilledRef.current[key]);

  const personalField = (key) => ({
    value:    data[key] ?? "",
    onChange: isLocked(key) ? undefined : (e) => { update({ [key]: e.target.value }); setError(""); setHasEdited(true); },
    readOnly: isLocked(key),
  });

  const validateAndNext = () => {
    const detailsError = validateDetailsStep({
      email:        data.email,
      firstName:    data.firstName,
      lastName:     data.lastName,
      addressLine1: data.addressLine1,
      city:         data.city,
      province:     data.province,
      zip:          data.zip,
      donorCountryCode: data.donorCountryCode,
      country:      data.country,
    });

    if (detailsError) {
      setError(detailsError);
      const missingAddress =
        !String(data.addressLine1 ?? "").trim() ||
        !String(data.city ?? "").trim() ||
        !String(data.province ?? "").trim() ||
        !String(data.zip ?? "").trim() ||
        (!String(data.donorCountryCode ?? "").trim() && !resolveCountryIso(String(data.country ?? "")));
      if (missingAddress) {
        setAddressExpanded(true);
        setAddressManual(true);
      }
      return;
    }

    const errors = Object.fromEntries(
      customNoteFields
        .filter((f) => {
          if (!f.required) return false;
          if (f.type === "checkbox") return !customNoteValues[f.key];
          return !String(customNoteValues[f.key] ?? "").trim();
        })
        .map((f) => [f.key, true])
    );
    if (Object.keys(errors).length > 0) {
      setNoteErrors(errors);
      setError("Please fill in all required fields.");
      return;
    }

    setNoteErrors({});
    setError("");

    if (isAuthenticated) {
      const countryCode = String(data.donorCountryCode || "").trim() || resolveCountryIso(String(data.country ?? "")) || "";
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

    handleNext(3);
  };

  return (
    <StepLayout
      step={2}
      title="Your details"
      subtitle="Tell us who you are and how to reach you"
      onNext={validateAndNext}
      onPrev={() => handlePrev(1)}
      prevLabel="Back"
      nextLabel="Continue"
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
          addressManual={addressManual}
          setAddressManual={setAddressManual}
        />

        <DonorIntentions />

        {customNoteFields.length > 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-4 flex flex-col gap-4">
            {customNoteFields.map((field) => {
              const value    = customNoteValues[field.key] ?? "";
              const hasError = noteErrors[field.key];
              const baseInputClass = `w-full border rounded-lg px-3 py-2 text-[14px] text-[#383838] bg-white placeholder:text-[#AEAEAE] focus:outline-none resize-none transition-colors ${
                hasError
                  ? "border-[#EA3335] focus:border-[#EA3335]"
                  : "border-[#E5E5E5] focus:border-[#EA3335]"
              }`;

              return (
                <div key={field.id ?? field.key} className="flex flex-col gap-1.5">
                  <p className="text-[13px] font-semibold text-[#383838]">
                    {field.label}
                    {field.required && <span className="text-[#EA3335] ml-0.5">*</span>}
                  </p>

                  {field.type === "textarea" ? (
                    <textarea
                      value={value}
                      onChange={(e) => {
                        setCustomNoteValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                        if (noteErrors[field.key]) setNoteErrors((prev) => ({ ...prev, [field.key]: false }));
                      }}
                      placeholder={field.placeholder ?? ""}
                      rows={3}
                      className={baseInputClass}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={value}
                      onChange={(e) => {
                        setCustomNoteValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                        if (noteErrors[field.key]) setNoteErrors((prev) => ({ ...prev, [field.key]: false }));
                      }}
                      className={baseInputClass}
                    >
                      <option value="">Select an option</option>
                      {(field.options || []).map((opt, idx) => (
                        <option key={opt.id || idx} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === "radio" ? (
                    <div className="flex flex-col gap-2">
                      {(field.options || []).map((opt, idx) => (
                        <label key={opt.id || idx} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`custom-note-${field.key}`}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={(e) => {
                              setCustomNoteValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                              if (noteErrors[field.key]) setNoteErrors((prev) => ({ ...prev, [field.key]: false }));
                            }}
                            className="h-4 w-4 text-[#EA3335] focus:ring-[#EA3335]"
                          />
                          <span className="text-[14px] text-[#383838]">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => {
                          setCustomNoteValues((prev) => ({ ...prev, [field.key]: e.target.checked }));
                          if (noteErrors[field.key]) setNoteErrors((prev) => ({ ...prev, [field.key]: false }));
                        }}
                        className="h-4 w-4 text-[#EA3335] focus:ring-[#EA3335]"
                      />
                      <span className="text-[14px] text-[#383838]">{field.label}</span>
                    </label>
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        setCustomNoteValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                        if (noteErrors[field.key]) setNoteErrors((prev) => ({ ...prev, [field.key]: false }));
                      }}
                      placeholder={field.placeholder ?? ""}
                      className={baseInputClass}
                    />
                  )}

                  {field.helpText && (
                    <p className="text-[12px] text-[#737373]">{field.helpText}</p>
                  )}
                  {hasError && (
                    <p className="text-[12px] text-red-600">{field.label} is required.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="text-red-600 text-[13px]">{error}</p>}

      </div>
    </StepLayout>
  );
};

export default Step2Details;
