// Builds the `sessionStorage.campaignData` payload the donate steps read.
// Shared by DonationWidget (fresh donation) and CampaignConfigLoader (re-sync),
// so the two can never drift apart.
function normalizeSuggestedAmounts(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => (typeof x === "number" ? x : Number(x?.value ?? x)))
    .filter((n) => Number.isFinite(n) && n > 0);
}

// The same list carrying each amount's admin description, for the wizard's amount selector.
// `suggestedAmounts` stays a plain number array — other callers depend on that shape.
export function normalizeSuggestedData(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => (typeof x === "number"
      ? { value: x, description: "", isDefault: false }
      : {
          value:       Number(x?.value ?? x),
          description: String(x?.description ?? ""),
          isDefault:   Boolean(x?.isDefault),
        }))
    .filter((x) => Number.isFinite(x.value) && x.value > 0);
}

export function buildCampaignData(campaign, globalNote = []) {
  const c = campaign && typeof campaign === "object" ? campaign : {};
  const gd = c.goalsDates && typeof c.goalsDates === "object" ? c.goalsDates : {};

  return {
    id:                  c.id,
    name:                c.name               ?? "",
    description:         c.description        ?? "",
    zakatEligible:       c.zakatEligible      ?? false,
    suggestedAmounts:    normalizeSuggestedAmounts(c.suggestedAmounts),
    suggestedAmountsData: normalizeSuggestedData(c.suggestedAmounts),
    addOns:              c.addOns             ?? [],
    currenciesWithRates: c.currenciesWithRates ?? [],
    globalNote,
    goalsDates: {
      allowOneTimeDonations:   gd.allowOneTimeDonations   ?? true,
      allowRecurringDonations: gd.allowRecurringDonations ?? true,
      enableTipping:           gd.enableTipping           ?? false,
      minimumDonation:         gd.minimumDonation         ?? 0,
      maximumDonation:         gd.maximumDonation         ?? null,
      customNotes:             gd.customNotes             ?? [],
      recurringPresets:        gd.recurringPresets        ?? [],
      showGlobalNote:          gd.showGlobalNote          ?? false,
      paymentMethods:          gd.paymentMethods          ?? [],
      endAt:                   c.endAt                    ?? null,
    },
    causes: (Array.isArray(c.causes) ? c.causes : []).map((cause) => ({
      id:            cause.id,
      name:          cause.name          ?? "",
      description:   cause.description   ?? "",
      iconEmoji:     cause.iconEmoji     ?? "",
      zakatEligible: cause.zakatEligible ?? false,
    })),
  };
}
