import { generateDatesInRange } from "./countOccurrences";

// The amount and date of the FIRST scheduled installment (excludes add-ons/tip).
// Used for the "first payment" figure and as the basis for the platform tip — the
// tip is charged in full with installment #1, so a % of the whole commitment would
// dwarf the first charge.
export function resolveFirstInstallment({ isRecurring, scheduleType, scheduleConfig, amountTier }) {
  if (!isRecurring) return { base: 0, date: "" };

  const cfg = scheduleConfig && typeof scheduleConfig === "object" ? scheduleConfig : {};
  const overrides = cfg.dateAmounts ?? {};
  const tier = Number(amountTier) || 0;

  // Resolve the earliest scheduled date.
  let firstKey = "";
  if (scheduleType === "specific_dates") {
    const dates = Array.isArray(cfg.dates) ? [...cfg.dates].sort() : [];
    if (dates.length) firstKey = String(dates[0]).split("T")[0];
  } else if (scheduleType === "date_range") {
    const start = cfg.startDate ? String(cfg.startDate).split("T")[0] : "";
    const end = cfg.endDate ? String(cfg.endDate).split("T")[0] : "";
    if (start && end) {
      const list = generateDatesInRange(start, end, cfg.frequency ?? "daily", cfg.customInterval ?? 1, cfg.daysOfWeek ?? []);
      if (list.length) firstKey = list[0];
    }
  }

  const base = firstKey && overrides[firstKey] !== undefined ? Number(overrides[firstKey]) : tier;
  return { base, date: firstKey };
}

// What is actually charged on the FIRST scheduled date of a recurring donation:
// the first instalment's amount plus every one-time extra (add-ons + tip).
// Mirrors the backend, which creates installments[0] as
// `baseAmount + extrasOnce` (SetupSucceededHandler -> installment1Amount).
//
// Later payments are just their per-date amount, so the summary and the pay
// button must show this figure (not the whole commitment) when recurring.
export function computeFirstPayment({
  isRecurring,
  scheduleType,
  scheduleConfig,
  amountTier,
  addOnsTotal = 0,
  tipAmount = 0,
}) {
  if (!isRecurring) return { amount: 0, date: "" };

  const { base, date } = resolveFirstInstallment({ isRecurring, scheduleType, scheduleConfig, amountTier });
  const amount = Number((base + (Number(addOnsTotal) || 0) + (Number(tipAmount) || 0)).toFixed(2));

  return { amount, date };
}
