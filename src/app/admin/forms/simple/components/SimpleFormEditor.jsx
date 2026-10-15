"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormEditorGuard } from "@/app/admin/forms/components/FormEditorGuardProvider";
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

const SimpleFormEditor = ({ initial, busy, hasDraft, publishedAt, message, onSubmit, onPublish, onDiscard }) => {
  const guard = useFormEditorGuard();

  const [displayName, setDisplayName] = useState("");
  const [feePercent, setFeePercent] = useState("");
  const [presets, setPresets] = useState(() => toRows([]));
  const [monthlyPresets, setMonthlyPresets] = useState(() => toRows([]));
  const [causeIds, setCauseIds] = useState([]);
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
    setIsDirty(false);
  }, [initial]);

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
    };
  }, [causeIds, displayName, feePercent, monthlyPresets, presets]);

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

  return (
    <div className="space-y-6">
      <SimpleFormControls
        isBusy={busy}
        isDirty={isDirty}
        hasDraft={hasDraft}
        publishedAt={publishedAt}
        message={error || message?.text}
        messageTone={error ? "bad" : message?.tone}
        onSave={() => run(onSubmit)}
        onPublish={() => run(onPublish)}
        onDiscard={onDiscard}
      />

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <h2 className="text-[18px] font-semibold leading-tight text-[#111827]">Form Name</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">This is the heading donors see on the form.</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
            <input
              value={feePercent}
              inputMode="decimal"
              disabled={busy}
              onChange={(e) => {
                setFeePercent(e.target.value);
                touch();
              }}
              placeholder={`Default percentage (0-${MAX_FEE_PERCENT}, optional)`}
              className="w-full bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>

        </div>

        <p className="mt-3 text-[12px] text-[#6B7280]">
          This is the one design the site draws. The monthly amounts and the purposes show when you
          fill them in, and the fee slider shows unless you leave Default percentage empty.
        </p>
      </section>

      <PresetListEditor
        title="One-time Amounts"
        hint="The first amount is where the form starts. Add a short description to each one."
        presets={presets}
        onChange={setPresets}
        onDirty={touch}
        disabled={busy}
      />

      <PresetListEditor
        title="Monthly Amounts"
        hint="Optional. These are used when a donor switches the form to monthly."
        amountPlaceholder="Amount / month"
        presets={monthlyPresets}
        onChange={setMonthlyPresets}
        onDirty={touch}
        disabled={busy}
      />

      <PurposePicker selectedIds={causeIds} onChange={setCauseIds} onDirty={touch} disabled={busy} />
    </div>
  );
}

export default SimpleFormEditor;
