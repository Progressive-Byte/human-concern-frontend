import { generateDatesInRange } from "../countOccurrences";
import { distributeAmount } from "@/utils/causeSplit";
import { buildDonorReturnParams, saveDonorReturnParams } from "@/components/payment/UnifiedChallengeDispatcher";
import { buildUtmPayload, readFirstTouch } from "@/utils/utm";

export function normalizeNoteFields(value) {
  return Array.isArray(value) ? value.filter((field) => field && typeof field === "object") : [];
}

/**
 * The amount for one schedule date. The resolved map (Step 1) already applied the committed
 * total and the last-installment remainder, so it wins; explicit per-date overrides are next,
 * and the plain per-date amount is the fallback.
 */
function pickDateAmount({ resolved, overrides, key, fallback }) {
  const r = resolved ? resolved[key] : undefined;
  if (r !== undefined && r !== null) return Number(r);
  if (overrides && overrides[key] !== undefined) return Number(overrides[key]);
  return fallback;
}

function buildDatesFromConfig({ scheduleType, scheduleConfig, resolvedAmounts, amountTier }) {
  const dateAmounts = scheduleConfig.dateAmounts ?? {};

  if (scheduleType === "specific_dates") {
    return (scheduleConfig.dates ?? []).map((isoDate) => {
      const key = isoDate.split("T")[0];
      const amount = pickDateAmount({ resolved: resolvedAmounts, overrides: dateAmounts, key, fallback: amountTier });
      return { date: isoDate, amount, causeAllocations: [] };
    });
  }

  const rawFreq  = scheduleConfig.frequency ?? "daily";
  const apiFreq  = rawFreq === "custom" ? "interval" : rawFreq;
  const interval = scheduleConfig.customInterval ?? 1;
  const days     = Array.isArray(scheduleConfig.daysOfWeek) ? scheduleConfig.daysOfWeek : [];
  const startKey = scheduleConfig.startDate?.split("T")[0] ?? "";
  const endKey   = scheduleConfig.endDate?.split("T")[0] ?? "";
  const allKeys  = generateDatesInRange(startKey, endKey, rawFreq, interval, days);

  return allKeys.map((d) => ({
    date: new Date(`${d}T00:00:00.000Z`).toISOString(),
    amount: pickDateAmount({ resolved: resolvedAmounts, overrides: dateAmounts, key: d, fallback: amountTier }),
    causeAllocations: [],
  }));
}

export function buildApiScheduleConfig({ data, amountTier, scheduleType, scheduleConfig }) {
  const causeSplit = data.causeSplit ?? {};
  const dates = buildDatesFromConfig({
    scheduleType,
    scheduleConfig,
    resolvedAmounts: data.resolvedScheduleAmounts,
    amountTier,
  }).map((row) => ({
    ...row,
    causeAllocations: distributeAmount(row.amount, causeSplit),
  }));

  if (scheduleType === "specific_dates") return { dates };

  const rawFreq  = scheduleConfig.frequency ?? "daily";
  const apiFreq  = rawFreq === "custom" ? "interval" : rawFreq;
  const interval = scheduleConfig.customInterval ?? 1;
  const days     = Array.isArray(scheduleConfig.daysOfWeek) ? scheduleConfig.daysOfWeek : [];

  return {
    startDate: scheduleConfig.startDate ?? "",
    endDate:   scheduleConfig.endDate   ?? "",
    frequency: apiFreq,
    ...(apiFreq === "interval" && { intervalValue: interval }),
    ...(apiFreq === "weekly" && days.length ? { daysOfWeek: days } : {}),
    dates,
  };
}

function buildNoteAnswers({ data, campaignMeta }) {
  const customNotes = normalizeNoteFields(campaignMeta.goalsDates?.customNotes);
  const globalNote = campaignMeta.goalsDates?.showGlobalNote
    ? normalizeNoteFields(campaignMeta.globalNote)
    : [];

  const combined = [...customNotes];
  const seen = new Set(combined.map((f) => String(f.key ?? "").trim()).filter(Boolean));
  globalNote.forEach((f) => {
    const key = String(f.key ?? "").trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      combined.push(f);
    }
  });

  const formKeys = new Set(customNotes.map((f) => String(f.key ?? "").trim()).filter(Boolean));
  const answers = data.customNoteValues ?? {};
  const formValues = {};
  const globalValues = {};

  for (const f of combined) {
    const key = String(f.key ?? "").trim();
    if (!key) continue;

    let value;
    if (f.type === "checkbox") {
      value = !!answers[f.key];
    } else {
      const raw = answers[f.key] ?? "";
      value = typeof raw === "string" ? raw.trim() : raw;
    }

    if (f.type !== "checkbox" && !value) continue;

    if (formKeys.has(key)) formValues[key] = value;
    else globalValues[key] = value;
  }

  return {
    ...(Object.keys(formValues).length > 0 && { customNotes: formValues }),
    ...(Object.keys(globalValues).length > 0 && { globalNotes: globalValues }),
  };
}

function dedicationText(data) {
  const name = String(data.dedicationName ?? "").trim();
  if (data.dedicationType && name) {
    const prefix = data.dedicationType === "memory" ? "In memory of" : "In honor of";
    return `${prefix}: ${name}`.slice(0, 120);
  }
  const legacy = String(data.donorMessage ?? "").trim();
  return legacy ? legacy.slice(0, 120) : "";
}

export function buildSubmitBody({
  data,
  gateway,
  amountTier,
  currency,
  isRecurring,
  baseDonation,
  tipAmount,
  tipPct,
  customTipParsed,
  campaignMeta,
}) {
  const scheduleType   = data.scheduleType   ?? "date_range";
  const scheduleConfig = data.scheduleConfig ?? {};
  const utm            = buildUtmPayload(data);
  const firstTouch     = readFirstTouch();
  const onBehalfOf     = dedicationText(data);

  const body = {
    formId: data.campaignId,
    ...(utm && { utm }),
    ...(firstTouch && { firstTouch }),
    info: {
      ...(data.organization && { organization: data.organization }),
      firstName:    data.firstName    ?? "",
      lastName:     data.lastName     ?? "",
      email:        data.email        ?? "",
      ...(data.phone && { phone: data.phone }),
      addressLine1: data.addressLine1 ?? "",
      city:         data.city         ?? "",
      postalCode:   data.zip          ?? "",
      state:        data.province     ?? "",
      streetName:   data.addressLine1 ?? "",
      country:      data.country      ?? "",
      countryCode:  data.donorCountryCode ?? "",
    },
    ...(data.isRamadan && data.objective && { objectiveId: data.objective }),
    paymentMethod: gateway,
    ...(data.anonymous && { isAnonymous: true }),
    marketingConsent: Boolean(data.marketingConsent),
    ...(onBehalfOf && { onBehalfOf }),
    ...buildNoteAnswers({ data, campaignMeta }),
    addons: {
      items: (data.addOnBreakdown ?? []).map((addon) => ({
        addOnId: addon.id,
        values:  addon.values ?? {},
      })),
    },
  };

  if (isRecurring) {
    const howToSplit = (data.splitMode ?? "repeat") === "divide" ? "divide" : "each";
    body.payment = {
      paymentMode: "split",
      amount:      baseDonation,
      currency,
      howToSplit,
      ...(tipAmount > 0
        ? customTipParsed !== null
          ? { platformTipAmount: tipAmount }
          : { platformTipPercent: tipPct }
        : {}),
      scheduleType,
      scheduleConfig: buildApiScheduleConfig({ data, amountTier, scheduleType, scheduleConfig }),
      ...(data.makeUpMissedDates && data.schedulePreset && data.schedulePreset !== "custom"
        ? { makeUpMissedDates: true, presetId: String(data.schedulePreset) }
        : {}),
    };
  } else {
    body.payment = {
      paymentMode: "one_time",
      amount:      amountTier,
      currency,
      ...(tipAmount > 0 && { platformTipAmount: tipAmount }),
      causeAllocations: distributeAmount(amountTier, data.causeSplit ?? {}),
    };
  }

  if (gateway === "paypal") {
    const donorReturnParams = buildDonorReturnParams(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        donorCountryCode: data.donorCountryCode,
      },
      {
        info: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          donorCountryCode: data.donorCountryCode,
          countryCode: data.donorCountryCode,
        },
        ...data,
      }
    );
    saveDonorReturnParams(donorReturnParams);
    body.donorReturnParams = donorReturnParams;
    body.orchestrationMode = "redirect";
  }

  return body;
}

export function buildEditPayload({ data, amountTier, currency, tipAmount, tipPct, customTipParsed }) {
  const scheduleType   = data.scheduleType   ?? "specific_dates";
  const scheduleConfig = data.scheduleConfig ?? {};
  const dateAmounts    = scheduleConfig.dateAmounts ?? {};

  let prefillDateMap = {};
  try {
    const editRaw = sessionStorage.getItem("hc_schedule_edit");
    if (editRaw) prefillDateMap = JSON.parse(editRaw).prefillDateMap || {};
  } catch (_) {}

  const dates = buildDatesFromConfig({
    scheduleType,
    scheduleConfig,
    resolvedAmounts: data.resolvedScheduleAmounts,
    amountTier,
  });

  const rows = dates.map((row) => {
    const key = row.date.split("T")[0];
    const prefill = prefillDateMap[key];
    const out = {
      date: row.date.includes("T") ? row.date : `${row.date}T00:00:00.000Z`,
      amount: pickDateAmount({ resolved: data.resolvedScheduleAmounts, overrides: dateAmounts, key, fallback: amountTier }),
    };
    if (prefill && !prefill.removed) out.transactionId = prefill.transactionId;
    return out;
  });

  const tipPayload = customTipParsed !== null
    ? { platformTipAmount: tipAmount }
    : tipPct > 0
    ? { platformTipPercent: tipPct }
    : {};

  return {
    causeIds: data.causeIds ?? [],
    addons: {
      items: (data.addOnBreakdown ?? []).map((addon) => ({
        addOnId: addon.id,
        values:  addon.values ?? {},
      })),
    },
    payment: {
      paymentMode: "split",
      amount:      Math.round((data.perDateTotal ?? amountTier * (data.installmentCount ?? 1)) * 100) / 100,
      currency,
      ...tipPayload,
      scheduleType,
      scheduleConfig: { dates: rows },
    },
  };
}
