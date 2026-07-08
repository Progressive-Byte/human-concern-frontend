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
  locked = false,
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
  const [locked, setLocked]                       = useState(defaultLocked);

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

  const handleCurrencyChange = (newCurrency) => {
    const newRate = rateMap[newCurrency] ?? 1;
    // Recompute the effective amount in the new currency from the selected base
    if (selectedBase !== null && !customAmount) {
      const newConverted = Math.round(selectedBase * newRate * 100) / 100;
      onAmountChange(newConverted, false);
    }
    onCurrencyChange(newCurrency);
  };

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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-2">Currency</label>
        {disableCurrency ? (
          <div className="w-full bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl px-4 py-3 text-[14px] text-[#9CA3AF] cursor-not-allowed flex items-center justify-between">
            <span>{currencyOptions.find((o) => o.value === currency)?.label ?? currency}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#D1D5DB]">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        ) : (
          <Select value={currency} onChange={handleCurrencyChange} options={currencyOptions} />
        )}
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#383838] mb-3">
          {isRecurring
            ? splitMode === "divide"
              ? "Total Donation Amount"
              : "Donation Amount (per payment)"
            : "Donation Amount"}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {suggestedAmounts.map((base) => {
            const displayAmt = toConverted(base);
            const active     = selectedBase === base && !customAmount;
            return (
              <button
                key={base}
                onClick={() => handleTileClick(base)}
                className={`flex flex-col items-center justify-center rounded-2xl px-3 py-4 border transition-all duration-200 cursor-pointer ${
                  active ? "border-[#EA3335] bg-[#FFF5F5]" : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40"
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
          customAmountError
            ? "border-[#EA3335] bg-[#FFF5F5]"
            : customAmount
            ? "border-[#EA3335] bg-[#FFF5F5]"
            : "border-[#E5E5E5] bg-white focus-within:border-[#EA3335]"
        }`}>
          <span className="pl-4 pr-1 shrink-0 text-[#737373] font-medium text-[15px]">{sym}</span>
          <input
            type="number"
            value={customAmount}
            onChange={handleCustomChange}
            onBlur={handleCustomBlur}
            placeholder={`Enter amount (min ${formatDisplay(convertedMin)})`}
            min={convertedMin}
            max={convertedMax}
            className="flex-1 pr-4 py-3 text-[15px] outline-none bg-transparent text-[#383838]"
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
