// Cause allocation is stored as ratios (fractions of 1), not fixed dollars, so it
// stays valid no matter what the donation total ends up being (chosen in a later
// step, or split across per-installment amounts for a recurring donation).
//
// Causes the donor has typed into are "manual" and stay pinned at their ratio;
// the remaining causes ("auto") share whatever is left, equally. This is what makes
// a manually entered value stick when another cause is edited.

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

// Re-fits the split for the current selection without disturbing manual causes.
// Used when a cause is ticked/unticked, and as the base for manual edits.
export function fitSplit({ causeIds = [], causeSplit = {}, manualIds = [] }) {
  const ids = Array.isArray(causeIds) ? causeIds : [];
  if (!ids.length) return {};

  const manual = new Set((Array.isArray(manualIds) ? manualIds : []).filter((id) => ids.includes(id)));
  const pinned = {};
  let pinnedTotal = 0;
  for (const id of ids) {
    if (!manual.has(id)) continue;
    const ratio = clamp01(causeSplit[id] ?? 0);
    pinned[id] = ratio;
    pinnedTotal += ratio;
  }

  const autoIds = ids.filter((id) => !manual.has(id));
  const next = { ...pinned };

  if (autoIds.length) {
    const share = Math.max(0, 1 - pinnedTotal) / autoIds.length;
    autoIds.forEach((id) => { next[id] = share; });
    return next;
  }

  // Every selected cause is manual: scale them so the map still sums to 1.
  if (pinnedTotal > 0 && pinnedTotal !== 1) {
    const scale = 1 / pinnedTotal;
    ids.forEach((id) => { next[id] = (pinned[id] ?? 0) * scale; });
  }
  return next;
}

// Applies a donor-typed dollar amount for one cause. The edited cause is pinned at
// that amount (clamped so the whole split can never exceed the total); other manual
// causes keep their ratios; auto causes share what's left.
export function applyManualAmount({ causeIds = [], causeSplit = {}, manualIds = [], editedId, amount, total }) {
  const ids = Array.isArray(causeIds) ? causeIds : [];
  if (!ids.length || !ids.includes(editedId)) return { causeSplit, manualIds };

  const totalNum = Number(total) || 0;
  const manual = new Set([...(Array.isArray(manualIds) ? manualIds : []), editedId]);

  const others = ids.filter((id) => id !== editedId);
  const manualOthers = others.filter((id) => manual.has(id));
  const autoOthers = others.filter((id) => !manual.has(id));
  const manualOthersTotal = manualOthers.reduce((sum, id) => sum + clamp01(causeSplit[id] ?? 0), 0);

  // Never let this entry push the others negative — cap it at what's still free.
  const maxRatio = Math.max(0, 1 - manualOthersTotal);
  const requested = totalNum > 0 ? Number(amount) / totalNum : 0;
  const ratio = Math.min(clamp01(requested), maxRatio);

  const next = { [editedId]: ratio };
  manualOthers.forEach((id) => { next[id] = clamp01(causeSplit[id] ?? 0); });

  const remainder = Math.max(0, 1 - ratio - manualOthersTotal);
  if (autoOthers.length) {
    const share = remainder / autoOthers.length;
    autoOthers.forEach((id) => { next[id] = share; });
  } else if (manualOthers.length) {
    // No auto cause left to absorb it: the other manual causes fill what's left of the
    // total (scaled proportionally) so the split still sums to 1.
    const pool = Math.max(0, 1 - ratio);
    const scale = manualOthersTotal > 0 ? pool / manualOthersTotal : 0;
    manualOthers.forEach((id) => { next[id] = clamp01(causeSplit[id] ?? 0) * scale; });
  }

  ids.forEach((id) => { if (next[id] === undefined) next[id] = 0; });
  return { causeSplit: next, manualIds: Array.from(manual) };
}

// Largest amount this cause can take without starving the manual causes.
export function maxManualAmount({ causeIds = [], causeSplit = {}, manualIds = [], editedId, total }) {
  const ids = Array.isArray(causeIds) ? causeIds : [];
  const manual = new Set(manualIds ?? []);
  const manualOthersTotal = ids
    .filter((id) => id !== editedId && manual.has(id))
    .reduce((sum, id) => sum + clamp01(causeSplit[id] ?? 0), 0);
  const totalNum = Number(total) || 0;
  return Math.max(0, totalNum * Math.max(0, 1 - manualOthersTotal));
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
