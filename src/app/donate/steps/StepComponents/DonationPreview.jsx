"use client";

import { useMemo } from "react";
import Section from "@/components/ui/Section";
import { useDonation } from "@/context/DonationContext";
import { generateDatesInRange } from "./countOccurrences";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const DonationPreview = ({ currentStep }) => {
  const { data } = useDonation();
  const sym = CURRENCY_SYMBOLS[data.currency] ?? "$";

  const enableTipping = useMemo(() => {
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      return meta.goalsDates?.enableTipping ?? true;
    } catch { return true; }
  }, []);

  const showPayment = Boolean(data.amountTier);

  // baseTotal is the full schedule total (used for per-date subtotal rows)
  const baseTotal = (data.scheduleType === "specific_dates" && data.perDateTotal != null)
    ? data.perDateTotal
    : (data.amountTier ?? 0) * (data.installmentCount ?? 1);

  const isRecurring      = data.paymentType === "recurring";

  // grandTotalBase: for recurring show per-payment amount, for one-time show full amount
  const grandTotalBase = isRecurring ? (data.amountTier ?? 0) : baseTotal;

  const customTipParsed = data.customTipAmount !== "" && data.customTipAmount != null
    ? Math.max(0, Number(data.customTipAmount) || 0)
    : null;
  const tipAmount = enableTipping
    ? (customTipParsed !== null ? customTipParsed : data.tipPct ? (grandTotalBase * data.tipPct) / 100 : 0)
    : 0;
  const hasTip     = tipAmount > 0;
  const showAddons = data.addOnBreakdown?.length > 0 || hasTip || data.grandTotal > 0;
  const isSpecificDates  = isRecurring && data.scheduleType === "specific_dates";
  const isDateRange      = isRecurring && data.scheduleType === "date_range";

  // Build per-date rows for specific_dates
  const dateRows = useMemo(() => {
    if (!isSpecificDates) return [];
    const dates     = data.scheduleConfig?.dates ?? [];
    const overrides = data.scheduleConfig?.dateAmounts ?? {};
    return [...dates]
      .sort()
      .map((isoDate) => {
        const d        = isoDate.split("T")[0];
        const isCustom = overrides[d] !== undefined;
        const amt      = isCustom ? Number(overrides[d]) : (data.amountTier ?? 0);
        return { d, amt, isCustom };
      });
  }, [isSpecificDates, data.scheduleConfig, data.amountTier]);

  // Build per-date rows for date_range — only when custom amounts exist
  const dateRangeRows = useMemo(() => {
    if (!isDateRange) return [];
    const overrides = data.scheduleConfig?.dateAmounts ?? {};
    if (Object.keys(overrides).length === 0) return [];
    const start = data.scheduleConfig?.startDate?.split("T")[0];
    const end   = data.scheduleConfig?.endDate?.split("T")[0];
    const freq  = data.scheduleConfig?.frequency ?? "daily";
    if (!start || !end) return [];
    return generateDatesInRange(start, end, freq).map((d) => {
      const isCustom = overrides[d] !== undefined;
      const amt      = isCustom ? Number(overrides[d]) : (data.amountTier ?? 0);
      return { d, amt, isCustom };
    });
  }, [isDateRange, data.scheduleConfig, data.amountTier]);

  const MAX_VISIBLE = 5;
  const visibleRows      = dateRows.slice(0, MAX_VISIBLE);
  const hiddenCount      = dateRows.length - MAX_VISIBLE;
  const visibleRangeRows = dateRangeRows.slice(0, MAX_VISIBLE);
  const hiddenRangeCount = dateRangeRows.length - MAX_VISIBLE;

  return (
    <div className="lg:sticky lg:top-[172px] self-start w-full lg:w-[272px] shrink-0">
      <div className="bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-5">
        <p className="text-[13px] font-semibold text-[#383838] mb-3">Donation Summary</p>

        <div className="flex flex-col">

          {(data.firstName || data.email) && (
            <Section label="Donor">
              <p className="text-[14px] font-semibold text-[#383838] leading-snug">
                {[data.firstName, data.lastName].filter(Boolean).join(" ")}
              </p>
              {data.email && (
                <p className="text-[12px] text-[#8C8C8C] break-all">{data.email}</p>
              )}
              {data.city && (
                <p className="text-[12px] text-[#8C8C8C]">
                  {[data.city, data.country].filter(Boolean).join(", ")}
                </p>
              )}
            </Section>
          )}

          {data.causes?.length > 0 && (
            <Section label="Causes">
              <div className="flex flex-wrap gap-1.5">
                {data.causes.map((cause) => (
                  <span
                    key={cause}
                    className="text-[11px] font-medium text-[#383838] bg-[#F3F4F6] rounded-full px-2.5 py-1 leading-none"
                  >
                    {cause}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {data.objectiveLabel && (
            <Section label="Objective">
              <p className="text-[12px] text-[#383838]">{data.objectiveLabel}</p>
            </Section>
          )}

          {showPayment && (
            <Section label="Payment">

              {/* Payment type badge + count */}
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  isRecurring
                    ? "bg-[#FFF5F5] text-[#EA3335]"
                    : "bg-[#F3F4F6] text-[#737373]"
                }`}>
                  {isRecurring ? "Split Payments" : "One-time"}
                </span>
                {isRecurring && data.installmentCount > 1 && (
                  <span className="text-[11px] text-[#8C8C8C]">
                    × {data.installmentCount} payment{data.installmentCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* One-time: just the big amount */}
              {!isRecurring && (
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[22px] font-bold text-[#383838] leading-none">
                    {sym}{data.amountTier?.toLocaleString()}
                  </span>
                  <span className="text-[12px] text-[#8C8C8C]">{data.currency}</span>
                </div>
              )}

              {/* Recurring: per-payment default */}
              {isRecurring && (
                <div className="flex items-center justify-between text-[12px] mt-1">
                  <span className="text-[#8C8C8C]">Per payment</span>
                  <span className="font-semibold text-[#383838] tabular-nums">
                    {sym}{data.amountTier?.toLocaleString()} {data.currency}
                  </span>
                </div>
              )}

              {/* Specific dates: per-date amount list */}
              {isSpecificDates && dateRows.length > 0 && (
                <div className="mt-2 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#AEAEAE] uppercase tracking-wide mb-1 px-0.5">
                    <span>Date</span>
                    <span>Amount</span>
                  </div>
                  {visibleRows.map(({ d, amt, isCustom }) => (
                    <div
                      key={d}
                      className={`flex items-center justify-between px-2 py-1 rounded-lg ${
                        isCustom ? "bg-[#FFF5F5]" : "bg-[#F9F9F9]"
                      }`}
                    >
                      <span className="text-[11px] text-[#737373] tabular-nums">{d}</span>
                      <div className="flex items-center gap-1">
                        {isCustom && (
                          <span className="text-[9px] font-semibold text-[#EA3335] bg-[#FFEEEE] rounded px-1 leading-4">
                            custom
                          </span>
                        )}
                        <span className={`text-[11px] font-semibold tabular-nums ${
                          isCustom ? "text-[#EA3335]" : "text-[#383838]"
                        }`}>
                          {sym}{amt.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {hiddenCount > 0 && (
                    <p className="text-[11px] text-[#AEAEAE] text-center py-0.5">
                      +{hiddenCount} more date{hiddenCount !== 1 ? "s" : ""}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-[#EBEBEB]">
                    <span className="text-[11px] font-semibold text-[#383838]">Subtotal</span>
                    <span className="text-[13px] font-bold text-[#383838] tabular-nums">
                      {sym}{baseTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Date range: schedule info + optional per-date breakdown */}
              {isDateRange && data.scheduleConfig?.startDate && (
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8C8C8C]">From</span>
                    <span className="text-[#383838] font-medium tabular-nums">
                      {data.scheduleConfig.startDate.split("T")[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8C8C8C]">To</span>
                    <span className="text-[#383838] font-medium tabular-nums">
                      {data.scheduleConfig.endDate?.split("T")[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8C8C8C]">Frequency</span>
                    <span className="text-[#383838] font-medium capitalize">
                      {data.scheduleConfig.frequency}
                    </span>
                  </div>

                  {/* Per-date breakdown when custom amounts exist */}
                  {dateRangeRows.length > 0 && (
                    <>
                      <div className="flex items-center justify-between text-[10px] font-semibold text-[#AEAEAE] uppercase tracking-wide mt-2 mb-0.5 px-0.5">
                        <span>Date</span>
                        <span>Amount</span>
                      </div>
                      {visibleRangeRows.map(({ d, amt, isCustom }) => (
                        <div
                          key={d}
                          className={`flex items-center justify-between px-2 py-1 rounded-lg ${
                            isCustom ? "bg-[#FFF5F5]" : "bg-[#F9F9F9]"
                          }`}
                        >
                          <span className="text-[11px] text-[#737373] tabular-nums">{d}</span>
                          <div className="flex items-center gap-1">
                            {isCustom && (
                              <span className="text-[9px] font-semibold text-[#EA3335] bg-[#FFEEEE] rounded px-1 leading-4">
                                custom
                              </span>
                            )}
                            <span className={`text-[11px] font-semibold tabular-nums ${
                              isCustom ? "text-[#EA3335]" : "text-[#383838]"
                            }`}>
                              {sym}{amt.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {hiddenRangeCount > 0 && (
                        <p className="text-[11px] text-[#AEAEAE] text-center py-0.5">
                          +{hiddenRangeCount} more date{hiddenRangeCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-[#EBEBEB]">
                    <span className="text-[11px] font-semibold text-[#383838]">Subtotal</span>
                    <span className="text-[13px] font-bold text-[#383838] tabular-nums">
                      {sym}{baseTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

            </Section>
          )}

          {showAddons && data.addOnBreakdown?.length > 0 && (
            <Section label="Add-ons">
              {data.addOnBreakdown.map((addon) => (
                <div key={addon.id ?? addon.name} className="flex items-center justify-between gap-2">
                  <p className="text-[12px] text-[#383838] truncate">{addon.name}</p>
                  <p className="text-[12px] font-medium text-[#383838] shrink-0">
                    {sym}{Number(addon.total ?? 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </Section>
          )}

          {showAddons && hasTip && (
            <Section label="Tip">
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-[#8C8C8C]">
                  {customTipParsed !== null ? "Custom amount" : `${data.tipPct}% of donation`}
                </p>
                <p className="text-[12px] font-medium text-[#383838]">
                  {sym}{tipAmount.toFixed(2)}
                </p>
              </div>
            </Section>
          )}

          {showAddons && (
            <div className="flex items-center justify-between pt-3.5">
              <p className="text-[13px] font-semibold text-[#383838]">Total</p>
              <p className="text-[20px] font-bold text-[#EA3335] leading-none">
                {sym}{(baseTotal + (data.addOnsTotal ?? 0) + tipAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default DonationPreview;