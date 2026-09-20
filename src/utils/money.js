/**
 * Currency-safe money helpers for the donation wizard.
 *
 * Everything is done in integer CENTS so float arithmetic can never introduce cent-level drift
 * (e.g. `100 / 3 * 3` producing 99.99999999999999).
 */

export function toCents(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function fromCents(cents) {
  const n = Number(cents);
  return Number.isFinite(n) ? Math.round(n) / 100 : 0;
}

export function sumCents(values) {
  return (Array.isArray(values) ? values : []).reduce((sum, value) => sum + toCents(value), 0);
}

/**
 * Splits a total evenly across `count` slots at cent precision. Every slot gets
 * `floor(total / count)` cents; the whole remainder goes on the LAST slot, so the slots always
 * add up to the total exactly and earlier amounts are never inflated.
 */
export function splitEvenlyCents(totalCents, count) {
  const n = Math.max(1, Math.floor(Number(count) || 0));
  const total = Math.round(Number(totalCents) || 0);
  const base = Math.floor(total / n);
  const out = new Array(n).fill(base);
  out[n - 1] = total - base * (n - 1);
  return out;
}

/**
 * Works out what every date of a recurring schedule should be charged, in CENTS.
 *
 * - `committedCents` is what the dates in `dates` must add up to (the donor's typed total).
 * - A date the donor edited (`overrides[date]`) keeps its own value.
 * - The remaining dates split the rest evenly, and the LAST un-edited date absorbs the cent
 *   remainder — so the sum always equals the commitment exactly.
 * - `fixed` maps dates that are not part of the split (e.g. make-up dates for missed days) to
 *   their own cents; they are returned as-is and count towards the final total.
 *
 * Returns `{ amounts, totalCents }` where `amounts` maps `YYYY-MM-DD` -> cents.
 */
export function resolveScheduleAmounts({ dates, overrides = {}, committedCents, fixed = {} } = {}) {
  const amounts = { ...(fixed || {}) };

  const list = Array.isArray(dates) ? dates : [];
  const editedIdx = [];
  const freeIdx = [];
  list.forEach((date, index) => {
    const raw = overrides[date];
    const hasOverride = raw !== undefined && raw !== null && String(raw).trim() !== "" && Number.isFinite(Number(raw));
    (hasOverride ? editedIdx : freeIdx).push(index);
  });

  let editedCents = 0;
  for (const i of editedIdx) {
    const cents = toCents(overrides[list[i]]);
    amounts[list[i]] = cents;
    editedCents += cents;
  }

  if (freeIdx.length) {
    // Never invent a negative installment: if the donor's edits already exceed the commitment the
    // free dates get 0 and the step validation surfaces the problem before submit.
    const remaining = Math.max(0, Math.round(Number(committedCents) || 0) - editedCents);
    const shares = splitEvenlyCents(remaining, freeIdx.length);
    freeIdx.forEach((dateIndex, k) => {
      amounts[list[dateIndex]] = shares[k];
    });
  }

  // Includes the `fixed` dates, so the total is the whole schedule.
  const totalCents = Object.values(amounts).reduce((sum, cents) => sum + (cents || 0), 0);
  return { amounts, totalCents };
}
