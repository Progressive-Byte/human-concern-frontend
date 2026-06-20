"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CancelScheduleIcon, EditIcon, EyeIcon, PauseIcon, PlayIcon, Spinner } from "@/components/common/SvgIcon";
import { getUserScheduleEditForm, pauseUserSchedule, resumeUserSchedule, cancelUserSchedule } from "@/services/donationService";
import { ScheduleActionModal } from "@/components/common/ScheduleActionModal";

async function openScheduleEditSession(scheduleId, router) {
  const res = await getUserScheduleEditForm(scheduleId);
  const d = res?.data?.data || res?.data || {};

  const form = d.form || {};
  const currency = String(d.currency || "USD");
  const selectedCauseIds = Array.isArray(d.selectedCauseIds) ? d.selectedCauseIds : [];
  const causes = Array.isArray(d.causes) ? d.causes : [];
  const availableCauses = Array.isArray(d.availableCauses) ? d.availableCauses : [];
  const availableAddOns = Array.isArray(d.availableAddOns) ? d.availableAddOns : [];
  const addons = Array.isArray(d.addons?.items) ? d.addons.items : [];
  const tip = d.tip || {};
  const constraints = d.constraints || {};
  const goalsDates = d.goalsDates || {};
  const editableSchedule = d.editableSchedule || {};
  const scheduleType = String(editableSchedule.scheduleType || "specific_dates");
  const rawConfig = editableSchedule.scheduleConfig || {};
  const dates = Array.isArray(rawConfig.dates) ? rawConfig.dates : [];

  // The backend bakes add-ons + tip into the first installment date.
  // Strip them out so context holds only the base per-installment amounts.
  const addonsTotal = addons.reduce((sum, a) => sum + Number(a.amount || 0), 0);
  const tipAmt = Number(tip.platformTipAmount || 0);

  const baseAmounts = dates.map((dt, i) => {
    const raw = Number(dt.amount || 0);
    const computed = i === 0 ? Math.max(0, raw - addonsTotal - tipAmt) : raw;
    return Math.round(computed * 100) / 100;
  });

  const datesList = dates.map((dt) => String(dt.date));
  const amountTier = baseAmounts.length > 0 ? baseAmounts[0] : 0;
  const splitMode = d.howToSplit === "divide" ? "divide" : "repeat";

  // In repeat mode, amounts equal to amountTier are the default — not true per-date overrides.
  // Loading them as overrides would cause new dates to use a wrong "total" as their default
  // when the donor changes the amount. Only store genuinely custom per-date amounts.
  const dateAmounts = {};
  dates.forEach((dt, i) => {
    if (dt.date) {
      const key = String(dt.date).split("T")[0];
      const amount = baseAmounts[i];
      if (splitMode !== "repeat" || amount !== amountTier) {
        dateAmounts[key] = amount;
      }
    }
  });

  // In repeat mode the amount field shows the per-payment amount (amountTier), not a running
  // total — so donorAmount mirrors amountTier. In divide mode it shows the total to be split.
  const totalBaseAmount = Math.round(baseAmounts.reduce((sum, a) => sum + a, 0) * 100) / 100;
  const donorAmount = splitMode === "divide" ? totalBaseAmount : amountTier;
  const allBaseAmounts = Object.values(dateAmounts);
  const hasVaryingAmounts = allBaseAmounts.length > 0 && allBaseAmounts.some((a) => a !== allBaseAmounts[0]);

  // Track which dates came pre-filled from the API (have a transactionId).
  // removed:false = date is still selected; removed:true = donor deselected it.
  const prefillDateMap = {};
  if (scheduleType === "specific_dates") {
    dates.forEach((dt) => {
      if (dt.date && dt.transactionId) {
        prefillDateMap[String(dt.date).split("T")[0]] = {
          transactionId: String(dt.transactionId),
          removed: false,
        };
      }
    });
  }

  const scheduleConfig = scheduleType === "date_range"
    ? { startDate: rawConfig.startDate || "", endDate: rawConfig.endDate || "", frequency: rawConfig.frequency || "daily", dateAmounts }
    : { dates: datesList, dateAmounts };
  const addOnBreakdown = addons.map((a) => ({
    id: String(a.addOnId || ""),
    name: String(a.name || ""),
    iconEmoji: String(a.iconEmoji || ""),
    amount: Number(a.amount || 0),
    values: a.inputValues || {},
  }));

  const suggestedAmounts = Array.isArray(d.suggestedAmounts)
    ? d.suggestedAmounts.map((s) => Number(s?.value ?? s)).filter((n) => Number.isFinite(n) && n > 0)
    : [];

  const campaignData = {
    id: String(form.formId || ""),
    name: String(form.name || ""),
    suggestedAmounts,
    causes: availableCauses.map((c) => ({
      id: String(c.causeId || ""),
      name: String(c.label || ""),
      description: "",
      iconEmoji: "",
      zakatEligible: false,
    })),
    addOns: availableAddOns.map((a) => ({
      id: String(a.addOnId || ""),
      name: String(a.name || ""),
      iconEmoji: String(a.iconEmoji || ""),
      amount: Number(a.amount || 0),
      pricing: a.pricing || { type: "fixed" },
    })),
    goalsDates: {
      allowRecurringDonations: constraints.allowRecurring !== false,
      minimumDonation: Number(constraints.minimumDonation || 1),
      maximumDonation: Number(constraints.maximumDonation || 999999),
      enableTipping: tip.enabled !== false,
      recurringPresets: Array.isArray(goalsDates.recurringPresets) ? goalsDates.recurringPresets : [],
      customNotes: [],
      showGlobalNote: false,
    },
  };
  sessionStorage.setItem("campaignData", JSON.stringify(campaignData));

  sessionStorage.setItem(
    "hc_schedule_edit",
    JSON.stringify({
      scheduleId: String(d.scheduleId || scheduleId),
      isEditMode: true,
      scheduleVersion: Number(d.scheduleVersion || 1),
      prefillDateMap,
      rawData: d,
    })
  );

  sessionStorage.removeItem("hc_donation_done");
  sessionStorage.setItem(
    "hc_donation",
    JSON.stringify({
      campaign: String(form.slug || ""),
      campaignId: String(form.formId || ""),
      campaignTitle: String(form.name || ""),
      currency,
      causeIds: selectedCauseIds,
      causes: causes.map((c) => String(c.label || "")),
      isRamadan: false,
      paymentType: "recurring",
      scheduleType,
      scheduleConfig,
      frequency: scheduleType === "date_range" ? (rawConfig.frequency || "daily") : undefined,
      splitMode,
      amountTier,
      donorAmount,
      amount: String(amountTier),
      installmentCount: dates.length,
      perDateTotal: scheduleType === "specific_dates" && hasVaryingAmounts ? donorAmount : undefined,
      addOnsTotal: addonsTotal,
      addOnBreakdown,
      tipPct: Number(tip.platformTipPercent || 0),
      customTipAmount: tip.platformTipAmount ? String(tip.platformTipAmount) : "",
      maxStep: 1,
      submitted: false,
      donorMessage: "",
      anonymous: false,
      paymentMethod: "card",
    })
  );

  const slug = String(form.slug || "");
  router.push(slug ? `/${slug}/1` : "/donate/1");
}

const ActionButtons = ({ isActive, isPaused, isCancelled, isCompleted, slug, onPauseResume, onCancel }) => {
  const router = useRouter();
  const [editLoading, setEditLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // "pause" | "resume" | "cancel" | null
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const canEdit = isActive;
  const canPauseResume = isActive || isPaused;
  const canCancel = isActive || isPaused;

  const openModal = (mode) => {
    setModalError("");
    setActiveModal(mode);
  };
  const closeModal = () => { if (!modalLoading) setActiveModal(null); };

  const handleEdit = async () => {
    if (!canEdit || editLoading) return;
    setEditLoading(true);
    try {
      await openScheduleEditSession(slug, router);
    } catch (e) {
      console.error("Schedule edit failed:", e?.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handlePauseClick = () => {
    if (!canPauseResume || modalLoading) return;
    openModal(isActive ? "pause" : "resume");
  };

  const handleModalConfirm = async (value) => {
    setModalLoading(true);
    setModalError("");
    try {
      if (activeModal === "pause") {
        await pauseUserSchedule(slug, value);
        onPauseResume?.("paused");
      } else if (activeModal === "resume") {
        await resumeUserSchedule(slug, value);
        onPauseResume?.("active");
      } else if (activeModal === "cancel") {
        await cancelUserSchedule(slug, value);
        onCancel?.("cancelled");
      }
      setActiveModal(null);
    } catch (e) {
      setModalError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        title="Edit"
        onClick={canEdit ? handleEdit : undefined}
        disabled={editLoading}
        className={`w-8 h-8 rounded-lg border border-dashed flex items-center justify-center transition-colors ${
          canEdit
            ? "border-[#E5E7EB] text-[#6B7280] hover:border-blue-500/40 hover:text-blue-600 hover:bg-blue-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            : "border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed opacity-50"
        }`}
      >
        {editLoading ? Spinner : EditIcon}
      </button>

      <button
        type="button"
        title={isActive ? "Pause" : "Resume"}
        disabled={!canPauseResume || pauseLoading}
        onClick={handlePauseClick}
        className={`w-8 h-8 rounded-lg border border-dashed flex items-center justify-center transition-colors ${
          canPauseResume
            ? isActive
              ? "border-[#E5E7EB] text-[#6B7280] hover:border-amber-500/40 hover:text-amber-600 hover:bg-amber-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              : "border-[#E5E7EB] text-[#6B7280] hover:border-emerald-500/40 hover:text-emerald-600 hover:bg-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            : "border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed opacity-50"
        }`}
      >
        {pauseLoading ? Spinner : isActive ? PauseIcon : PlayIcon}
      </button>

      <PauseScheduleModal
        open={showPauseModal}
        onClose={() => !pauseLoading && setShowPauseModal(false)}
        onConfirm={handlePauseConfirm}
        loading={pauseLoading}
        error={pauseError}
      />

      <ResumeScheduleModal
        open={showResumeModal}
        onClose={() => !resumeLoading && setShowResumeModal(false)}
        onConfirm={handleResumeConfirm}
        loading={resumeLoading}
        error={resumeError}
      />

      <button
        type="button"
        title="Cancel"
        disabled={!canCancel || cancelLoading}
        onClick={() => canCancel && !cancelLoading && (setCancelError(""), setShowCancelModal(true))}
        className={`w-8 h-8 rounded-lg border border-dashed flex items-center justify-center transition-colors ${
          canCancel
            ? "border-[#E5E7EB] text-[#6B7280] hover:border-red-500/40 hover:text-red-600 hover:bg-red-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            : "border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed opacity-50"
        }`}
      >
        {cancelLoading ? Spinner : CancelScheduleIcon}
      </button>

      <CancelScheduleModal
        open={showCancelModal}
        onClose={() => !cancelLoading && setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        loading={cancelLoading}
        error={cancelError}
      />

      <Link
        href={`/dashboard/schedules/${slug}`}
        title="View"
        className="w-8 h-8 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-red-500/40 hover:text-red-600 hover:bg-red-500/10 transition-colors"
      >
        {EyeIcon}
      </Link>
    </>
  );
};

export default ActionButtons;
