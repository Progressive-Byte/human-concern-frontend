export const PRESETS = [
  { id: "every_monday",   label: "Every Monday",   icon: "📅" },
  { id: "odd_nights",     label: "Odd nights",      icon: "🌙" },
  { id: "ramadan_last10", label: "Last 10 Ramadan", icon: "✨" },
  { id: "may_15_30",      label: "15–30 May",       icon: "🗓" },
  { id: "every_friday",   label: "Every Friday",    icon: "🕌" },
  { id: "custom",         label: "Custom",          icon: "✏️" },
];

const toISO = (d) => d.toISOString().split("T")[0];

function nextWeekdays(targetDay, count = 4) {
  const today = new Date();
  const dates = [];
  const d = new Date(today);
  const diff = (targetDay - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  for (let i = 0; i < count; i++) {
    dates.push(toISO(d));
    d.setDate(d.getDate() + 7);
  }
  return dates;
}

function oddNightDates() {
  const today    = new Date();
  const todayStr = toISO(today);
  const m        = today.getMonth();
  const y        = today.getFullYear();
  const dates    = [];

  const addOddDays = (year, month) => {
    const days = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= days; day++) {
      if (day % 2 !== 0) {
        const s = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        if (s >= todayStr) dates.push(s);
      }
    }
  };

  addOddDays(y, m);
  if (dates.length < 3) addOddDays(m === 11 ? y + 1 : y, (m + 1) % 12);

  return dates.slice(0, 15);
}

function ramadanLast10Dates() {
  const start = new Date("2027-03-09");
  return Array.from({ length: 10 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return toISO(d);
  });
}

function may1530Dates() {
  const today    = new Date();
  const todayStr = toISO(today);
  const y        = today.getFullYear();
  const useYear  = new Date(y, 4, 30) >= today ? y : y + 1;
  const dates    = [];
  for (let day = 15; day <= 30; day++) {
    const s = `${useYear}-05-${String(day).padStart(2, "0")}`;
    if (s >= todayStr) dates.push(s);
  }
  return dates;
}

export function getPresetDates(presetId) {
  switch (presetId) {
    case "every_monday":   return { type: "specific_dates", dates: nextWeekdays(1) };
    case "every_friday":   return { type: "specific_dates", dates: nextWeekdays(5) };
    case "odd_nights":     return { type: "specific_dates", dates: oddNightDates() };
    case "ramadan_last10": return { type: "specific_dates", dates: ramadanLast10Dates() };
    case "may_15_30":      return { type: "specific_dates", dates: may1530Dates() };
    default:               return null;
  }
}
