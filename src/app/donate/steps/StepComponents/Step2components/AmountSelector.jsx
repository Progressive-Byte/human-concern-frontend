"use client";

import { useState } from "react";
import Select from "@/components/ui/Select";

const CURRENCY_OPTIONS = [
  { label: "USD ($)",   value: "USD", symbol: "$"   },
  { label: "GBP (£)",   value: "GBP", symbol: "£"   },
  { label: "EUR (€)",   value: "EUR", symbol: "€"   },
  { label: "CAD (CA$)", value: "CAD", symbol: "CA$" },
];

const AmountSelector = ({
  suggestedAmounts,
  minDonation,
  maxDonation,
  currency,
  isRecurring,
  splitMode,
  occurrences,
  initialAmount,
  onAmountChange,
  onCurrencyChange,
  overrideTotal,
}) => {
  const isCustomInit = initialAmount && !suggestedAmounts.includes(initialAmount);

  const [selectedTier,      setSelectedTier]      = useState(isCustomInit ? null : (initialAmount || suggestedAmounts[0]));
  const [customAmount,      setCustomAmount]      = useState(isCustomInit ? String(initialAmount) : "");
  const [customAmountError, setCustomAmountError] = useState("");

  const currencyData    = CURRENCY_OPTIONS.find((c) => c.value === currency) ?? CURRENCY_OPTIONS[0];
  const sym             = currencyData.symbol;
  const effectiveAmount = customAmount ? Number(customAmount) : (selectedTier ?? 0);
  const uniformTotal    = effectiveAmount * occurrences;

  // When per-date custom amounts exist, use their sum; otherwise fall back to uniform total
  const displayTotal = (overrideTotal !== null && overrideTotal !== undefined) ? overrideTotal : uniformTotal;
  const hasPerDateAmounts = overrideTotal !== null && overrideTotal !== undefined && overrideTotal !== uniformTotal;

  const handleTileClick = (amt) => {
    setSelectedTier(amt);
    setCustomAmount("");
    setCustomAmountError("");
    onAmountChange(amt, false);
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    setSelectedTier(null);
    if (val === "") { setCustomAmountError(""); onAmountChange(0, false); return; }
    const num    = Number(val);
    const hasErr = num < minDonation || Boolean(maxDonation && num > maxDonation);
    if (num < minDonation) {
      setCustomAmountError(`Minimum donation amount is ${sym}${minDonation}`);
    } else if (maxDonation && num > maxDonation) {
      setCustomAmountError(`Maximum donation amount is ${sym}${maxDonation}`);
    } else {
      setCustomAmountError("");
    }
    onAmountChange(num, hasErr);
  };

  const handleCustomBlur = () => {
    if (!customAmount) return;
    const num = Number(customAmount);
    if (num < minDonation) {
      setCustomAmount(String(minDonation));
      setCustomAmountError("");
      onAmountChange(minDonation, false);
    } else if (maxDonation && num > maxDonation) {
      setCustomAmount(String(maxDonation));
      setCustomAmountError("");
      onAmountChange(maxDonation, false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-2">Currency</label>
        <Select value={currency} onChange={onCurrencyChange} options={CURRENCY_OPTIONS} />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-3">
          {isRecurring
            ? splitMode === "divide"
              ? "Total Donation Amount"
              : "Donation Amount (per payment)"
            : "Donation Amount"}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {suggestedAmounts.map((amt) => {
            const active = selectedTier === amt && !customAmount;
            return (
              <button
                key={amt}
                onClick={() => handleTileClick(amt)}
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

      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-2">Custom Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#737373] font-medium text-[15px]">{sym}</span>
          <input
            type="number"
            value={customAmount}
            onChange={handleCustomChange}
            onBlur={handleCustomBlur}
            placeholder={`Enter amount (${sym}${minDonation}${maxDonation ? ` – ${sym}${maxDonation}` : "+"})`}
            min={minDonation}
            max={maxDonation}
            className={`w-full pl-9 pr-4 py-3 rounded-xl border text-[15px] outline-none transition-colors ${
              customAmountError
                ? "border-[#EA3335] bg-[#FFF5F5] text-[#383838]"
                : customAmount
                ? "border-[#EA3335] bg-[#FFF5F5] text-[#383838]"
                : "border-[#E5E5E5] bg-white text-[#383838] focus:border-[#EA3335]"
            }`}
          />
        </div>
        {customAmountError && (
          <p className="text-[12px] text-[#EA3335] mt-1.5 px-1">{customAmountError}</p>
        )}
      </div>

      {/* <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-medium text-[#383838]">
            {isRecurring && splitMode === "divide"
              ? `Per-payment Amount (÷ ${occurrences})`
              : isRecurring
              ? `Total Amount (${occurrences} payment${occurrences !== 1 ? "s" : ""})`
              : "Total Amount"}
          </label>
          {hasPerDateAmounts && (
            <span className="text-[11px] text-[#737373] bg-[#F3F4F6] rounded-full px-2 py-0.5">
              includes per-date amounts
            </span>
          )}
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-[16px] text-[#737373] font-medium">{sym}</span>
          <span className="text-[28px] font-bold text-[#383838] leading-none">
            {isRecurring && splitMode === "divide" && occurrences > 0
              ? (effectiveAmount / occurrences).toFixed(2)
              : displayTotal.toLocaleString()}
          </span>
        </div>
        {isRecurring && splitMode === "divide" && occurrences > 0 && (
          <p className="text-[11px] text-[#737373] mt-1.5 px-1">
            {sym}{effectiveAmount} ÷ {occurrences} dates = {sym}{(effectiveAmount / occurrences).toFixed(2)}/date
          </p>
        )}
      </div> */}
    </div>
  );
};

export default AmountSelector;
