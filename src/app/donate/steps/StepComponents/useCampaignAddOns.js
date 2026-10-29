"use client";

import { useEffect, useMemo, useState } from "react";
import { useDonation } from "@/context/DonationContext";

function calcAddOnTotal(addOn, inputValues) {
  const { pricing, amount } = addOn;
  if (!pricing || pricing.type === "fixed") return amount ?? 0;
  if (pricing.type === "formula") {
    const base = pricing.baseUnitAmount ?? amount ?? 0;
    return (pricing.inputs ?? []).reduce(
      (acc, inp) => acc * (inputValues[inp.key] ?? inp.defaultValue ?? 1),
      base
    );
  }
  return amount ?? 0;
}

// Add-ons live on Step 1 now. The chosen add-ons and their input values are kept in
// the shared context so Step 3 can build the submit payload and the summary.
export function useCampaignAddOns() {
  const { data, update } = useDonation();

  const campaignAddOns = useMemo(() => {
    try {
      const meta = JSON.parse(sessionStorage.getItem("campaignData") || "{}");
      return meta.addOns ?? [];
    } catch {
      return [];
    }
  }, []);

  const [addOnEnabled, setAddOnEnabled] = useState(() => {
    const breakdown = data.addOnBreakdown;
    if (!breakdown) return Object.fromEntries(campaignAddOns.map((a) => [a.id, false]));
    const enabledIds = new Set(breakdown.map((a) => a.id));
    return Object.fromEntries(campaignAddOns.map((a) => [a.id, enabledIds.has(a.id)]));
  });

  const [addOnInputs, setAddOnInputs] = useState(() => {
    const breakdown   = data.addOnBreakdown;
    const savedValues = breakdown
      ? Object.fromEntries(breakdown.map((a) => [a.id, a.values ?? a.inputValues ?? {}]))
      : {};
    return Object.fromEntries(
      campaignAddOns.map((a) => {
        const defaults = Object.fromEntries(
          (a.pricing?.inputs ?? []).map((inp) => [inp.key, inp.defaultValue ?? 1])
        );
        return [a.id, { ...defaults, ...(savedValues[a.id] || {}) }];
      })
    );
  });

  const computedBreakdown = useMemo(() =>
    campaignAddOns
      .filter((a) => addOnEnabled[a.id])
      .map((a) => ({
        id:        a.id,
        name:      a.name,
        iconEmoji: a.iconEmoji ?? "",
        total:     calcAddOnTotal(a, addOnInputs[a.id] ?? {}),
        values:    addOnInputs[a.id] ?? {},
      })),
    [campaignAddOns, addOnEnabled, addOnInputs]
  );

  const addOnsTotal = useMemo(() =>
    computedBreakdown.reduce((sum, a) => sum + a.total, 0),
    [computedBreakdown]
  );

  const updateAddOnInput = (addOnId, key, val) =>
    setAddOnInputs((prev) => ({ ...prev, [addOnId]: { ...prev[addOnId], [key]: val } }));

  useEffect(() => {
    update({ addOnsTotal, addOnBreakdown: computedBreakdown });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addOnsTotal, computedBreakdown]);

  return {
    campaignAddOns,
    addOnEnabled,
    setAddOnEnabled,
    addOnInputs,
    updateAddOnInput,
    computedBreakdown,
    addOnsTotal,
  };
}
