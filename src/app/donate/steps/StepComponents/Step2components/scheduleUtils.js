import { generateDatesInRange } from "../countOccurrences";

export const FREQ_OPTIONS = [
  { value: "daily",   label: "Daily",   minDays: 1 },
  { value: "weekly",  label: "Weekly",  minDays: 7 },
  { value: "monthly", label: "Monthly", minDays: 30 },
  { value: "yearly",  label: "Yearly",  minDays: 365 },
  { value: "custom",  label: "Custom",  minDays: 1 },
];

export function resolveFreq(newStart, newEnd, currentFreq) {
  if (!newStart || !newEnd) return currentFreq;
  const days = Math.floor((new Date(newEnd) - new Date(newStart)) / 86400000) + 1;
  if (days <= 0) return currentFreq;
  const opt = FREQ_OPTIONS.find((o) => o.value === currentFreq);
  if (opt && days < opt.minDays) return "daily";
  return currentFreq;
}

export function buildConfig(type, dates, start, end, freq, amounts, interval) {
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
  const rangeDatesArr = generateDatesInRange(start, end, freq, interval);
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
    ...(Object.keys(overrides).length > 0 && { dateAmounts: overrides }),
  };
}
