export const ORCHESTRATION_ERROR_CODES = {
  REQUEST_IN_PROGRESS: "REQUEST_IN_PROGRESS",
  CHALLENGE_MISMATCH_SESSION: "CHALLENGE_MISMATCH_SESSION",
  AUTH_CHALLENGE_EXPIRED: "AUTH_CHALLENGE_EXPIRED",
  CHALLENGE_FAILED: "CHALLENGE_FAILED",
  CIRCUIT_FORCE_CLOSED: "CIRCUIT_FORCE_CLOSED",
  CIRCUIT_FORCE_CLOSED_CODE: "circuit_force_closed",
  ALL_GATEWAYS_DOWN: "gateway_fully_down_all_circuits_open",
  GATEWAY_NOT_SUPPORTED_FOR_MODE: "PAYMENT_METHOD_NOT_SUPPORTED_FOR_SPLIT",
  IDEMPOTENCY_LOCK_CONFLICT: "IDEMPOTENCY_LOCK_CONFLICT",
};

const userFacingMap = {
  [ORCHESTRATION_ERROR_CODES.REQUEST_IN_PROGRESS]:
    "Your donation is still being processed. Please do not close this window.",
  [ORCHESTRATION_ERROR_CODES.CHALLENGE_MISMATCH_SESSION]:
    "Your payment session expired or could not be verified. No charge was made — please restart your donation.",
  [ORCHESTRATION_ERROR_CODES.AUTH_CHALLENGE_EXPIRED]:
    "The security verification session timed out. We stopped the pending charge so your card will not be billed. Please try again.",
  [ORCHESTRATION_ERROR_CODES.CHALLENGE_FAILED]:
    "Your bank declined the security verification. Please try again or use a different payment method.",
  [ORCHESTRATION_ERROR_CODES.CIRCUIT_FORCE_CLOSED]:
    "This payment provider is temporarily paused for maintenance. Please try another method.",
  [ORCHESTRATION_ERROR_CODES.CIRCUIT_FORCE_CLOSED_CODE]:
    "This payment provider is temporarily unavailable — we've automatically selected another method for you.",
  [ORCHESTRATION_ERROR_CODES.ALL_GATEWAYS_DOWN]:
    "All payment methods are temporarily unavailable. Please try again in a few minutes.",
  [ORCHESTRATION_ERROR_CODES.GATEWAY_NOT_SUPPORTED_FOR_MODE]:
    "This payment method does not support scheduled donations yet. Please use Stripe for monthly giving.",
  [ORCHESTRATION_ERROR_CODES.IDEMPOTENCY_LOCK_CONFLICT]:
    "We detected a duplicate submit and kept the first result — no double charge occurred.",
};

const bankFailureReasonMap = {
  card_declined: "Your card was declined. Please try a different card.",
  insufficient_funds: "Insufficient available balance on your card.",
  card_expired: "Your card has expired. Please update your payment method.",
  authentication_required: "Additional card security verification is required.",
  processing_error: "A temporary bank processing error occurred — we will retry automatically.",
  lost_or_stolen: "This card was reported lost or stolen.",
  invalid_cvc: "The card security code (CVC) is incorrect.",
  invalid_expiry_month: "The card expiration month is invalid.",
  invalid_expiry_year: "The card expiration year is invalid.",
  invalid_number: "The card number is incorrect.",
  amount_too_large: "This amount exceeds your card's limit.",
  amount_too_small: "The amount is below the minimum allowed for this payment method.",
  country_unsupported: "Your card's issuing country is not supported.",
  generic_decline: "Your bank declined this charge. Please try a different card or contact your bank.",
};

export function getUserFacingErrorMessage(code, fallback = "An unexpected error occurred.") {
  const key = String(code || "").trim();
  if (!key) return fallback;
  if (userFacingMap[key]) return userFacingMap[key];
  const lower = key.toLowerCase();
  const exact = Object.keys(userFacingMap).find((k) => k.toLowerCase() === lower);
  if (exact) return userFacingMap[exact];
  if (bankFailureReasonMap[key]) return bankFailureReasonMap[key];
  const bankExact = Object.keys(bankFailureReasonMap).find((k) => k.toLowerCase() === lower);
  if (bankExact) return bankFailureReasonMap[bankExact];
  return fallback;
}

export function classifyBankFailure(code) {
  const key = String(code || "").toLowerCase();
  const neverRetry = ["card_expired", "lost_or_stolen", "country_unsupported", "generic_decline"];
  const nonRetriable = neverRetry.some((s) => key.includes(s));
  if (nonRetriable) return "non_retriable";
  const retryable = ["insufficient_funds", "processing_error", "authentication_required"];
  if (retryable.some((s) => key.includes(s))) return "retriable_temporary";
  return "unknown";
}

export function isSessionExpiryError(code) {
  const key = String(code || "").toUpperCase();
  return (
    key.includes("CHALLENGE_MISMATCH") ||
    key.includes("AUTH_CHALLENGE_EXPIRED") ||
    key.includes("SESSION_EXPIRED") ||
    key.includes("GONE")
  );
}

export function isGatewayDownError(code) {
  const key = String(code || "").toLowerCase();
  return key.includes("circuit_force_closed") || key.includes("gateway_fully_down") || key.includes("503");
}

export const RESOLUTION_METHODS = {
  MARK_AS_VERIFIED: "mark_as_verified",
  INITIATE_REFUND: "initiate_refund",
  RETRY_WEBHOOK: "retry_webhook",
};

export const DISCREPANCY_CATEGORIES = {
  MATCHED: "MATCHED",
  AMOUNT_MISMATCH: "AMOUNT_MISMATCH",
  MISSING_IN_LOCAL: "MISSING_IN_LOCAL",
  MISSING_IN_PROVIDER: "MISSING_IN_PROVIDER",
  STATUS_MISMATCH: "STATUS_MISMATCH",
  THREE_DS_AUDIT_MISMATCH: "3DS_AUDIT_MISMATCH",
  OTHER: "OTHER",
  RESOLVED: "RESOLVED",
};

export const categoryDisplay = {
  [DISCREPANCY_CATEGORIES.MATCHED]: { label: "Matched", className: "bg-emerald-50 text-emerald-700" },
  [DISCREPANCY_CATEGORIES.AMOUNT_MISMATCH]: { label: "Amount Mismatch", className: "bg-amber-50 text-amber-800" },
  [DISCREPANCY_CATEGORIES.MISSING_IN_LOCAL]: { label: "Missing in Local", className: "bg-red-50 text-red-700" },
  [DISCREPANCY_CATEGORIES.MISSING_IN_PROVIDER]: { label: "Missing in Provider", className: "bg-red-50 text-red-700" },
  [DISCREPANCY_CATEGORIES.STATUS_MISMATCH]: { label: "Status Mismatch", className: "bg-amber-50 text-amber-800" },
  [DISCREPANCY_CATEGORIES.THREE_DS_AUDIT_MISMATCH]: {
    label: "3DS Audit Fail",
    className: "bg-red-600/10 text-red-700 font-semibold",
  },
  [DISCREPANCY_CATEGORIES.OTHER]: { label: "Other", className: "bg-gray-100 text-gray-700" },
  [DISCREPANCY_CATEGORIES.RESOLVED]: { label: "Resolved", className: "bg-sky-50 text-sky-700" },
};

export const RECON_STATUS = {
  queued: { label: "Queued", className: "bg-gray-100 text-gray-600" },
  running: { label: "Running", className: "bg-indigo-50 text-indigo-700" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  completed_with_warnings: { label: "Warnings", className: "bg-amber-50 text-amber-800" },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-700" },
};

export const CIRCUIT_STATUS = {
  TRACKING: { label: "Healthy", className: "bg-emerald-50 text-emerald-700" },
  HALF_OPEN: { label: "Testing Recovery", className: "bg-amber-50 text-amber-800 animate-pulse" },
  FORCE_OPEN: { label: "Open (Override)", className: "bg-sky-50 text-sky-700" },
  FORCE_CLOSED: { label: "Blocked", className: "bg-red-500/10 text-red-700" },
};

export const CHALLENGE_STATUS = {
  issued: { label: "Issued", className: "bg-amber-50 text-amber-800" },
  donor_in_progress: { label: "In Progress", className: "bg-indigo-50 text-indigo-700" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-700" },
  expired: { label: "Expired", className: "bg-gray-100 text-gray-700" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-700" },
  recovery_issued: { label: "Recovery Issued", className: "bg-orange-50 text-orange-800" },
  donor_completed_return: { label: "Returned", className: "bg-sky-50 text-sky-700" },
  requires_action: { label: "Action Required", className: "bg-orange-50 text-orange-700" },
  auth_completed: { label: "Verified", className: "bg-emerald-50 text-emerald-700" },
  pending_retry_scheduled: { label: "Retrying Soon", className: "bg-amber-50 text-amber-800" },
  retriable_but_waiting_donor_action: { label: "Needs Card Update", className: "bg-red-500/10 text-red-700" },
  permanently_failed_max_retries: { label: "Failed After 3 Attempts", className: "bg-red-700/10 text-red-800" },
  pending_bank_transfer_manual_match: { label: "Waiting Bank Transfer", className: "bg-gray-100 text-gray-700" },
};
