// Required-field registry behind the donate wizard's completion bar.
//
// The predicates mirror the rules each step enforces before it advances:
//   Step 1 → Step1Info.validateAndNext
//   Step 2 → validateAmountScheduleStep (donationStepValidation.js)
//   Step 3 → validateOverviewStep + the customNotes `required` flags
// Keep them in sync if those rules change.
//
// The recurring schedule is included, but as a slot that exists for every campaign which
// allows recurring and counts as done while "one-time" is picked. So the total never
// changes mid-form: the only thing that moves when the donor switches to recurring is
// that one tick, and the % dips until the dates are set. See scheduleItem().
import { resolveCountryIso } from "@/utils/isoHelpers";
import { validateSchedule } from "@/utils/donationStepValidation";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const text = (v) => String(v ?? "").trim();

const CORE_ITEMS = [
  { key: "organization", isValid: (d) => Boolean(text(d.organization)) },
  { key: "firstName",    isValid: (d) => Boolean(text(d.firstName)) },
  { key: "lastName",     isValid: (d) => Boolean(text(d.lastName)) },
  { key: "email",        isValid: (d) => EMAIL_RE.test(text(d.email)) },
  { key: "addressLine1", isValid: (d) => Boolean(text(d.addressLine1)) },
  { key: "city",         isValid: (d) => Boolean(text(d.city)) },
  { key: "province",     isValid: (d) => Boolean(text(d.province)) },
  { key: "zip",          isValid: (d) => Boolean(text(d.zip)) },
  { key: "country",      isValid: (d) => Boolean(text(d.donorCountryCode) || resolveCountryIso(text(d.country))) },
  { key: "amount",       isValid: (d) => Number(d.donorAmount ?? d.amount ?? 0) > 0 },
  { key: "paymentMethod", isValid: (d) => ["stripe", "paypal"].includes(d.paymentMethod) },
];

// Mirrors the customNoteFields combination in Step3Addons.jsx: customNotes, plus
// globalNote (de-duplicated by key) only when goalsDates.showGlobalNote is on.
function requiredNoteFields(config) {
  const gd = config?.goalsDates ?? {};
  const fields = [];
  const seen = new Set();

  for (const f of Array.isArray(gd.customNotes) ? gd.customNotes : []) {
    if (!f || typeof f !== "object") continue;
    fields.push(f);
    seen.add(text(f.key));
  }
  if (gd.showGlobalNote) {
    for (const f of Array.isArray(config?.globalNote) ? config.globalNote : []) {
      if (!f || typeof f !== "object" || seen.has(text(f.key))) continue;
      fields.push(f);
      seen.add(text(f.key));
    }
  }
  return fields.filter((f) => f.required);
}

// The schedule is only work for a donor who picked "recurring". Counting the slot for
// every campaign that allows recurring — rather than adding it when the choice is made —
// keeps the total (and therefore the %) stable across the switch.
function scheduleItem(config) {
  const gd = config?.goalsDates ?? {};
  // No recurring on this campaign means the slot could never be filled, so leave it out.
  if ((gd.allowRecurringDonations ?? true) === false) return null;

  // Same end date Step2Payment hands to validateAmountScheduleStep.
  const campaignEndDate = gd.endAt ?? config?.endAt ?? null;

  return {
    key: "schedule",
    isValid: (d) =>
      d.paymentType !== "recurring" ||
      validateSchedule({
        scheduleType:      d.scheduleType,
        scheduleConfig:    d.scheduleConfig,
        campaignEndDate,
        makeUpMissedDates: d.makeUpMissedDates,
      }) === null,
  };
}

export function buildRequiredItems(config) {
  const items = [...CORE_ITEMS];

  if ((config?.causes ?? []).length > 0) {
    items.push({ key: "causes", isValid: (d) => (d.causeIds ?? []).length > 0 });
  }

  const schedule = scheduleItem(config);
  if (schedule) items.push(schedule);

  for (const field of requiredNoteFields(config)) {
    items.push({
      key: `note:${field.key}`,
      isValid: (d) => {
        const value = (d.customNoteValues ?? {})[field.key];
        return field.type === "checkbox" ? Boolean(value) : Boolean(text(value));
      },
    });
  }

  return items;
}

export function computeDonationProgress(data, config) {
  const items = buildRequiredItems(config);
  const completed = items.filter((item) => {
    try { return Boolean(item.isValid(data)); } catch { return false; }
  }).length;
  const total = items.length || 1;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}
