function normalizeWeeklyDays(daysOfWeek, startDate) {
  const list = Array.isArray(daysOfWeek) ? daysOfWeek : [];
  const set = Array.from(new Set(list.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))).sort((a, b) => a - b);
  if (set.length) return set;
  return startDate ? [startDate.getUTCDay()] : [];
}

const countOccurrences = (start, end, freq, customInterval = 1, daysOfWeek = []) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  if (freq === "daily")   return Math.floor((e - s) / 86400000) + 1;
  if (freq === "weekly") {
    const daySet = new Set(normalizeWeeklyDays(daysOfWeek, s));
    let count = 0;
    const cursor = new Date(s);
    while (cursor <= e && count < 5000) {
      if (daySet.has(cursor.getUTCDay())) count += 1;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return count;
  }
  if (freq === "monthly")
    return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  if (freq === "yearly")
    return e.getFullYear() - s.getFullYear() + 1;
  if (freq === "custom") {
    const interval  = Math.max(1, Number(customInterval) || 1);
    const totalDays = Math.floor((e - s) / 86400000) + 1;
    return Math.max(1, Math.floor(totalDays / interval));
  }
  return 1;
};

export function generateDatesInRange(start, end, freq, customInterval = 1, daysOfWeek = []) {
  if (!start || !end) return [];
  const startDate = new Date(`${start}T00:00:00.000Z`);
  const endDate   = new Date(`${end}T00:00:00.000Z`);
  if (endDate < startDate) return [];

  if (freq === "custom") {
    const interval  = Math.max(1, Number(customInterval) || 1);
    const totalDays = Math.floor((endDate - startDate) / 86400000) + 1;
    const count     = Math.max(1, Math.floor(totalDays / interval));
    const dates     = [];
    for (let i = 0; i < count && dates.length < 500; i++) {
      const d = new Date(startDate);
      d.setUTCDate(d.getUTCDate() + i * interval);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }

  const weekDays = freq === "weekly" ? normalizeWeeklyDays(daysOfWeek, startDate) : [];
  const weeklySet = freq === "weekly" ? new Set(weekDays) : null;

  const dates   = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    if (!weeklySet || weeklySet.has(current.getUTCDay())) dates.push(current.toISOString().split("T")[0]);
    if      (weeklySet)          current.setUTCDate(current.getUTCDate() + 1);
    else if (freq === "daily")   current.setUTCDate(current.getUTCDate() + 1);
    else if (freq === "monthly") current.setUTCMonth(current.getUTCMonth() + 1);
    else if (freq === "yearly")  current.setUTCFullYear(current.getUTCFullYear() + 1);
    else break;
    if (dates.length >= 500) break; // safety cap
  }
  return dates;
}

export default countOccurrences;
