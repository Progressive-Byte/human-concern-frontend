"use client";

import { useState } from "react";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DiscrepancyRowActions = ({ reportId, discrepancyId, discrepancy, disabled = false, onOpenResolve }) => {
  const toast = useToast();

  function handleResolve(e) {
    e?.stopPropagation?.();
    if (disabled) {
      toast.info("This discrepancy is already resolved.");
      return;
    }
    onOpenResolve?.(discrepancyId, discrepancy);
  }

  return (
    <div className="inline-flex items-center justify-end">
      <button
        type="button"
        onClick={handleResolve}
        disabled={disabled}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-colors duration-200 ${
          disabled
            ? "border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed"
            : "border-dashed border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
        }`}
        title={disabled ? "Already resolved" : "Resolve discrepancy"}
      >
        <CheckIcon />
        Resolve
      </button>
    </div>
  );
};

export default DiscrepancyRowActions;
