import { generateDatesInRange } from "../countOccurrences";

export const FREQ_OPTIONS = [
  { value: "daily",   label: "Daily",   minDays: 1 },
  { value: "weekly",  label: "Weekly",  minDays: 7 },
  { value: "monthly", label: "Monthly", minDays: 30 },
  { value: "yearly",  label: "Yearly",  minDays: 365 },
  { value: "custom",  label: "Interval", minDays: 1 },
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Monthly/yearly pick whole periods (a month / a year) instead of individual days, so the
// day-based `minDays` guard below must not apply to them.
export function isPeriodFreq(freq) {
  return freq === "monthly" || freq === "yearly";
}

export function firstOfMonth(dateStr) {
  const key = String(dateStr ?? "").slice(0, 7);
  return /^\d{4}-\d{2}$/.test(key) ? `${key}-01` : "";
}

export function janFirst(dateStr) {
  const year = String(dateStr ?? "").slice(0, 4);
  return /^\d{4}$/.test(year) ? `${year}-01-01` : "";
}

export function periodStartFor(freq, dateStr) {
  if (freq === "monthly") return firstOfMonth(dateStr);
  if (freq === "yearly") return janFirst(dateStr);
  return String(dateStr ?? "");
}

const pad2 = (n) => String(n).padStart(2, "0");

// First period whose start is >= minDateStr (e.g. minDate 2026-09-19 -> October 2026).
function earliestMonthKey(minDateStr) {
  const base = String(minDateStr || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(base)) {
    const now = new Date();
    return `${now.getUTCFullYear()}-${pad2(now.getUTCMonth() + 1)}`;
  }
  const [y, m, d] = base.split("-").map(Number);
  const nextMonth = d === 1 ? m : m + 1;
  const year = y + Math.floor((nextMonth - 1) / 12);
  const month = ((nextMonth - 1) % 12) + 1;
  return `${year}-${pad2(month)}`;
}

function earliestYearKey(minDateStr) {
  const base = String(minDateStr || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(base)) return String(new Date().getUTCFullYear());
  const [y, m, d] = base.split("-").map(Number);
  return String(m === 1 && d === 1 ? y : y + 1);
}

// Adds N months to a 'YYYY-MM' key.
function addMonthsToKey(monthKey, delta) {
  const [y, m] = String(monthKey).split("-").map(Number);
  const total = (y * 12) + (m - 1) + delta;
  return `${Math.floor(total / 12)}-${pad2((total % 12) + 1)}`;
}

// Month/year options for the period pickers, bounded by the allowed window. When the
// campaign has no end date the window extends a bounded horizon so the list stays finite.
export function monthOptions(minDateStr, maxDateStr, horizonMonths = 60) {
  const first = earliestMonthKey(minDateStr);
  const maxKey = String(maxDateStr || "").slice(0, 7);
  const bounded = /^\d{4}-\d{2}$/.test(maxKey);
  const last = bounded && maxKey >= first ? maxKey : addMonthsToKey(first, horizonMonths);
  const singleYear = last.slice(0, 4) === first.slice(0, 4);

  const out = [];
  let cursor = first;
  while (cursor <= last && out.length < 600) {
    const [y, m] = cursor.split("-").map(Number);
    out.push({
      value: cursor,
      label: singleYear ? MONTH_NAMES[m - 1] : `${MONTH_NAMES[m - 1]} ${y}`,
    });
    cursor = addMonthsToKey(cursor, 1);
  }
  return out;
}

export function yearOptions(minDateStr, maxDateStr, horizonYears = 10) {
  const firstYear = Number(earliestYearKey(minDateStr));
  const maxYear = Number(String(maxDateStr || "").slice(0, 4));
  const lastYear = Number.isFinite(maxYear) && maxYear >= firstYear ? maxYear : firstYear + horizonYears;

  const out = [];
  for (let y = firstYear; y <= lastYear && out.length < 100; y += 1) {
    out.push({ value: String(y), label: String(y) });
  }
  return out;
}

// The earliest selectable period start for a period frequency (so a default never lands in
// the past, which the API rejects).
export function earliestPeriodStartFor(freq, minDateStr) {
  if (freq === "monthly") return `${earliestMonthKey(minDateStr)}-01`;
  if (freq === "yearly") return `${earliestYearKey(minDateStr)}-01-01`;
  return String(minDateStr ?? "");
}

export function resolveFreq(newStart, newEnd, currentFreq) {
  // Monthly/yearly select whole periods, so a short range is not a reason to downgrade.
  if (isPeriodFreq(currentFreq)) return currentFreq;
  if (!newStart || !newEnd) return currentFreq;
  const days = Math.floor((new Date(newEnd) - new Date(newStart)) / 86400000) + 1;
  if (days <= 0) return currentFreq;
  const opt = FREQ_OPTIONS.find((o) => o.value === currentFreq);
  if (opt && days < opt.minDays) return "daily";
  return currentFreq;
}

export function buildConfig(type, dates, start, end, freq, amounts, interval, daysOfWeek) {
  if (type === "specific_dates") {
    const sorted = [...dates].sort();
    const overrides = {};
    sorted.forEach((d) => {
      if (amounts[d] !== undefined && amounts[d] !== "") overrides[d] = Number(amounts[d]);
    });
    return {
      dates: sorted.map((d) => new Date(`${d}T00:00:00.000Z`).toISOString()),
      ...(Object.keys(overrides).length > 0 && { dateAmounts: overrides }),
    };
  }
  const rangeDatesArr = generateDatesInRange(start, end, freq, interval, daysOfWeek);
  const validSet = new Set(rangeDatesArr);
  const overrides = {};
  Object.entries(amounts).forEach(([d, v]) => {
    if (validSet.has(d) && v !== undefined && v !== "") overrides[d] = Number(v);
  });
  return {
    startDate: start ? new Date(`${start}T00:00:00.000Z`).toISOString() : "",
    endDate:   end   ? new Date(`${end}T00:00:00.000Z`).toISOString()   : "",
    frequency: freq,
    ...(freq === "custom" && { customInterval: Math.max(1, Number(interval) || 1) }),
    ...(freq === "weekly" && Array.isArray(daysOfWeek) && daysOfWeek.length
      ? { daysOfWeek: Array.from(new Set(daysOfWeek.map(Number))).sort((a, b) => a - b) }
      : {}),
    ...(Object.keys(overrides).length > 0 && { dateAmounts: overrides }),
  };
}
