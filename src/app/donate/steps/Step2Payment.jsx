"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout        from "./StepComponents/StepLayout";
import countOccurrences, { generateDatesInRange } from "./StepComponents/countOccurrences";
import RecurringSchedule from "./StepComponents/Step2components/RecurringSchedule";
import AmountSelector    from "./StepComponents/Step2components/AmountSelector";
import SectionStep from "./StepComponents/Step2components/SectionStep";

const PAYMENT_TYPES = [
  { value: "one-time",  label: "One-time payment",  desc: (amt, sym) => `Pay the full amount of ${sym}${amt} today` },
  { value: "recurring", label: "Recurring payments", desc: () => "Split your donation into scheduled payments" },
];

const Step2Payment = () => {
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();
  const router = useRouter();

  useEffect(() => {
    if (data.submitted) {
      const base = data.campaign ? `/${data.campaign}` : "/donate";
      router.replace(`${base}/4`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { suggestedAmounts, allowRecurring, minDonation, maxDonation, recurringPresets } = useMemo(() => {
    try {
      const meta       = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      const goalsDates = meta.goalsDates ?? {};
      return {
        suggestedAmounts: meta.suggestedAmounts?.length ? meta.suggestedAmounts : [25, 50, 100],
        allowRecurring:   goalsDates.allowRecurringDonations ?? true,
        minDonation:      goalsDates.minimumDonation         ?? 1,
        maxDonation:      goalsDates.maximumDonation         ?? undefined,
        recurringPresets: (goalsDates.recurringPresets ?? [])
          .filter((p) => p.enabled)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      };
    } catch {
      return { suggestedAmounts: [25, 50, 100], allowRecurring: true, minDonation: 1, maxDonation: undefined, recurringPresets: [] };
    }
  }, []);

  useEffect(() => {
    if (!allowRecurring && data.paymentType === "recurring") update({ paymentType: "one-time" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowRecurring]);

  const paymentType = data.paymentType ?? "one-time";
  const isRecurring = paymentType === "recurring";
  // donorAmount = the UI-facing total the user chose (restored on back-navigation).
  // amountTier  = the derived per-date amount (e.g. $50÷4 = $12.5) — NOT suitable
  //               for restoring the amount field because it would show the divided value.
  const _donorAmt   = data.donorAmount && Number.isFinite(data.donorAmount) ? data.donorAmount : null;
  const _urlAmt     = data.amount && Number.isFinite(Number(data.amount)) ? Number(data.amount) : null;
  const initAmount  = _donorAmt ?? _urlAmt ?? suggestedAmounts[0] ?? 25;
  const sym         = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" }[data.currency ?? "USD"] ?? "$";

  const initOccurrences = useMemo(() => {
    const sc = data.scheduleConfig;
    if (!sc || !isRecurring) return 1;
    if (data.scheduleType === "specific_dates") return sc.dates?.length ?? 1;
    return countOccurrences(sc.startDate?.split("T")[0], sc.endDate?.split("T")[0], sc.frequency ?? "daily", sc.customInterval ?? 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [effectiveAmount, setEffectiveAmount] = useState(initAmount);
  const [amountError,     setAmountError]     = useState(false);
  const [occurrences,     setOccurrences]     = useState(isRecurring ? initOccurrences : 1);
  const [splitMode,       setSplitMode]       = useState(data.splitMode ?? "repeat");
  const [activePreset,    setActivePreset]    = useState(data.schedulePreset ?? "custom");
  const [scheduleState,   setScheduleState]   = useState({
    scheduleType:   data.scheduleType   ?? "specific_dates",
    scheduleConfig: data.scheduleConfig ?? {},
  });

  // Per-date default amount based on split mode
  const defaultPerDate = isRecurring && splitMode === "divide" && occurrences > 0
    ? Math.round((effectiveAmount / occurrences) * 100) / 100
    : effectiveAmount;

  const perDateTotal = useMemo(() => {
    if (!isRecurring) return null;
    const config    = scheduleState.scheduleConfig ?? {};
    const overrides = config.dateAmounts ?? {};

    if (scheduleState.scheduleType === "specific_dates") {
      const dates = config.dates ?? [];
      if (!dates.length) return null;
      return dates.reduce((sum, isoDate) => {
        const d   = isoDate.split("T")[0];
        const amt = overrides[d] !== undefined ? Number(overrides[d]) : defaultPerDate;
        return sum + (isNaN(amt) ? defaultPerDate : amt);
      }, 0);
    }

    if (scheduleState.scheduleType === "date_range") {
      const start = config.startDate?.split("T")[0];
      const end   = config.endDate?.split("T")[0];
      const freq  = config.frequency ?? "daily";
      if (!start || !end) return null;
      const dates = generateDatesInRange(start, end, freq);
      if (!dates.length) return null;
      const hasOverrides = Object.keys(overrides).length > 0;
      if (!hasOverrides) return null;
      return dates.reduce((sum, d) => {
        const amt = overrides[d] !== undefined ? Number(overrides[d]) : defaultPerDate;
        return sum + (isNaN(amt) ? defaultPerDate : amt);
      }, 0);
    }

    return null;
  }, [isRecurring, scheduleState, defaultPerDate]);

  // Sync local state to context in real-time
  useEffect(() => {
    update({
      donorAmount:      effectiveAmount,
      amountTier:       defaultPerDate,
      splitMode:        isRecurring ? splitMode : undefined,
      scheduleType:     isRecurring ? scheduleState.scheduleType   : undefined,
      scheduleConfig:   isRecurring ? scheduleState.scheduleConfig : undefined,
      schedulePreset:   isRecurring ? activePreset : undefined,
      installmentCount: isRecurring ? occurrences : 1,
      numberOfDays:     isRecurring ? occurrences : 1,
      frequency:        isRecurring && scheduleState.scheduleType === "date_range"
        ? scheduleState.scheduleConfig?.frequency
        : undefined,
      perDateTotal: isRecurring && perDateTotal !== null ? perDateTotal : undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveAmount, defaultPerDate, isRecurring, splitMode, scheduleState, occurrences, perDateTotal, activePreset]);

  const handleAmountChange = (amount, hasError) => {
    setEffectiveAmount(amount);
    setAmountError(hasError);
  };

  const handleScheduleChange = ({ scheduleType, scheduleConfig, occurrences: occ, activePreset: preset }) => {
    setOccurrences(occ);
    setScheduleState({ scheduleType, scheduleConfig });
    if (preset !== undefined) setActivePreset(preset);
  };

  // Dynamic example text for split mode cards
  const safeOcc = occurrences > 0 ? occurrences : 1;
  // Use perDateTotal (actual sum including per-date overrides) when available,
  // otherwise fall back to the simple formula total.
  const repeatDisplayTotal = perDateTotal !== null
    ? perDateTotal
    : effectiveAmount * occurrences;

  const splitModes = [
    {
      value:   "divide",
      title:   "Divide total across dates",
      example: occurrences > 1
        ? `${sym}${effectiveAmount} ÷ ${occurrences} = ${sym}${(effectiveAmount / safeOcc).toFixed(2)}/date`
        : "Select dates to see per-date amount",
    },
    {
      value:   "repeat",
      title:   "Pay this amount each date",
      example: occurrences > 1
        ? `${sym}${effectiveAmount} × ${occurrences} = ${sym}${repeatDisplayTotal.toLocaleString()} total`
        : `${sym}${effectiveAmount} per scheduled date`,
    },
  ];

  return (
    <StepLayout
      step={2}
      title="Payment"
      subtitle="Choose your amount and payment schedule"
      onNext={() => {
        if (amountError) return;
        update({
          paymentType,
          currency:         data.currency ?? "USD",
          amountTier:       defaultPerDate,
          splitMode:        isRecurring ? splitMode : undefined,
          scheduleType:     isRecurring ? scheduleState.scheduleType   : undefined,
          scheduleConfig:   isRecurring ? scheduleState.scheduleConfig : undefined,
          installmentCount: isRecurring ? occurrences : 1,
          numberOfDays:     isRecurring ? occurrences : 1,
          frequency:        isRecurring && scheduleState.scheduleType === "date_range"
            ? scheduleState.scheduleConfig?.frequency
            : undefined,
          perDateTotal: isRecurring && perDateTotal !== null ? perDateTotal : undefined,
        });
        handleNext(3);
      }}
      onPrev={() => handlePrev(1)}
      prevLabel="Back"
      nextLabel="Add-ons"
    >
      <div className="flex flex-col gap-6">

        {/* ── Step 1: Donation Amount ── */}
        <div className="flex flex-col gap-3">
          <SectionStep num={1} title="Donation Amount" />
          <AmountSelector
            suggestedAmounts={suggestedAmounts}
            minDonation={minDonation}
            maxDonation={maxDonation}
            currency={data.currency ?? "USD"}
            isRecurring={isRecurring}
            splitMode={splitMode}
            occurrences={occurrences}
            initialAmount={initAmount}
            onAmountChange={handleAmountChange}
            onCurrencyChange={(val) => update({ currency: val })}
            overrideTotal={perDateTotal}
          />
        </div>

        {/* ── Step 2: Payment mode ── */}
        <div className="flex flex-col gap-3">
          <SectionStep num={2} title="How would you like to pay?" />
          <div className="flex flex-col gap-2.5">
            {PAYMENT_TYPES.filter((t) => t.value === "one-time" || allowRecurring).map((type) => {
              const active = paymentType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => update({ paymentType: type.value })}
                  className={`w-full flex items-center gap-3.5 rounded-2xl px-5 py-4 border text-left transition-all duration-200 cursor-pointer ${
                    active ? "border-[#EA3335] bg-[#FFF5F5]" : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    active ? "border-[#EA3335]" : "border-[#CCCCCC]"
                  }`}>
                    {active && <span className="w-2.5 h-2.5 rounded-full bg-[#EA3335]" />}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-[#383838] leading-snug">{type.label}</p>
                    <p className="text-[12px] text-[#737373] mt-0.5">{type.desc(effectiveAmount, sym)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {isRecurring && (
          <>
            {/* ── Step 3: How to split ── */}
            <div className="flex flex-col gap-3">
              <SectionStep num={3} title="How to split?" />
              <div className="flex gap-2.5">
                {splitModes.map((mode) => {
                  const active = splitMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setSplitMode(mode.value)}
                      className={`w-full flex items-center gap-3.5 rounded-2xl px-5 py-4 border text-left transition-all duration-200 cursor-pointer ${
                        active ? "border-[#EA3335] bg-[#FFF5F5]" : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40"
                      }`}
                    >
                      <div>
                        <p className="text-[14px] font-semibold text-[#383838] leading-snug">{mode.title}</p>
                        <p className="text-[12px] text-[#737373] mt-0.5 font-medium tabular-nums">{mode.example}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Step 4: Choose a schedule ── */}
            <div className="flex flex-col gap-3">
              <SectionStep num={4} title="Choose a schedule" />
              <RecurringSchedule
                sym={sym}
                effectiveAmount={defaultPerDate}
                initialScheduleType={data.scheduleType}
                initialConfig={data.scheduleConfig}
                initialActivePreset={data.schedulePreset}
                apiPresets={recurringPresets}
                onChange={handleScheduleChange}
              />
            </div>
          </>
        )}

      </div>
    </StepLayout>
  );
};

export default Step2Payment;
