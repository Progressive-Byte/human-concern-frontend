// Cause allocation is stored as ratios (fractions of 1), not fixed dollars, so it
// stays valid no matter what the donation total ends up being (chosen in a later
// step, or split across per-installment amounts for a recurring donation).
//
// Selecting causes divides the total equally. When the donor types an amount into a
// card, that card is marked as manually edited and the remaining amount is spread
// equally across the other causes they have not edited yet. Manual amounts are never
// overwritten, so the ratios can still temporarily sum to more or less than 1. Step 1
// refuses to advance until they sum to exactly 1.

// Equal split across the selected causes. Used when a cause is ticked/unticked, and by
// "Reset to equal".
export function fitSplit({ causeIds = [] }) {
  const ids = Array.isArray(causeIds) ? causeIds : [];
  if (!ids.length) return {};
  const share = 1 / ids.length;
  return Object.fromEntries(ids.map((id) => [id, share]));
}

// Applies a donor-typed dollar amount to one cause. The edited cause is recorded as
// manual. If that amount leaves room, the rest is shared equally between the causes the
// donor has not edited yet. Manually edited causes are kept exactly as they are, and the
// amount is never clamped, so step 1 can still report an over/under split.
export function applyManualAmount({
  causeIds = [],
  causeSplit = {},
  editedId,
  amount,
  total,
  manualIds = [],
}) {
  const ids = Array.isArray(causeIds) ? causeIds : [];
  if (!ids.length || !ids.includes(editedId)) return { causeSplit, manualIds };

  const totalNum = Number(total) || 0;
  const manual = new Set(Array.isArray(manualIds) ? manualIds : []);
  const untouched = ids.filter((id) => id !== editedId && !manual.has(id));
  manual.add(editedId);

  if (totalNum <= 0) return { causeSplit, manualIds: [...manual] };

  const totalCents = Math.round(totalNum * 100);
  if (totalCents <= 0) return { causeSplit, manualIds: [...manual] };
  const editedCents = Math.max(0, Math.round((Number(amount) || 0) * 100));
  const manualCents = ids.reduce((sum, id) => {
    if (id === editedId || untouched.includes(id)) return sum;
    return sum + Math.round(Math.max(0, Number(causeSplit[id]) || 0) * totalCents);
  }, 0);
  const remainingCents = totalCents - editedCents - manualCents;

  if (untouched.length && remainingCents >= 0) {
    const share = Math.floor(remainingCents / untouched.length);
    let extra = remainingCents % untouched.length;
    const cents = {};

    ids.forEach((id) => {
      if (id === editedId) {
        cents[id] = editedCents;
      } else if (untouched.includes(id)) {
        cents[id] = share + (extra > 0 ? 1 : 0);
        if (extra > 0) extra -= 1;
      } else {
        cents[id] = Math.round(Math.max(0, Number(causeSplit[id]) || 0) * totalCents);
      }
    });

    return {
      causeSplit: Object.fromEntries(ids.map((id) => [id, cents[id] / totalCents])),
      manualIds: [...manual],
    };
  }

  const ratio = Math.max(0, Number(amount) || 0) / totalNum;
  const next = { ...causeSplit, [editedId]: ratio };
  ids.forEach((id) => { if (next[id] === undefined) next[id] = 0; });
  return { causeSplit: next, manualIds: [...manual] };
}

// Total dollars the donor has assigned across the selected causes. Step 1 requires this to
// equal the donation amount before it lets the donor continue.
export function allocatedAmount({ causeIds = [], causeSplit = {}, total = 0 }) {
  const ids = Array.isArray(causeIds) ? causeIds : [];
  const totalNum = Number(total) || 0;
  const ratioSum = ids.reduce((sum, id) => sum + Math.max(0, Number(causeSplit[id]) || 0), 0);
  return totalNum * ratioSum;
}

// Splits `total` across causeSplit's ratios into cents-precise amounts that sum
// exactly to `total` (largest-remainder rounding), as the API requires an exact match.
export function distributeAmount(total, causeSplit) {
  const entries = Object.entries(causeSplit ?? {});
  if (!entries.length || !Number.isFinite(total)) return [];

  const totalCents = Math.round(total * 100);
  const shares = entries.map(([causeId, ratio]) => {
    const exactCents = totalCents * ratio;
    return { causeId, floorCents: Math.floor(exactCents), remainder: exactCents - Math.floor(exactCents) };
  });

  // A balanced split (ratios summing to 1) has leftover cents that are pure rounding, so they
  // are handed out largest-remainder first. An unbalanced split is the donor mid-edit — paying
  // cents out there would make an untouched cause's amount drift, so leave them alone.
  const ratioSum = entries.reduce((sum, [, ratio]) => sum + (Number(ratio) || 0), 0);
  const balanced = Math.abs(ratioSum - 1) <= 0.005;

  if (balanced) {
    const allocatedCents = shares.reduce((sum, s) => sum + s.floorCents, 0);
    const leftoverCents = totalCents - allocatedCents;

    [...shares]
      .sort((a, b) => b.remainder - a.remainder)
      .slice(0, leftoverCents)
      .forEach((s) => { s.floorCents += 1; });
  }

  return shares.map((s) => ({ causeId: s.causeId, amount: s.floorCents / 100 }));
}
