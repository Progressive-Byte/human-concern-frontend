"use client";

import { useState } from "react";
import DateAmountRow from "./DateAmountRow";

// How many rows are drawn before the list collapses. A yearly daily plan is 364 dates; rendering
// all of them buries the page and shows 364 identical "$0.02 — set by the plan" lines.
const COLLAPSE_AFTER = 6;

const PerDateAmountTable = ({ activeDates, dateAmounts, effectiveAmount, sym, onChange, minDateStr, causeSplit, causeLabelById, resolvedAmounts = null, readOnly = false }) => {
  const cutoff = minDateStr ?? new Date().toISOString().split("T")[0];

  const futureDates = activeDates.filter((d) => d >= cutoff);
  const pastDates   = activeDates.filter((d) => d < cutoff);

  const [expanded, setExpanded] = useState(false);

  /*
    A locked plan charges every date the same, so listing them one by one adds nothing: the header
    already says how many dates there are and the footer already gives the total. Show a short
    sample and let the donor expand when they want the detail.

    An editable plan is different — each row can be changed, so the donor may genuinely need them.
  */
  const collapsible = readOnly && activeDates.length > COLLAPSE_AFTER;
  const visibleDates = collapsible && !expanded ? activeDates.slice(0, COLLAPSE_AFTER) : activeDates;

  // Prefer the amount the schedule will actually be charged (which carries the last-installment
  // remainder) so what the donor reads matches what is submitted.
  const amountFor = (d) => {
    const resolved = resolvedAmounts ? resolvedAmounts[d] : undefined;
    if (resolved !== undefined && resolved !== null) return Number(resolved);
    const ov = dateAmounts[d] ?? "";
    const amt = ov !== "" ? Number(ov) : effectiveAmount;
    return isNaN(amt) ? effectiveAmount : amt;
  };

  const total = activeDates.reduce((sum, d) => sum + amountFor(d), 0);

  return (
    <div className="flex flex-col gap-2 border border-[#EBEBEB] rounded-xl overflow-hidden bg-[#FAFAFA]">

      <div className="flex items-center justify-between px-3 pt-3">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-[#383838]">Amount Per Date</p>
          <span className="text-[11px] text-[#737373] bg-[#F0F0F0] rounded-full px-2 py-0.5 tabular-nums">
            {futureDates.length} date{futureDates.length !== 1 ? "s" : ""}
          </span>
          {pastDates.length > 0 && (
            <span className="text-[11px] text-[#AEAEAE] bg-[#F5F5F5] rounded-full px-2 py-0.5 tabular-nums">
              {pastDates.length} past
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#737373]">Default: {sym}{effectiveAmount}</p>
      </div>

      <div
        className="flex flex-col gap-1.5 max-h-none sm:max-h-[230px] overflow-visible sm:overflow-y-scroll px-3 pb-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#D1D5DB #F3F4F6" }}
      >
        {visibleDates.map((d) => (
          <DateAmountRow
            key={d}
            d={d}
            override={dateAmounts[d] ?? ""}
            effectiveAmount={effectiveAmount}
            resolved={resolvedAmounts ? resolvedAmounts[d] : undefined}
            sym={sym}
            onChange={onChange}
            readOnly={readOnly}
            disabled={d < cutoff}
            causeSplit={causeSplit}
            causeLabelById={causeLabelById}
          />
        ))}

        {collapsible && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 mb-1 w-full cursor-pointer rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-[12px] font-semibold text-[#737373] transition-colors hover:border-[#EA3335]/40 hover:text-[#EA3335]"
          >
            {expanded
              ? "Show fewer dates"
              : `Show all ${activeDates.length} dates`}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-3 py-2.5 border-t border-[#E5E5E5] bg-white">
        <span className="text-[12px] font-semibold text-[#383838]">
          Total ({futureDates.length} payment{futureDates.length !== 1 ? "s" : ""})
        </span>
        <span className="text-[14px] font-bold text-[#EA3335] tabular-nums">
          {sym}{total.toLocaleString()}
        </span>
      </div>

    </div>
  );
};

export default PerDateAmountTable;
