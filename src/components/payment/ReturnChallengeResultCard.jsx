"use client";

import { useRouter } from "next/navigation";
import FailureReasonCard from "./FailureReasonCard";
import CountdownTimer from "@/components/common/CountdownTimer";

export const OUTCOMES = {
  SUCCESS: "OUTCOME_SUCCESS",
  FAILURE: "OUTCOME_FAILURE",
  SESSION_MISMATCH: "OUTCOME_SESSION_MISMATCH",
  EXPIRED: "OUTCOME_EXPIRED",
  GENERIC_ERROR: "OUTCOME_GENERIC_ERROR",
};

const formatCurrency = (amount, currency = "USD") => {
  const symbols = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };
  const sym = symbols[currency] || "$";
  const num = Number(amount) || 0;
  return `${sym}${num.toFixed(2)}`;
};

const PROVIDER_LABELS = { stripe: "card", paypal: "PayPal", bank_transfer: "bank transfer" };

const SuccessCard = ({ receipt, onNavigateHome, onNavigateSchedules, providerSwapped, providerSwappedFrom }) => {
  const router = useRouter();
  const amount = receipt?.amount ?? receipt?.grandTotal ?? 0;
  const currency = receipt?.currency ?? "USD";
  const donationId = receipt?.donationId ?? receipt?.id ?? "";
  const isRecurring = receipt?.paymentType === "recurring" || receipt?.isSplit || receipt?.paymentMode === "split";
  const fromLabel = PROVIDER_LABELS[providerSwappedFrom] || providerSwappedFrom || "your original method";

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 mb-5">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m9 11 3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-emerald-700 font-medium mb-5">
          {isRecurring ? "Your monthly donation is set up successfully" : "Your donation was received successfully"}
        </p>
      </div>

      {providerSwapped && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#FFE082] bg-[#FFF8E1] px-4 py-3 text-left">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#B45309] text-[12px] font-bold text-white">
            !
          </span>
          <p className="text-[13px] text-[#8A5A12]">
            We switched your payment method to complete this donation. Your {fromLabel} was never charged.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 mb-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount</span>
            <span className="font-semibold text-gray-900">{formatCurrency(amount, currency)}</span>
          </div>
          {isRecurring && (
            <div className="flex justify-between">
              <span className="text-gray-600">Frequency</span>
              <span className="font-medium text-gray-900">Monthly</span>
            </div>
          )}
          {donationId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Receipt ID</span>
              <span className="font-mono text-gray-900">{String(donationId).slice(0, 12)}…</span>
            </div>
          )}
          {receipt?.email && (
            <div className="flex justify-between">
              <span className="text-gray-600">Receipt sent to</span>
              <span className="text-gray-900">{receipt.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => (onNavigateSchedules ? onNavigateSchedules() : router.push("/dashboard/schedules"))}
          className="flex-1 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          {isRecurring ? "Manage My Scheduled Donations" : "View My Donations"}
        </button>
        <button
          type="button"
          onClick={() => (onNavigateHome ? onNavigateHome() : router.push("/"))}
          className="flex-1 rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

const FailureCard = ({ failureCode, technicalMessage, onRetry, onEmailRetry, onContactSupport, isGuest }) => {
  return (
    <div className="space-y-5">
      <FailureReasonCard failureCode={failureCode} technicalMessage={technicalMessage} />
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">What would you like to do?</h3>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 inline-flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Retry Payment Now
          </button>
          {isGuest && (
            <button
              type="button"
              onClick={onEmailRetry}
              className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 inline-flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Email Me a Secure Retry Link
            </button>
          )}
          <button
            type="button"
            onClick={onContactSupport}
            className="w-full rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 inline-flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

const SessionMismatchCard = ({ sessionDetails, queryParams, onVerifyAndFinalize, isProcessing }) => {
  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-6 shadow-sm">
      <div className="flex items-start gap-4 mb-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-700">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-amber-900 mb-2">Session Verification Required</h2>
          <p className="text-amber-800 text-sm mb-4">
            We detected a mismatch between your return session and the payment information provided. This may indicate a tamper or CSRF risk. No auto-finalization was performed. Please verify the details below before confirming.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-white p-4 mb-5">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">Return Parameters</h4>
        <div className="space-y-2 text-xs font-mono break-all">
          {queryParams?.authChallengeId && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-40 shrink-0">authChallengeId:</span>
              <span className="text-gray-900">{queryParams.authChallengeId}</span>
            </div>
          )}
          {queryParams?.pendingSessionId && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-40 shrink-0">pendingSessionId:</span>
              <span className="text-gray-900">{queryParams.pendingSessionId}</span>
            </div>
          )}
          {queryParams?.donationId && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-40 shrink-0">donationId:</span>
              <span className="text-gray-900">{queryParams.donationId}</span>
            </div>
          )}
          {queryParams?.provider && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-40 shrink-0">provider:</span>
              <span className="text-gray-900">{queryParams.provider}</span>
            </div>
          )}
          {queryParams?.paymentMode && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-40 shrink-0">paymentMode:</span>
              <span className="text-gray-900">{queryParams.paymentMode}</span>
            </div>
          )}
          {sessionDetails?.tamperRisk && (
            <div className="flex gap-2 pt-2 mt-2 border-t border-amber-100">
              <span className="text-red-600 w-40 shrink-0 font-semibold">⚠ Tamper Risk:</span>
              <span className="text-red-700">Session was reconstructed from URL params only</span>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onVerifyAndFinalize}
        disabled={isProcessing}
        className="w-full rounded-md bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Finalizing…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Verify and Finalize Payment
          </>
        )}
      </button>
    </div>
  );
};

const ExpiredCard = ({ expiresAt, failureCode, onRetry }) => {
  return (
    <div className="space-y-5">
      {expiresAt && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Challenge Window</p>
            <p className="text-sm text-gray-700">Security verification session</p>
          </div>
          <CountdownTimer expiresAt={expiresAt} size="lg" showIcon />
        </div>
      )}
      <div className="rounded-2xl border border-gray-300 bg-gray-100/50 p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-500">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-600 text-sm max-w-md">
            The security verification challenge for this payment has expired. We stopped the pending charge so your card will not be billed. No money was taken.
          </p>
        </div>
        {failureCode && (
          <div className="rounded-lg border border-gray-200 bg-white p-3 mb-5 text-xs">
            <span className="text-gray-500">Server code: </span>
            <span className="font-mono text-gray-700">{failureCode}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 inline-flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Start a New Donation
        </button>
      </div>
    </div>
  );
};

const GenericErrorCard = ({ errorMessage, onRetryFinalize, isRetrying }) => {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4 mb-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
            <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Something Went Wrong</h2>
          <p className="text-sm text-gray-600 mb-2">
            We could not reach our servers to finalize your payment result. This is usually a temporary network issue.
          </p>
          {errorMessage && (
            <p className="text-xs text-gray-500 p-2 bg-gray-50 rounded-md font-mono break-all">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onRetryFinalize}
        disabled={isRetrying}
        className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        {isRetrying ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Retrying Finalization…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Retry Finalize Request
          </>
        )}
      </button>
    </div>
  );
};

const ReturnChallengeResultCard = ({
  outcome,
  receipt = null,
  failureCode = "",
  technicalMessage = "",
  expiresAt = null,
  errorMessage = "",
  sessionDetails = null,
  queryParams = null,
  isGuest = false,
  isProcessing = false,
  isRetrying = false,
  onNavigateHome,
  onNavigateSchedules,
  onRetry,
  onEmailRetry,
  onContactSupport,
  onVerifyAndFinalize,
  onRetryFinalize,
  providerSwapped = false,
  providerSwappedFrom = null,
}) => {
  switch (outcome) {
    case OUTCOMES.SUCCESS:
      return (
        <SuccessCard
          receipt={receipt}
          onNavigateHome={onNavigateHome}
          onNavigateSchedules={onNavigateSchedules}
          providerSwapped={providerSwapped}
          providerSwappedFrom={providerSwappedFrom}
        />
      );
    case OUTCOMES.FAILURE:
      return (
        <FailureCard
          failureCode={failureCode}
          technicalMessage={technicalMessage}
          onRetry={onRetry}
          onEmailRetry={onEmailRetry}
          onContactSupport={onContactSupport}
          isGuest={isGuest}
        />
      );
    case OUTCOMES.SESSION_MISMATCH:
      return (
        <SessionMismatchCard
          sessionDetails={sessionDetails}
          queryParams={queryParams}
          onVerifyAndFinalize={onVerifyAndFinalize}
          isProcessing={isProcessing}
        />
      );
    case OUTCOMES.EXPIRED:
      return <ExpiredCard expiresAt={expiresAt} failureCode={failureCode} onRetry={onRetry} />;
    case OUTCOMES.GENERIC_ERROR:
    default:
      return (
        <GenericErrorCard
          errorMessage={errorMessage}
          onRetryFinalize={onRetryFinalize}
          isRetrying={isRetrying}
        />
      );
  }
};

export default ReturnChallengeResultCard;
