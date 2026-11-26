"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { EditIcon } from "@/components/common/SvgIcon";

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
  suggestedAmountsData = [],   // [{ value, description, isDefault }] — the admin's preset list
  onAmountChange,
  overrideTotal,
  feeSlot = null,              // platform fee slider, shown with the amount controls
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

  // Preset tiles show a clean whole amount once the currency changes. The base currency keeps
  // its own values, and a custom amount is still typed by the donor.
  function toPresetAmount(baseAmt) {
    if (rate === 1) return baseAmt;
    return Math.round(baseAmt * rate);
  }

  function toBase(convertedAmt) {
    return convertedAmt / rate;
  }

  const adminDefaultBase = Number(suggestedAmountsData.find((a) => a?.isDefault)?.value);
  const fallbackBase =
    Number.isFinite(adminDefaultBase) && suggestedAmounts.includes(adminDefaultBase)
      ? adminDefaultBase
      : suggestedAmounts[0] ?? null;

  // On mount only: find which base preset matches the initial amount (reverse-convert).
  const { initialBase, isCustomInit } = useMemo(() => {
    const r = rateMap[currency] ?? 1;
    const base = initialAmount
      ? suggestedAmounts.find(
          (b) => Math.abs(Math.round(b * r) - initialAmount) < 0.01 || Math.abs(b - initialAmount / r) < 0.01
        ) ?? null
      : fallbackBase;
    return { initialBase: base ?? fallbackBase, isCustomInit: !base && Number(initialAmount) > 0 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedBase, setSelectedBase]           = useState(initialBase ?? suggestedAmounts[0] ?? null);
  const [customAmount, setCustomAmount]           = useState(isCustomInit ? String(Math.round(Number(initialAmount) * 100) / 100) : "");
  const [customAmountError, setCustomAmountError] = useState("");

  /*
    `initialAmount` can arrive after the first render: on a client-side navigation the provider
    mounts before the router exposes the new query string, so the donor's ?amount= lands a tick
    later. Without this the tiles keep showing the admin default and the donor's pick is lost.
    Only adopt it while the donor has not chosen anything themselves.
  */
  const donorTouchedAmount = useRef(false);
  const adoptedInitialRef  = useRef(Number(initialAmount) || 0);
  useEffect(() => {
    const next = Number(initialAmount) || 0;
    if (!next || next === adoptedInitialRef.current) return;
    adoptedInitialRef.current = next;
    if (donorTouchedAmount.current) return;

    const r = rateMap[currency] ?? 1;
    const matched = suggestedAmounts.find(
      (b) => Math.abs(Math.round(b * r) - next) < 0.01 || Math.abs(b - next / r) < 0.01
    );
    if (matched !== undefined) {
      setSelectedBase(matched);
      setCustomAmount("");
    } else {
      setSelectedBase(null);
      setCustomAmount(String(Math.round(next * 100) / 100));
    }
    setCustomAmountError("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAmount]);
  // Amount starts locked to the pre-selected value; the donor must explicitly
  // click "Change amount" to modify it, mirroring Step1Info's field lock pattern.
  const [locked, setLocked] = useState(true);

  const occ = Math.max(1, Number(occurrences) || 1);
  // "Pay this amount each date" holds a per-payment value; "Divide total" holds the total.
  const perPaymentEntry = Boolean(isRecurring) && splitMode !== "divide";

  const totalsMin = toConverted(minDonation ?? 0);
  const totalsMax = maxDonation != null ? toConverted(maxDonation) : null;

  // The campaign min/max applies to the whole schedule ($10 × 5 = $50 vs a $50 minimum),
  // so in per-payment mode the input bounds are the totals divided by the payment count.
  const convertedMin = perPaymentEntry ? totalsMin / occ : totalsMin;
  const convertedMax = totalsMax != null ? (perPaymentEntry ? totalsMax / occ : totalsMax) : undefined;

  const minAmountError = perPaymentEntry
    ? `Total must be at least ${sym}${formatDisplay(totalsMin)} (${occ} × ${sym}${formatDisplay(convertedMin)})`
    : `Minimum donation amount is ${sym}${formatDisplay(totalsMin)}`;
  const maxAmountError = totalsMax != null
    ? (perPaymentEntry
        ? `Total must not exceed ${sym}${formatDisplay(totalsMax)}`
        : `Maximum donation amount is ${sym}${formatDisplay(totalsMax)}`)
    : "";

  const effectiveAmount = customAmount
    ? Number(customAmount)
    : toPresetAmount(selectedBase ?? 0);

  // Admin description for a preset. A typed custom amount has no preset, so it has none.
  const descriptionFor = (base) =>
    suggestedAmountsData.find((a) => Number(a?.value) === Number(base))?.description ?? "";
  const currentDescription = selectedBase !== null && !customAmount ? descriptionFor(selectedBase) : "";

  const uniformTotal  = effectiveAmount * occurrences;
  const displayTotal  = (overrideTotal !== null && overrideTotal !== undefined) ? overrideTotal : uniformTotal;

  const handleTileClick = (base) => {
    donorTouchedAmount.current = true;
    setSelectedBase(base);
    setCustomAmount("");
    setCustomAmountError("");
    onAmountChange(toPresetAmount(base), false);
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
      onAmountChange(toPresetAmount(selectedBase), false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const handleCustomChange = (e) => {
    donorTouchedAmount.current = true;
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
      setCustomAmountError(minAmountError);
    } else if (convertedMax != null && num > convertedMax) {
      setCustomAmountError(maxAmountError);
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
        <div className="mb-3 flex items-start justify-between gap-3">
          {locked ? (
            // Locked: the chosen amount sits inline here — compact, not a big dead tile.
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[22px] font-bold leading-none whitespace-nowrap text-[#EA3335]">
                {sym}{formatDisplay(effectiveAmount)}
              </span>
              {/* Hidden on a phone to keep the locked amount compact; shown from sm up. */}
              {currentDescription && (
                <span className="hidden text-[12px] leading-snug text-[#737373] sm:block">{currentDescription}</span>
              )}
            </div>
          ) : recurringLabel ? (
            <label className="block text-[13px] font-medium text-[#383838]">{recurringLabel}</label>
          ) : <span />}
          <button
            type="button"
            onClick={() => setLocked((prev) => !prev)}
            className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 sm:px-3 py-1.5 text-[12px] font-semibold transition-colors cursor-pointer select-none whitespace-nowrap ${
              locked
                ? "border-[#E5E7EB] bg-white text-[#383838] hover:border-[#EA3335]/50 hover:text-[#EA3335]"
                : "border-[#EA3335]/40 bg-[#FFF5F5] text-[#EA3335] hover:bg-[#FFEBEB]"
            }`}
          >
            {locked ? (
              <span className="inline-flex h-4 w-4 items-center justify-center">{EditIcon}</span>
            ) : null}
            {locked ? "Change amount" : "Save change"}
          </button>
        </div>
        {!locked && (
          /*
            Phone: one amount per row, full width — amount on the left, the admin's description
            on the right. Desktop keeps the original two-up grid of centred tiles.
          */
          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-3">
            {suggestedAmounts.map((base) => {
              const displayAmt = toPresetAmount(base);
              const active     = selectedBase === base && !customAmount;
              const desc       = descriptionFor(base);
              return (
                <button
                  key={base}
                  type="button"
                  onClick={() => handleTileClick(base)}
                  title={desc || undefined}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 border text-left transition-all duration-200 sm:flex-col sm:justify-center sm:px-3 sm:py-4 sm:text-center ${
                    active
                      ? "border-[#EA3335] bg-white cursor-pointer"
                      : "border-[#E5E5E5] bg-white hover:border-[#EA3335]/40 cursor-pointer"
                  }`}
                >
                  <span className={`shrink-0 text-[17px] sm:text-[19px] font-bold leading-none whitespace-nowrap tabular-nums ${active ? "text-[#EA3335]" : "text-[#383838]"}`}>
                    {sym}{formatDisplay(displayAmt)}
                  </span>
                  {desc && (
                    <span className="min-w-0 text-right text-[12px] leading-snug text-[#737373] sm:mt-2 sm:text-center">
                      {desc}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!locked && (
        <>
          <div>
            <label className="block text-[13px] font-medium text-[#383838] mb-2">Custom Amount</label>
            <div className={`flex items-center rounded-xl border transition-colors ${
              customAmountError || customAmount
                ? "border-[#EA3335] bg-white"
                : "border-[#E5E5E5] bg-white focus-within:border-[#EA3335]"
            }`}>
              <span className="pl-4 pr-1 shrink-0 font-medium text-[15px] text-[#737373]">{sym}</span>
              <input
                type="number"
                value={customAmount}
                onChange={handleCustomChange}
                onBlur={handleCustomBlur}
                placeholder={`Enter amount (min ${formatDisplay(convertedMin)})`}
                min={convertedMin}
                max={convertedMax}
                className="flex-1 pr-4 py-2.5 sm:py-3 text-[13px] sm:text-[16px] outline-none bg-transparent text-[#383838]"
              />
            </div>
            {customAmountError && (
              <p className="text-[12px] text-red-600 mt-1.5 px-1">{customAmountError}</p>
            )}
          </div>

          {feeSlot ? <div>{feeSlot}</div> : null}
        </>
      )}
    </div>
  );
};

export default AmountSelector;
