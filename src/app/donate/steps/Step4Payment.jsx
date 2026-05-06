"use client";

import { useDonation } from "@/context/DonationContext";
import { useStepNavigation } from "@/hooks/useStepNavigation";
import StepLayout from "../DonateComponents/StepLayout";
import { useState, useMemo } from "react";
import Select from "@/components/ui/Select";
import MiniCalendar from "./StepComponents/MiniCalendar";

const PAYMENT_TYPES = [
  { value: "one-time",  label: "One-time Payment", desc: (amt, sym) => `Pay the full amount of ${sym}${amt} today` },
  { value: "recurring", label: "Split Payments",    desc: () => "Split your donation into scheduled payments" },
];

const SCHEDULE_TYPES = [
  { value: "specific_dates", label: "Specific Dates" },
  { value: "date_range",     label: "Date Range" },
];

const FREQ_OPTIONS = [
  { value: "daily",   label: "Daily" },
  { value: "weekly",  label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const CURRENCY_OPTIONS = [
  { label: "USD ($)",   value: "USD", symbol: "$"   },
  { label: "GBP (£)",   value: "GBP", symbol: "£"   },
  { label: "EUR (€)",   value: "EUR", symbol: "€"   },
  { label: "CAD (CA$)", value: "CAD", symbol: "CA$" },
];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];


function countOccurrences(start, end, freq) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  if (freq === "daily")   return Math.floor((e - s) / 86400000) + 1;
  if (freq === "weekly")  return Math.floor((e - s) / (86400000 * 7)) + 1;
  if (freq === "monthly")
    return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  return 1;
}

const Step4Payment = () => {
  const { data, update } = useDonation();
  const { handleNext, handlePrev } = useStepNavigation();

  const suggestedAmounts = useMemo(() => {
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      return meta.suggestedAmounts?.length ? meta.suggestedAmounts : [25, 50, 100];
    } catch { return [25, 50, 100]; }
  }, []);

  const paymentType = data.paymentType ?? "one-time";
  const currency    = data.currency    ?? "USD";

  const initAmount   = data.amountTier ?? Number(data.amount) ?? suggestedAmounts[0] ?? 25;
  const isCustomInit = initAmount && !suggestedAmounts.includes(initAmount);

  const [selectedTier, setSelectedTier] = useState(isCustomInit ? null : (initAmount || suggestedAmounts[0]));
  const [customAmount, setCustomAmount] = useState(isCustomInit ? String(initAmount) : "");

  const [scheduleType, setScheduleType] = useState(data.scheduleType ?? "specific_dates");
  const [selectedDates, setSelectedDates] = useState(() => {
    const stored = data.scheduleConfig?.dates ?? [];
    return stored.map((d) => d.split("T")[0]);
  });
  const [rangeStart, setRangeStart] = useState(data.scheduleConfig?.startDate?.split("T")[0] ?? "");
  const [rangeEnd,   setRangeEnd]   = useState(data.scheduleConfig?.endDate?.split("T")[0]   ?? "");
  const [rangeFreq,  setRangeFreq]  = useState(data.scheduleConfig?.frequency ?? "daily");

  const effectiveAmount = customAmount ? Number(customAmount) : (selectedTier ?? 0);
  const isRecurring     = paymentType === "recurring";
  const currencyData    = CURRENCY_OPTIONS.find((c) => c.value === currency) ?? CURRENCY_OPTIONS[0];
  const sym             = currencyData.symbol;

  const todayStr = new Date().toISOString().split("T")[0];

  const toggleDate = (dateStr) =>
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );

  const occurrences = isRecurring
    ? (scheduleType === "specific_dates"
      ? selectedDates.length
      : countOccurrences(rangeStart, rangeEnd, rangeFreq))
    : 1;

  const totalAmount = effectiveAmount * occurrences;

  const buildScheduleConfig = () => {
    if (scheduleType === "specific_dates") {
      const sorted = [...selectedDates].sort();
      return { dates: sorted.map((d) => new Date(`${d}T00:00:00.000Z`).toISOString()) };
    }
    return {
      startDate: rangeStart ? new Date(`${rangeStart}T00:00:00.000Z`).toISOString() : "",
      endDate:   rangeEnd   ? new Date(`${rangeEnd}T00:00:00.000Z`).toISOString()   : "",
      frequency: rangeFreq,
    };
  };

  return (
    <StepLayout
      step={4}
      title="Payment"
      subtitle="Choose between a one-time or split donation, select an amount or enter a custom value"
      onNext={() => {
        update({
          paymentType,
          currency,
          amountTier:       effectiveAmount,
          scheduleType:     isRecurring ? scheduleType  : undefined,
          scheduleConfig:   isRecurring ? buildScheduleConfig() : undefined,
          installmentCount: occurrences,
          numberOfDays:     isRecurring ? occurrences : 1,
          frequency:        isRecurring && scheduleType === "date_range" ? rangeFreq : undefined,
        });
        handleNext(5);
      }}
      onPrev={() => handlePrev(data.isRamadan ? 3 : 2)}
      prevLabel="Back"
      nextLabel="Add-ons"
    >
      <div className="flex flex-col gap-4">
        {/* Payment type */}
        <div className="flex flex-col gap-2.5">
          {PAYMENT_TYPES.map((type) => {
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

        {/* Recurring schedule */}
        {isRecurring && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#383838] mb-2">Schedule Type</label>
              <div className="flex gap-2">
                {SCHEDULE_TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScheduleType(opt.value)}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all cursor-pointer ${
                      scheduleType === opt.value
                        ? "border-[#EA3335] bg-[#FFF5F5] text-[#EA3335]"
                        : "border-[#E5E5E5] bg-white text-[#737373] hover:border-[#EA3335]/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {scheduleType === "specific_dates" ? (
              <div>
                <label className="block text-[13px] font-medium text-[#383838] mb-2">
                  Select Donation Dates
                  {selectedDates.length > 0 && (
                    <span className="ml-1.5 text-[#EA3335]">({selectedDates.length} selected)</span>
                  )}
                </label>
                <MiniCalendar selectedDates={selectedDates} onToggleDate={toggleDate} />
                {selectedDates.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[...selectedDates].sort().map((d) => (
                      <span
                        key={d}
                        className="flex items-center gap-1 text-[11px] bg-[#FFF5F5] border border-[#FFCCCC] text-[#EA3335] rounded-lg px-2 py-1 font-medium"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() => toggleDate(d)}
                          className="ml-0.5 hover:text-[#c0272a] cursor-pointer leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-[#383838] mb-2">Start Date</label>
                    <input
                      type="date"
                      value={rangeStart}
                      min={todayStr}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-[14px] text-[#383838] outline-none focus:border-[#EA3335] bg-white transition-colors cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#383838] mb-2">End Date</label>
                    <input
                      type="date"
                      value={rangeEnd}
                      min={rangeStart || todayStr}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E5E5] text-[14px] text-[#383838] outline-none focus:border-[#EA3335] bg-white transition-colors cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#383838] mb-2">Frequency</label>
                  <Select value={rangeFreq} onChange={setRangeFreq} options={FREQ_OPTIONS} />
                </div>
                {rangeStart && rangeEnd && occurrences > 0 && (
                  <p className="text-[12px] text-[#737373] bg-[#F9F9F9] rounded-xl px-4 py-2.5 border border-[#EBEBEB]">
                    {occurrences} payment{occurrences !== 1 ? "s" : ""} of {sym}{effectiveAmount} each
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Currency */}
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-2">Currency</label>
          <Select value={currency} onChange={(val) => update({ currency: val })} options={CURRENCY_OPTIONS} />
        </div>

        {/* Amount tiles */}
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-3">
            {isRecurring ? "Donation Amount (per payment)" : "Donation Amount"}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {suggestedAmounts.map((amt) => {
              const active = selectedTier === amt && !customAmount;
              return (
                <button
                  key={amt}
                  onClick={() => { setSelectedTier(amt); setCustomAmount(""); }}
                  className={`flex flex-col items-center justify-center rounded-2xl px-4 py-4 border transition-all duration-200 cursor-pointer ${
                    active ? "border-[#EA3335] bg-[#FFF5F5]" : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40"
                  }`}
                >
                  <span className={`text-[22px] font-bold leading-none ${active ? "text-[#EA3335]" : "text-[#383838]"}`}>
                    {sym}{amt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-2">Custom Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] font-medium text-[15px]">{sym}</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedTier(null); }}
              placeholder="Enter amount"
              min={1}
              className={`w-full pl-9 pr-4 py-3 rounded-xl border text-[15px] outline-none transition-colors focus:border-[#EA3335] ${
                customAmount
                  ? "border-[#EA3335] bg-[#FFF5F5] text-[#383838]"
                  : "border-[#E5E5E5] bg-white text-[#383838]"
              }`}
            />
          </div>
        </div>

        {/* Total */}
        <div>
          <label className="block text-[13px] font-medium text-[#383838] mb-2">
            {isRecurring
              ? `Total Amount (${occurrences} payment${occurrences !== 1 ? "s" : ""})`
              : "Total Amount"}
          </label>
          <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-[16px] text-[#737373] font-medium">{sym}</span>
            <span className="text-[28px] font-bold text-[#383838] leading-none">
              {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step4Payment;
