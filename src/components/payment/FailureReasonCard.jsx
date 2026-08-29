"use client";

import { classifyBankFailure, getUserFacingErrorMessage } from "@/utils/errorMaps";

const classificationLabels = {
  retriable_temporary: { label: "Temporary Issue", className: "bg-amber-50 text-amber-700 border-amber-200" },
  non_retriable: { label: "Cannot Retry This Card", className: "bg-red-50 text-red-700 border-red-200" },
  unknown: { label: "Unknown Reason", className: "bg-gray-50 text-gray-700 border-gray-200" },
};

const FailureReasonCard = ({ failureCode, technicalMessage, className = "" }) => {
  const userMessage = getUserFacingErrorMessage(failureCode, "Your payment could not be completed.");
  const classification = classifyBankFailure(failureCode);
  const cls = classificationLabels[classification] || classificationLabels.unknown;

  return (
    <div className={`rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm ${className}`.trim()}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600">
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Payment Declined</h3>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls.className}`}>
              {cls.label}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-3">{userMessage}</p>
          {technicalMessage && (
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700">Technical details</summary>
              <p className="mt-2 p-2 bg-gray-50 rounded-md font-mono break-all">{technicalMessage}</p>
            </details>
          )}
          {failureCode && (
            <p className="mt-2 text-xs text-gray-400">
              Code: <span className="font-mono">{failureCode}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FailureReasonCard;
