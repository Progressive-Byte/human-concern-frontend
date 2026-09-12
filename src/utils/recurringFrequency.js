// UTC day numbers to match the schedule generators (0 = Sunday … 6 = Saturday).
export const WEEKDAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

export function normalizeDaysOfWeek(days) {
  if (!Array.isArray(days)) return [];
  const set = new Set(
    days.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
  );
  return Array.from(set).sort((a, b) => a - b);
}

export function weekdayLabel(day) {
  const found = WEEKDAYS.find((w) => w.value === Number(day));
  return found ? found.label : "";
}

export function formatWeekdays(days) {
  const list = normalizeDaysOfWeek(days);
  if (!list.length) return "";
  if (list.length === 7) return "every day";
  const labels = list.map(weekdayLabel).filter(Boolean);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

// Short note explaining when the recurring donation will be taken.
export function recurringFrequencyHint({ frequency, interval, daysOfWeek } = {}) {
  const freq = String(frequency || "").toLowerCase();

  if (freq === "daily") return "The donation will be taken daily.";
  if (freq === "monthly") return "The donation will be taken monthly.";
  if (freq === "yearly") return "The donation will be taken yearly.";

  if (freq === "weekly") {
    const list = normalizeDaysOfWeek(daysOfWeek);
    if (list.length === 7) return "The donation will be taken every day.";
    const text = formatWeekdays(list);
    return text
      ? `The donation will be taken every ${text}.`
      : "The donation will be taken weekly.";
  }

  if (freq === "custom" || freq === "interval") {
    const n = Math.max(1, Number(interval) || 1);
    return `The donation will be taken every ${n} day${n === 1 ? "" : "s"}.`;
  }

  return "";
}
