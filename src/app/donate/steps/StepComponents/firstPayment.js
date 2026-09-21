import { generateDatesInRange } from "./countOccurrences";
import { earliestAllowedDateStr } from "@/utils/scheduleDateLimits";

// Every scheduled date key (YYYY-MM-DD) of a recurring schedule, sorted ascending.
export function resolveScheduleDateKeys({ scheduleType, scheduleConfig }) {
  const cfg = scheduleConfig && typeof scheduleConfig === "object" ? scheduleConfig : {};

  if (scheduleType === "specific_dates") {
    return Array.isArray(cfg.dates)
      ? cfg.dates.map((d) => String(d).split("T")[0]).sort()
      : [];
  }

  if (scheduleType === "date_range") {
    const start = cfg.startDate ? String(cfg.startDate).split("T")[0] : "";
    const end = cfg.endDate ? String(cfg.endDate).split("T")[0] : "";
    if (!start || !end) return [];
    return generateDatesInRange(start, end, cfg.frequency ?? "daily", cfg.customInterval ?? 1, cfg.daysOfWeek ?? []);
  }

  return [];
}

// The amount charged for a single scheduled date.
function amountForDate(key, { overrides, resolvedAmounts, amountTier }) {
  const resolved = resolvedAmounts ? resolvedAmounts[key] : undefined;
  if (resolved !== undefined && resolved !== null && Number.isFinite(Number(resolved))) {
    return Number(resolved);
  }
  const override = overrides[key];
  if (override !== undefined && override !== null && Number.isFinite(Number(override))) {
    return Number(override);
  }
  return Number(amountTier) || 0;
}

// The amount and date of the FIRST scheduled installment (excludes add-ons/tip).
// Used for the "first payment" figure and as the basis for the platform tip — the
// tip is charged in full with installment #1, so a % of the whole commitment would
// dwarf the first charge.
export function resolveFirstInstallment({ isRecurring, scheduleType, scheduleConfig, amountTier }) {
  if (!isRecurring) return { base: 0, date: "" };

  const cfg = scheduleConfig && typeof scheduleConfig === "object" ? scheduleConfig : {};
  const overrides = cfg.dateAmounts ?? {};
  const tier = Number(amountTier) || 0;

  const dates = resolveScheduleDateKeys({ scheduleType, scheduleConfig });
  const firstKey = dates.length ? dates[0] : "";

  const base = firstKey && overrides[firstKey] !== undefined ? Number(overrides[firstKey]) : tier;
  return { base, date: firstKey };
}

// The total of the schedule's already-passed installments — the "make up for missed dates"
// charge. Only meaningful when the donor ticked make-up; returns 0 when there are no past dates.
export function resolveMakeUpTotal({ isRecurring, scheduleType, scheduleConfig, amountTier, resolvedAmounts }) {
  if (!isRecurring) return 0;

  const cfg = scheduleConfig && typeof scheduleConfig === "object" ? scheduleConfig : {};
  const overrides = cfg.dateAmounts ?? {};
  const minDateKey = earliestAllowedDateStr();

  const pastKeys = resolveScheduleDateKeys({ scheduleType, scheduleConfig }).filter((d) => d < minDateKey);
  if (!pastKeys.length) return 0;

  const total = pastKeys.reduce(
    (sum, key) => sum + amountForDate(key, { overrides, resolvedAmounts, amountTier }),
    0
  );
  return Number(total.toFixed(2));
}

// What is actually charged on the FIRST charge of a recurring donation.
//
// Normally that is the first scheduled installment plus every one-time extra (add-ons + tip):
// the backend creates installments[0] as `baseAmount + extrasOnce` (SetupSucceededHandler ->
// installment1Amount). Later payments are just their per-date amount.
//
// When the donor ticks "Make up for missed dates" (`makeUpEnabled`), the already-passed dates are
// charged up front too, so the first charge is the SUM of those past installments + extras — not
// just the earliest date. When make-up is off this is identical to the original behaviour.
export function computeFirstPayment({
  isRecurring,
  scheduleType,
  scheduleConfig,
  amountTier,
  resolvedAmounts,
  makeUpEnabled = false,
  addOnsTotal = 0,
  tipAmount = 0,
}) {
  if (!isRecurring) return { amount: 0, date: "" };

  const makeUpTotal = makeUpEnabled
    ? resolveMakeUpTotal({ isRecurring, scheduleType, scheduleConfig, amountTier, resolvedAmounts })
    : 0;

  const { base, date } = makeUpTotal > 0
    ? { base: makeUpTotal, date: resolveScheduleDateKeys({ scheduleType, scheduleConfig })[0] ?? "" }
    : resolveFirstInstallment({ isRecurring, scheduleType, scheduleConfig, amountTier });

  const amount = Number((base + (Number(addOnsTotal) || 0) + (Number(tipAmount) || 0)).toFixed(2));

  return { amount, date };
}
