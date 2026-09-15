// Frontend mirror of the rules enforced by POST /api/v1/donations/submit
// (human-concern-api/src/modules/donors/validator/publicDonationValidators.js and the
// checkout pipeline's prepDonorAndFormContextStep). Each validator returns the first
// user-facing failure for its step, or null when the step is valid.
import { earliestAllowedDateStr, isDueDateAllowed } from "./scheduleDateLimits";
import { generateDatesInRange } from "@/app/donate/steps/StepComponents/countOccurrences";

// publicDonationValidators.js: MAX_INSTALLMENTS
export const MAX_INSTALLMENTS = 365;

const toDayKey = (v) => String(v ?? "").slice(0, 10);

// Step 2 — amount, currency and the recurring schedule.
// Min/max donation is enforced by AmountSelector, which already applies the backend's
// total-based semantics with currency conversion.
export function validateAmountScheduleStep({
  amount,
  isRecurring,
  allowRecurring,
  currency,
  allowedCurrencies,
  scheduleType,
  scheduleConfig,
  campaignEndDate,
}) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    return "Please enter a donation amount greater than 0.";
  }

  const code = String(currency ?? "").trim().toUpperCase();
  if (code.length !== 3) return "Please select a valid currency.";
  if (Array.isArray(allowedCurrencies) && allowedCurrencies.length > 0 && !allowedCurrencies.includes(code)) {
    return "The selected currency is not allowed for this campaign.";
  }

  if (!isRecurring) return null;

  if (allowRecurring === false) {
    return "Recurring donations are not allowed for this campaign.";
  }

  const cfg  = scheduleConfig ?? {};
  const type = scheduleType ?? "specific_dates";

  let dueDates;
  if (type === "specific_dates") {
    dueDates = (cfg.dates ?? []).map(toDayKey).filter(Boolean).sort();
    if (!dueDates.length) return "Please select at least one date for your schedule.";
  } else {
    if (!cfg.startDate) return "Please set a start date for your schedule.";
    if (!cfg.endDate)   return "Please set an end date for your schedule.";
    dueDates = generateDatesInRange(
      toDayKey(cfg.startDate),
      toDayKey(cfg.endDate),
      cfg.frequency ?? "daily",
      cfg.customInterval ?? 1,
      Array.isArray(cfg.daysOfWeek) ? cfg.daysOfWeek : [],
    );
    if (!dueDates.length) return "Please choose a valid date range for your schedule.";
  }

  if (dueDates.length > MAX_INSTALLMENTS) {
    return `A schedule can have at most ${MAX_INSTALLMENTS} payments. Please shorten the date range.`;
  }

  if (dueDates.some((d) => !isDueDateAllowed(d))) {
    return `All scheduled dates must be in the future. Please choose dates from ${earliestAllowedDateStr()} onwards.`;
  }

  if (campaignEndDate) {
    const endKey = toDayKey(campaignEndDate);
    const last   = dueDates[dueDates.length - 1];
    if (last && endKey && last > endKey) {
      return `All payments must be scheduled on or before the campaign end date (${endKey}).`;
    }
  }

  return null;
}

// Step 3 — payment method must be one of the providers the API accepts.
export function validateOverviewStep({ paymentMethod }) {
  if (!["stripe", "paypal"].includes(paymentMethod)) {
    return "Please select a payment method.";
  }
  return null;
}
