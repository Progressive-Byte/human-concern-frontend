// Mirrors the API rule in human-concern-api publicDonationValidators.js:
// every scheduled due date must be >= Date.now() + MIN_LEAD_TIME_MS.
// Due dates are sent as UTC midnight, so the earliest selectable date is the
// first UTC midnight that is not before the lead-time threshold.
export const MIN_LEAD_TIME_MS = 10 * 60 * 1000;

export function earliestAllowedDateStr(now = Date.now()) {
  const threshold = now + MIN_LEAD_TIME_MS;
  const d = new Date(threshold);
  d.setUTCHours(0, 0, 0, 0);
  if (d.getTime() < threshold) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Accepts a 'YYYY-MM-DD' key or a full ISO string (which the API reads as UTC).
export function isDueDateAllowed(value, now = Date.now()) {
  if (!value) return false;
  const raw = String(value);
  const ms  = Date.parse(raw.length === 10 ? `${raw}T00:00:00.000Z` : raw);
  return Number.isFinite(ms) && ms >= now + MIN_LEAD_TIME_MS;
}
