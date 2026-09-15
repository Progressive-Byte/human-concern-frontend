// Ported from the API's generateDateRangeDates (publicDonationValidators.js) so the schedule
// dates the frontend submits are byte-for-byte the set the server re-derives for validation.
// Divergence here surfaces as "dates do not match scheduleConfig frequency" on submit.

const MAX_INSTALLMENTS = 365;
const MAX_ITERATIONS = 10000;

const daysInUtcMonth = (year, monthZeroBased) => new Date(Date.UTC(year, monthZeroBased + 1, 0)).getUTCDate();

function addDaysUtc(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addMonthsUtc(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const ms = date.getUTCMilliseconds();

  const targetMonthIndex = month + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const maxDay = daysInUtcMonth(targetYear, normalizedMonth);
  const clampedDay = Math.min(day, maxDay);
  return new Date(Date.UTC(targetYear, normalizedMonth, clampedDay, hours, minutes, seconds, ms));
}

function addYearsUtc(date, years) {
  const year = date.getUTCFullYear() + years;
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const ms = date.getUTCMilliseconds();

  const maxDay = daysInUtcMonth(year, month);
  const clampedDay = Math.min(day, maxDay);
  return new Date(Date.UTC(year, month, clampedDay, hours, minutes, seconds, ms));
}

function sanitizeDaysOfWeek(daysOfWeek) {
  const list = Array.isArray(daysOfWeek) ? daysOfWeek : [];
  return Array.from(new Set(list.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))).sort((a, b) => a - b);
}

const toDayKey = (v) => String(v ?? "").slice(0, 10);

const toUtcMidnight = (v) => {
  const key = toDayKey(v);
  return key ? new Date(`${key}T00:00:00.000Z`) : new Date(NaN);
};

// Returns the schedule's due dates as sorted 'YYYY-MM-DD' keys.
// freq accepts the UI's "custom" as an alias for the API's "interval".
export function generateDatesInRange(start, end, freq, customInterval = 1, daysOfWeek = []) {
  if (!start || !end) return [];
  const startDate = toUtcMidnight(start);
  const endDate = toUtcMidnight(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return [];
  if (endDate < startDate) return [];

  const frequency = freq === "custom" ? "interval" : freq;
  const interval = Math.max(1, Number(customInterval) || 1);
  const weekDays = frequency === "weekly" ? sanitizeDaysOfWeek(daysOfWeek) : [];
  const weeklySet = frequency === "weekly" ? new Set(weekDays.length ? weekDays : [startDate.getUTCDay()]) : null;

  const out = [];
  let cursor = new Date(startDate);
  let iterations = 0;

  while (cursor <= endDate && iterations < MAX_ITERATIONS) {
    iterations += 1;

    if (!weeklySet || weeklySet.has(cursor.getUTCDay())) out.push(toDayKey(cursor.toISOString()));

    if (weeklySet) cursor = addDaysUtc(cursor, 1);
    else if (frequency === "daily") cursor = addDaysUtc(cursor, 1);
    else if (frequency === "monthly") cursor = addMonthsUtc(cursor, 1);
    else if (frequency === "yearly") cursor = addYearsUtc(cursor, 1);
    else if (frequency === "interval") cursor = addDaysUtc(cursor, interval);
    else break;

    if (out.length > MAX_INSTALLMENTS) break;
  }

  return out;
}

const countOccurrences = (start, end, freq, customInterval = 1, daysOfWeek = []) =>
  generateDatesInRange(start, end, freq, customInterval, daysOfWeek).length;

export default countOccurrences;
