"use client";

import { useState } from "react";
import DateAmountRow from "./DateAmountRow";

// How many rows are shown before the list needs a tap. A yearly daily plan is 364 dates;
// rendering all of them at once turned the page into a 24,000px scroll.
const COLLAPSE_AFTER = 6;
// Every tap adds this many rows, so the page grows in steps the donor controls.
const PAGE_SIZE = 12;

const PerDateAmountTable = ({ activeDates, dateAmounts, effectiveAmount, sym, onChange, minDateStr, causeSplit, causeLabelById, resolvedAmounts = null, readOnly = false }) => {
  const cutoff = minDateStr ?? new Date().toISOString().split("T")[0];

  const futureDates = activeDates.filter((d) => d >= cutoff);
  const pastDates   = activeDates.filter((d) => d < cutoff);

  const [shown, setShown] = useState(COLLAPSE_AFTER);

  /*
    A locked plan charges every date the same, so listing all of them adds nothing: the header
    already says how many dates there are and the footer already gives the total. Show a short
    sample and reveal more in pages, so a 364-date plan never becomes a 364-row page.

    An editable plan is different — each row can be changed, so every row is drawn.
  */
  const collapsible = readOnly && activeDates.length > COLLAPSE_AFTER;
  const visibleDates = collapsible ? activeDates.slice(0, shown) : activeDates;
  const hasMore = collapsible && shown < activeDates.length;
  const nextStep = Math.min(PAGE_SIZE, activeDates.length - shown);

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
          <div className="mt-1 mb-1 flex flex-col gap-1.5">
            {hasMore && (
              <button
                type="button"
                onClick={() => setShown((v) => Math.min(activeDates.length, v + PAGE_SIZE))}
                className="w-full cursor-pointer rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-[12px] font-semibold text-[#737373] transition-colors hover:border-[#EA3335]/40 hover:text-[#EA3335]"
              >
                Show {nextStep} more ({activeDates.length - shown} left)
              </button>
            )}
            {shown > COLLAPSE_AFTER && (
              <button
                type="button"
                onClick={() => setShown(COLLAPSE_AFTER)}
                className="w-full cursor-pointer rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#AEAEAE] transition-colors hover:text-[#737373]"
              >
                Show fewer dates
              </button>
            )}
          </div>
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
