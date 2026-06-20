"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";
import { EditIcon, PauseIcon, PlayIcon, Spinner } from "@/components/common/SvgIcon";
import { getUserScheduleEditForm } from "@/services/donationService";

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

export function ScheduleSidebar({ loading, totalDonated, currency, nextShort, frequency, nextAmount, statusKey, scheduleId }) {
  const router = useRouter();
  const [editLoading, setEditLoading] = useState(false);
  const isActive = String(statusKey || "").toLowerCase() === "active";
  const isPaused = String(statusKey || "").toLowerCase() === "paused";
  const canEdit = isActive;
  const canPauseResume = isActive || isPaused;

  const handleEdit = async () => {
    if (editLoading || !scheduleId) return;
    setEditLoading(true);
    try {
      await openScheduleEditSession(scheduleId, router);
    } catch (e) {
      console.error("Schedule edit failed:", e?.message);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            <SkeletonBlock className="h-24 rounded-2xl" />
            <SkeletonBlock className="h-16 rounded-xl" />
            <SkeletonBlock className="h-20 rounded-xl" />
          </div>
        ) : (
          <div className="px-4 py-4 space-y-0">
            <div className="bg-[#1A1A1A] px-5 py-4 rounded-2xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#9CA3AF] mb-1">Total Contributed</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalDonated, currency)}</p>
              <p className="mt-1 text-xs text-[#6B7280]">Lifetime for this schedule</p>
            </div>

            <div className="border-b px-5 py-4 border-dashed border-[#E5E7EB]">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] mb-1">Next Donation</p>
              <p className="text-sm font-semibold text-[#111827]">{nextShort}</p>
              <div className="mt-3 pt-3 border-t border-dashed border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                <span>{frequency}</span>
                <span className="font-semibold text-[#EA3335]">{formatCurrency(nextAmount, currency)}</span>
              </div>
            </div>

            <div className="px-5 pt-4 pb-2">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] mb-3">Actions</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={canEdit ? handleEdit : undefined}
                  disabled={editLoading}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    canEdit
                      ? "bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed opacity-50"
                  }`}
                >
                  {editLoading ? Spinner : EditIcon}
                  {editLoading ? "Loading..." : "Edit Schedule"}
                </button>
                <button
                  type="button"
                  disabled={!canPauseResume}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    canPauseResume
                      ? "bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] cursor-pointer"
                      : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed opacity-50"
                  }`}
                >
                  {isActive ? PauseIcon : PlayIcon}
                  {isActive ? "Pause Schedule" : "Resume Schedule"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
