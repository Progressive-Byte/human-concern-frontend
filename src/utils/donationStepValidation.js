// Frontend mirror of the rules enforced by POST /api/v1/donations/submit
// (human-concern-api/src/modules/donors/validator/publicDonationValidators.js and the
// checkout pipeline's prepDonorAndFormContextStep). Each validator returns the first
// user-facing failure for its step, or null when the step is valid.
import { earliestAllowedDateStr, isDueDateAllowed } from "./scheduleDateLimits";
import { generateDatesInRange } from "@/app/donate/steps/StepComponents/countOccurrences";
import { resolveCountryIso } from "./isoHelpers";

// publicDonationValidators.js: MAX_INSTALLMENTS
export const MAX_INSTALLMENTS = 365;

const toDayKey = (v) => String(v ?? "").slice(0, 10);

// Step 1 — amount, currency and the recurring schedule.
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
  makeUpMissedDates,
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

  return validateSchedule({ scheduleType, scheduleConfig, campaignEndDate, makeUpMissedDates });
}

// The recurring-schedule rules on their own, so the completion bar
// (donationFormProgress.js) can ask the same question as the Next button instead of
// keeping a second copy of these rules. Returns the first user-facing failure, or null
// when the schedule is valid.
export function validateSchedule({ scheduleType, scheduleConfig, campaignEndDate, makeUpMissedDates }) {
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

  // Make-up schedules intentionally include preset dates that already passed; the API verifies
  // they belong to the chosen preset.
  if (!makeUpMissedDates && dueDates.some((d) => !isDueDateAllowed(d))) {
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

// Step 1 — gift amount plus the cause split.
export function validateGiftStep({
  amount,
  isRecurring,
  allowRecurring,
  currency,
  allowedCurrencies,
  scheduleType,
  scheduleConfig,
  campaignEndDate,
  makeUpMissedDates,
  causeIds = [],
  causesCount = 0,
  causeSplit = {},
  totalAmount = 0,
  sym = "$",
}) {
  const base = validateAmountScheduleStep({
    amount,
    isRecurring,
    allowRecurring,
    currency,
    allowedCurrencies,
    scheduleType,
    scheduleConfig,
    campaignEndDate,
    makeUpMissedDates,
  });
  if (base) return base;

  if (causesCount > 0 && causeIds.length === 0) {
    return "Please select at least one cause.";
  }

  if (causeIds.length > 0 && totalAmount > 0) {
    const amountFor = (id) => totalAmount * Math.max(0, Number(causeSplit[id]) || 0);
    const allocated = causeIds.reduce((sum, id) => sum + amountFor(id), 0);
    const fmt = (v) => `${sym}${v.toFixed(2)}`;

    const empty = causeIds.filter((id) => amountFor(id) < 0.005);
    if (empty.length) {
      return "Every selected cause needs an amount. Give it one, or untick it.";
    }
    if (allocated - totalAmount > 0.005) {
      return `Your cause amounts add up to ${fmt(allocated)}, which is more than your ${fmt(totalAmount)} donation.`;
    }
    if (totalAmount - allocated > 0.005) {
      return `Your cause amounts add up to ${fmt(allocated)}, which is less than your ${fmt(totalAmount)} donation.`;
    }
  }

  return null;
}

// Step 2 — donor details.
export function validateDetailsStep({
  email,
  firstName,
  lastName,
  addressLine1,
  city,
  province,
  zip,
  donorCountryCode,
  country,
}) {
  if (
    !String(firstName ?? "").trim() ||
    !String(lastName ?? "").trim() ||
    !String(email ?? "").trim() ||
    !String(addressLine1 ?? "").trim() ||
    !String(city ?? "").trim() ||
    !String(province ?? "").trim() ||
    !String(zip ?? "").trim()
  ) {
    return "Please fill in all required fields.";
  }

  const code = String(donorCountryCode ?? "").trim() || resolveCountryIso(String(country ?? ""));
  if (!code) return "Please select your country.";

  if (!/^\S+@\S+\.\S+$/.test(String(email))) return "Enter a valid email address.";

  return null;
}

// Step 3 — payment method must be one of the providers the API accepts.
export function validateOverviewStep({ paymentMethod }) {
  if (!["stripe", "paypal"].includes(paymentMethod)) {
    return "Please select a payment method.";
  }
  return null;
}
