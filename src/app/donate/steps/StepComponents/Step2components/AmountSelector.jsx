"use client";

import { useState, useMemo, useEffect, useRef } from "react";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$", NZD: "NZ$",
  SGD: "S$", HKD: "HK$", CHF: "CHF", JPY: "¥", NOK: "kr", SEK: "kr", DKK: "kr",
};

function getCurrencySymbol(code) {
  return CURRENCY_SYMBOLS[code] ?? code;
}

function formatDisplay(val) {
  return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2);
}

const AmountSelector = ({
  suggestedAmounts,       // base amounts in campaign's base currency [25, 100]
  currenciesWithRates,    // [{currency, rate}] — rate relative to base (USD=1)
  minDonation,
  maxDonation,
  currency,
  isRecurring,
  splitMode,
  occurrences,
  initialAmount,
  onAmountChange,
  overrideTotal,
}) => {
  // Build rate map from campaign data
  const rateMap = useMemo(() => {
    const map = {};
    (currenciesWithRates ?? []).forEach(({ currency: code, rate }) => {
      map[code] = parseFloat(rate) || 1;
    });
    return map;
  }, [currenciesWithRates]);

  const sym  = getCurrencySymbol(currency);
  const rate = rateMap[currency] ?? 1;

  function toConverted(baseAmt) {
    const v = baseAmt * rate;
    return Math.round(v * 100) / 100;
  }

  function toBase(convertedAmt) {
    return convertedAmt / rate;
  }

  // On mount only: find which base preset matches the initial amount (reverse-convert)
  const { initialBase, isCustomInit } = useMemo(() => {
    const r = rateMap[currency] ?? 1;
    const base = initialAmount
      ? suggestedAmounts.find((b) => Math.abs(b - initialAmount / r) < 0.01) ?? null
      : suggestedAmounts[0] ?? null;
    return { initialBase: base, isCustomInit: !base && Number(initialAmount) > 0 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedBase, setSelectedBase]           = useState(initialBase ?? suggestedAmounts[0] ?? null);
  const [customAmount, setCustomAmount]           = useState(isCustomInit ? String(Math.round(Number(initialAmount) * 100) / 100) : "");
  const [customAmountError, setCustomAmountError] = useState("");
  // Amount starts locked to the pre-selected value; the donor must explicitly
  // click "Edit change" to modify it, mirroring Step1Info's field lock pattern.
  const [locked, setLocked] = useState(true);

  const convertedMin = toConverted(minDonation ?? 0);
  const convertedMax = maxDonation != null ? toConverted(maxDonation) : undefined;

  const effectiveAmount = customAmount
    ? Number(customAmount)
    : toConverted(selectedBase ?? 0);

  const uniformTotal  = effectiveAmount * occurrences;
  const displayTotal  = (overrideTotal !== null && overrideTotal !== undefined) ? overrideTotal : uniformTotal;

  const handleTileClick = (base) => {
    setSelectedBase(base);
    setCustomAmount("");
    setCustomAmountError("");
    onAmountChange(toConverted(base), false);
  };

  // Currency is now selected by the parent (Step2Payment); recompute the
  // effective amount from the selected base whenever it changes here.
  const isFirstCurrencyRender = useRef(true);
  useEffect(() => {
    if (isFirstCurrencyRender.current) {
      isFirstCurrencyRender.current = false;
      return;
    }
    if (selectedBase !== null && !customAmount) {
      onAmountChange(toConverted(selectedBase), false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    setSelectedBase(null);
    if (val === "") {
      setCustomAmountError("");
      onAmountChange(0, false);
      return;
    }
    const num    = Number(val);
    const hasErr = num < convertedMin || Boolean(convertedMax != null && num > convertedMax);
    if (num < convertedMin) {
      setCustomAmountError(`Minimum donation amount is ${sym}${formatDisplay(convertedMin)}`);
    } else if (convertedMax != null && num > convertedMax) {
      setCustomAmountError(`Maximum donation amount is ${sym}${formatDisplay(convertedMax)}`);
    } else {
      setCustomAmountError("");
    }
    onAmountChange(num, hasErr);
  };

  const handleCustomBlur = () => {
    if (!customAmount) return;
    const num = Number(customAmount);
    if (num < convertedMin) {
      setCustomAmount(String(convertedMin));
      setCustomAmountError("");
      onAmountChange(convertedMin, false);
    } else if (convertedMax != null && num > convertedMax) {
      setCustomAmount(String(convertedMax));
      setCustomAmountError("");
      onAmountChange(convertedMax, false);
    }
  };

  const recurringLabel = isRecurring
    ? splitMode === "divide"
      ? "Total Donation Amount"
      : "Donation Amount (per payment)"
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          {recurringLabel ? (
            <label className="block text-[13px] font-medium text-[#383838]">{recurringLabel}</label>
          ) : <span />}
          <button
            type="button"
            onClick={() => setLocked((prev) => !prev)}
            className={`text-[12px] font-medium transition-colors cursor-pointer select-none whitespace-nowrap ${
              locked ? "text-[#AEAEAE] opacity-60" : "text-[#EA3335] hover:underline"
            }`}
          >
            {locked ? "Edit change" : "Save change"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {suggestedAmounts.map((base) => {
            const displayAmt = toConverted(base);
            const active     = selectedBase === base && !customAmount;
            return (
              <button
                key={base}
                type="button"
                onClick={locked ? undefined : () => handleTileClick(base)}
                disabled={locked}
                className={`flex flex-col items-center justify-center rounded-2xl px-3 py-4 border transition-all duration-200 ${
                  locked
                    ? active
                      ? "border-[#EA3335]/50 bg-[#FFF5F5] opacity-80 cursor-not-allowed"
                      : "border-[#E5E5E5] bg-[#F9FAFB] opacity-60 cursor-not-allowed"
                    : active
                    ? "border-[#EA3335] bg-[#FFF5F5] cursor-pointer"
                    : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40 cursor-pointer"
                }`}
              >
                <span className={`text-[19px] font-bold leading-none whitespace-nowrap ${active ? "text-[#EA3335]" : "text-[#383838]"}`}>
                  {sym}{formatDisplay(displayAmt)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-2">Custom Amount</label>
        <div className={`flex items-center rounded-xl border transition-colors ${
          locked
            ? "border-dashed border-[#E5E7EB] bg-[#F3F4F6]"
            : customAmountError
            ? "border-[#EA3335] bg-[#FFF5F5]"
            : customAmount
            ? "border-[#EA3335] bg-[#FFF5F5]"
            : "border-[#E5E5E5] bg-white focus-within:border-[#EA3335]"
        }`}>
          <span className={`pl-4 pr-1 shrink-0 font-medium text-[15px] ${locked ? "text-[#9CA3AF]" : "text-[#737373]"}`}>{sym}</span>
          <input
            type="number"
            value={customAmount}
            onChange={locked ? undefined : handleCustomChange}
            onBlur={locked ? undefined : handleCustomBlur}
            readOnly={locked}
            placeholder={`Enter amount (min ${formatDisplay(convertedMin)})`}
            min={convertedMin}
            max={convertedMax}
            className={`flex-1 pr-4 py-3 text-[15px] outline-none bg-transparent ${locked ? "text-[#9CA3AF] cursor-default" : "text-[#383838]"}`}
          />
        </div>
        {customAmountError && (
          <p className="text-[12px] text-[#EA3335] mt-1.5 px-1">{customAmountError}</p>
        )}
      </div>
    </div>
  );
};

export default AmountSelector;
