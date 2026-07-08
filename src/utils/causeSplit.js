// Cause allocation is stored as ratios (fractions of 1), not fixed dollars, so it
// stays valid no matter what the donation total ends up being (chosen in a later
// step, or split across per-installment amounts for a recurring donation).

export function equalSplit(causeIds) {
  const ids = causeIds ?? [];
  if (!ids.length) return {};
  const share = 1 / ids.length;
  return Object.fromEntries(ids.map((id) => [id, share]));
}

// Edited one cause's ratio to `newRatio`; distributes the remainder across the
// other causes proportional to their current relative ratios (equally if they
// were all zero), so the whole map still sums to 1.
export function rebalanceOnEdit(causeSplit, editedCauseId, newRatio) {
  const otherIds = Object.keys(causeSplit).filter((id) => id !== editedCauseId);
  const clamped = Math.max(0, Math.min(1, newRatio));
  const remainder = 1 - clamped;

  if (!otherIds.length) return { ...causeSplit, [editedCauseId]: 1 };

  const othersTotal = otherIds.reduce((sum, id) => sum + (causeSplit[id] ?? 0), 0);
  const next = { ...causeSplit, [editedCauseId]: clamped };
  otherIds.forEach((id) => {
    const weight = othersTotal > 0 ? (causeSplit[id] ?? 0) / othersTotal : 1 / otherIds.length;
    next[id] = remainder * weight;
  });
  return next;
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

  let allocatedCents = shares.reduce((sum, s) => sum + s.floorCents, 0);
  let leftoverCents = totalCents - allocatedCents;

  [...shares]
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, leftoverCents)
    .forEach((s) => { s.floorCents += 1; });

  return shares.map((s) => ({ causeId: s.causeId, amount: s.floorCents / 100 }));
}
