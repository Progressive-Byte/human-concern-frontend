"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormEditorGuard } from "@/app/admin/forms/components/FormEditorGuardProvider";
import { getAdminAddOns } from "@/services/admin";
import PresetListEditor from "./PresetListEditor";
import PurposePicker from "./PurposePicker";
import SimpleFormControls from "./SimpleFormControls";

const MAX_LABEL_LENGTH = 80;
const MAX_FEE_PERCENT = 20;

function toRows(list) {
  const rows = Array.isArray(list) ? list : [];
  const source = rows.length > 0 ? rows : [{}];
  return source.map((row) => ({
    amount: row?.amount === 0 || row?.amount ? String(row.amount) : "",
    description: String(row?.description || ""),
  }));
}

function addOnIdentifier(addOn) {
  return String(addOn?.id || addOn?._id || "");
}

/* The price the add-on already carries. A formula add-on shows the base its inputs multiply. */
function addOnPriceLabel(addOn) {
  const pricing = addOn?.pricing || {};
  const base =
    pricing.type === "formula" ? pricing.baseUnitAmount ?? addOn?.amount ?? 0 : addOn?.amount ?? 0;
  const amount = Number(base);
  if (!Number.isFinite(amount)) return "";

  const money = `$${amount.toFixed(2)}`;
  return pricing.type === "formula" ? `${money} base` : money;
}

const SimpleFormEditor = ({ initial, busy, hasDraft, publishedAt, message, onSubmit, onPublish, onPreview, onDiscard }) => {
  const guard = useFormEditorGuard();

  const [displayName, setDisplayName] = useState("");
  const [feePercent, setFeePercent] = useState("");
  const [presets, setPresets] = useState(() => toRows([]));
  const [monthlyPresets, setMonthlyPresets] = useState(() => toRows([]));
  const [causeIds, setCauseIds] = useState([]);
  const [allowRecurring, setAllowRecurring] = useState(false);
  const [addonsEnabled, setAddonsEnabled] = useState(false);
  const [addOnIds, setAddOnIds] = useState([]);
  const [availableAddOns, setAvailableAddOns] = useState([]);
  const [addOnsLoading, setAddOnsLoading] = useState(true);
  const [addOnsError, setAddOnsError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState("");

  // `initial` is replaced after every save, publish and discard, so the fields always settle on
  // whatever the server actually stored.
  useEffect(() => {
    if (!initial) return;
    setDisplayName(String(initial.displayName || ""));
    setFeePercent(initial.feePercent === null || initial.feePercent === undefined ? "" : String(initial.feePercent));
    setPresets(toRows(initial.presets));
    setMonthlyPresets(toRows(initial.monthlyPresets));
    setCauseIds((Array.isArray(initial.causeIds) ? initial.causeIds : []).map((id) => String(id)));
    setAllowRecurring(initial.allowRecurringDonations === true);
    setAddonsEnabled(initial.addonsEnabled === true);
    setAddOnIds((Array.isArray(initial.addOnIds) ? initial.addOnIds : []).map((id) => String(id)));
    setIsDirty(false);
  }, [initial]);

  /* The picker lists the platform's own add-ons, so a price is never typed on a form. */
  useEffect(() => {
    let alive = true;
    setAddOnsLoading(true);
    setAddOnsError("");

    getAdminAddOns({ page: "1", limit: "200", order: "asc", status: "active", enabled: "true" })
      .then((res) => {
        if (!alive) return;
        const items = res?.data?.items || res?.data?.data?.items || res?.items || [];
        setAvailableAddOns(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (alive) setAddOnsError("Could not load the add-on list.");
      })
      .finally(() => {
        if (alive) setAddOnsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const buildPayload = useCallback(() => {
    const name = String(displayName || "").trim();
    if (name.length < 3) return null;

    const toAmounts = (list) =>
      list
        .map((row) => ({
          amount: Number(String(row?.amount ?? "").replace(/,/g, "").trim()),
          description: String(row?.description || "").trim(),
        }))
        .filter((row) => Number.isFinite(row.amount) && row.amount > 0);

    let parsedFee = null;
    const rawFee = String(feePercent).trim();
    if (rawFee !== "") {
      const value = Number(rawFee);
      parsedFee = Number.isFinite(value) ? value : null;
    }

    return {
      displayName: name,
      feePercent: parsedFee,
      presets: toAmounts(presets),
      monthlyPresets: toAmounts(monthlyPresets),
      causeIds,
      allowRecurringDonations: allowRecurring === true,
      addonsEnabled,
      addOnIds: addonsEnabled ? addOnIds : [],
    };
  }, [addOnIds, addonsEnabled, allowRecurring, causeIds, displayName, feePercent, monthlyPresets, presets]);

  function touch() {
    setIsDirty(true);
    guard?.markDirty?.();
  }

  // Lets the unsaved-changes dialog save the draft before letting the admin leave.
  useEffect(() => {
    if (!guard?.registerFlush) return undefined;

    guard.registerFlush(async () => {
      const payload = buildPayload();
      if (!payload) return { ok: false, error: "Form name needs at least 3 characters." };

      const result = await onSubmit?.(payload);
      if (result?.ok) {
        setIsDirty(false);
        guard.markClean?.();
      }
      return result?.ok ? { ok: true } : { ok: false, error: result?.error || "Could not save." };
    });

    return () => guard.clearFlush?.();
  }, [guard, buildPayload, onSubmit]);

  async function run(action) {
    const payload = buildPayload();
    if (!payload) {
      setError("Form name needs at least 3 characters.");
      return;
    }

    setError("");
    const result = await action?.(payload);
    if (result?.ok) {
      setIsDirty(false);
      guard?.markClean?.();
    }
  }

  /* The page saves and makes the link; this only hands it the values on screen. */
  async function preview() {
    const payload = buildPayload();
    if (!payload) {
      setError("Form name needs at least 3 characters.");
      return;
    }

    setError("");
    const result = await onPreview?.(payload);
    if (result?.ok) {
      setIsDirty(false);
      guard?.markClean?.();
    }
  }

  return (
    <div className="space-y-6">
      {/* Name and fee are short fields, so they share one row instead of two tall cards. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-5">
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Form Name</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            This is the heading donors see on the form.
          </p>

          <div className="mt-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
              <input
                value={displayName}
                maxLength={MAX_LABEL_LENGTH}
                disabled={busy}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  touch();
                }}
                placeholder="e.g. General Donation"
                className="w-full bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>
        </section>

        <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-5">
          <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Platform Fee</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            The percentage shown on the form&apos;s fee slider.
          </p>

          <div className="mt-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
              <input
                value={feePercent}
                inputMode="decimal"
                disabled={busy}
                onChange={(e) => {
                  setFeePercent(e.target.value);
                  touch();
                }}
                placeholder={`Percentage (0-${MAX_FEE_PERCENT}, optional)`}
                className="w-full bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>
        </section>
      </div>

      <PresetListEditor
        title="One-time Amounts"
        hint="The first amount is where the form starts. Add a short description to each one."
        presets={presets}
        onChange={setPresets}
        onDirty={touch}
        disabled={busy}
      />

      {/* Off hides the amounts: a form that takes no monthly gifts has nowhere to use them. */}
      <PresetListEditor
        title="Monthly Amounts"
        hint="Optional. These are used when a donor switches the form to monthly."
        amountPlaceholder="Amount / month"
        presets={monthlyPresets}
        onChange={setMonthlyPresets}
        onDirty={touch}
        disabled={busy}
        collapsed={!allowRecurring}
        toggle={
          <label className="flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827]">
            <input
              type="checkbox"
              checked={allowRecurring}
              disabled={busy}
              onChange={(e) => {
                setAllowRecurring(e.target.checked);
                touch();
              }}
              className="h-4 w-4"
              style={{ accentColor: "var(--admin-accent-600, #111827)" }}
            />
            <span className={allowRecurring ? "font-semibold" : "text-[#6B7280]"}>
              Allow monthly donations
            </span>
          </label>
        }
      />

      <PurposePicker selectedIds={causeIds} onChange={setCauseIds} onDirty={touch} disabled={busy} />

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Add-ons</h2>
            <p className="mt-1 max-w-[60ch] text-[13px] text-[#6B7280]">
              Optional extras shown beside the amount. Pick them from the platform&apos;s add-ons;
              their price and fund code stay there, so nothing is typed twice.
            </p>
          </div>

          <label className="flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-solid border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827]">
            <input
              type="checkbox"
              checked={addonsEnabled}
              disabled={busy}
              onChange={(e) => {
                setAddonsEnabled(e.target.checked);
                touch();
              }}
              className="h-4 w-4"
              style={{ accentColor: "var(--admin-accent-600, #111827)" }}
            />
            <span className={addonsEnabled ? "font-semibold" : "text-[#6B7280]"}>
              Enable add-ons
            </span>
          </label>
        </div>

        {addonsEnabled ? (
          <div className="mt-3 grid max-h-[260px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
            {addOnsLoading ? (
              <p className="text-[13px] text-[#6B7280]">Loading add-ons…</p>
            ) : addOnsError ? (
              <p className="text-[13px] text-[#B91C1C]">{addOnsError}</p>
            ) : availableAddOns.length === 0 ? (
              <p className="text-[13px] text-[#6B7280]">
                No active add-ons yet. Create one under Add-ons first.
              </p>
            ) : (
              availableAddOns.map((addOn) => {
                const id = addOnIdentifier(addOn);
                const checked = addOnIds.includes(id);

                return (
                  <label
                    key={id}
                    title={addOn.shortDescription || addOn.addonName}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${
                      checked ? "border-[#EA3335] bg-[#FFF5F5]" : "border-[#E5E7EB]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={busy}
                      onChange={() => {
                        setAddOnIds((prev) =>
                          prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
                        );
                        touch();
                      }}
                      className="h-4 w-4 shrink-0"
                      style={{ accentColor: "#EA3335" }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[13px] font-medium text-[#111827]">
                          {addOn.iconEmoji ? `${addOn.iconEmoji} ` : ""}
                          {addOn.addonName}
                        </span>
                        <span className="shrink-0 text-[12px] font-semibold text-[#6B7280]">
                          {addOnPriceLabel(addOn)}
                        </span>
                      </span>
                      {addOn.shortDescription ? (
                        <span className="block truncate text-[11px] text-[#6B7280]">
                          {addOn.shortDescription}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        ) : null}
      </section>

      {/* Bottom of the page, the same place the advanced form puts its actions. */}
      <div className="sticky bottom-0 z-10">
        <SimpleFormControls
          isBusy={busy}
          isDirty={isDirty}
          hasDraft={hasDraft}
          publishedAt={publishedAt}
          message={error || message?.text}
          messageTone={error ? "bad" : message?.tone}
          onSave={() => run(onSubmit)}
          onPublish={() => run(onPublish)}
          onPreview={() => preview()}
          onDiscard={onDiscard}
        />
      </div>
    </div>
  );
}

export default SimpleFormEditor;
