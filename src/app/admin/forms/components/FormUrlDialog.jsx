"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getAdminFormGoalsDates } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import { home } from "@/utils/constants";

/*
  Builds the public link for one complex donation form, with the parts an admin may want to pin.

  Every option maps to a query parameter the donate form already reads:
    open=1         no amount pre-selected; the selector opens so the donor must choose
    amount=50      that amount pre-selected
    paymentType=…  "one-time" or "recurring" pre-selected
    preset=<id>    one of this form's recurring presets, applied like a click

  Nothing here changes the form itself — only the link.
*/

function normalizeAmounts(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => (typeof x === "number"
      ? { value: x, description: "" }
      : { value: Number(x?.value ?? x), description: String(x?.description ?? "") }))
    .filter((x) => Number.isFinite(x.value) && x.value > 0);
}

function normalizePresets(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p) => p && p.enabled !== false && String(p.name || "").trim())
    .map((p) => ({ id: String(p.id ?? ""), name: String(p.name ?? "") }))
    .filter((p) => p.id);
}

const FormUrlDialog = ({ open, item, onClose }) => {
  const toast = useToast();
  const slug = String(item?.slug || "").trim();
  const formId = item?.id || item?.formId || item?._id;

  const [loading, setLoading] = useState(false);
  const [amounts, setAmounts] = useState([]);
  const [presets, setPresets] = useState([]);
  const [allowRecurring, setAllowRecurring] = useState(true);

  // "donor" = let the donor choose; "preset" = one of the form's amounts; "custom" = typed
  const [amountMode, setAmountMode] = useState("donor");
  const [presetAmount, setPresetAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentType, setPaymentType] = useState("one-time");
  const [presetId, setPresetId] = useState("");

  useEffect(() => {
    if (!open || !formId) return undefined;

    let alive = true;
    setLoading(true);

    (async () => {
      try {
        const res = await getAdminFormGoalsDates(formId, { cache: "no-store" });
        const body = res?.data?.data || res?.data || {};
        const goalsDates = body.goalsDates || body || {};
        if (!alive) return;

        const list = normalizeAmounts(goalsDates.suggestedAmounts);
        setAmounts(list);
        setPresets(normalizePresets(goalsDates.recurringPresets));
        setAllowRecurring(goalsDates.allowRecurringDonations !== false);
        setPresetAmount(list[0] ? String(list[0].value) : "");
      } catch {
        if (!alive) return;
        setAmounts([]);
        setPresets([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [open, formId]);

  // Nothing selected before the dialog opens; a fresh link always starts from the defaults.
  useEffect(() => {
    if (!open) return;
    setAmountMode("donor");
    setCustomAmount("");
    setPaymentType("one-time");
    setPresetId("");
  }, [open, formId]);

  const url = useMemo(() => {
    if (!slug) return "";
    const params = new URLSearchParams();

    if (amountMode === "donor") {
      params.set("open", "1");
    } else if (amountMode === "preset") {
      const value = Number(presetAmount);
      if (Number.isFinite(value) && value > 0) params.set("amount", String(value));
    } else if (amountMode === "custom") {
      const value = Number(customAmount);
      if (Number.isFinite(value) && value > 0) params.set("amount", String(value));
    }

    if (paymentType) params.set("paymentType", paymentType);
    if (paymentType === "recurring" && presetId) params.set("preset", presetId);

    const query = params.toString();
    return `${home}/${encodeURIComponent(slug)}/1${query ? `?${query}` : ""}`;
  }, [slug, amountMode, presetAmount, customAmount, paymentType, presetId]);

  async function copy() {
    if (!url) {
      toast.error("This form has no public link yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Form URL copied");
      onClose();
    } catch {
      window.prompt("Copy this form URL", url);
    }
  }

  if (!open || typeof document === "undefined") return null;

  const radio = (checked) =>
    `mt-0.5 h-4 w-4 shrink-0 ${checked ? "accent-[#DC2626]" : ""}`;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/40"
        aria-label="Close"
      />

      <div className="relative w-full max-w-[520px] rounded-2xl border border-solid border-[#E5E7EB] bg-white p-5 shadow-lg">
        <div className="text-[16px] font-semibold text-[#111827]">Copy Form URL</div>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          Choose what the shared link opens with. The donor can still change anything.
        </p>

        {loading ? (
          <p className="mt-4 text-[13px] text-[#6B7280]">Loading form options…</p>
        ) : (
          <>
            <div className="mt-4">
              <div className="text-[13px] font-semibold text-[#111827]">Amount</div>

              <label className="mt-2 flex cursor-pointer items-start gap-2 text-[13px] text-[#111827]">
                <input
                  type="radio"
                  name="amountMode"
                  className={radio(amountMode === "donor")}
                  checked={amountMode === "donor"}
                  onChange={() => setAmountMode("donor")}
                />
                <span>
                  Let the donor choose
                  <span className="block text-[11px] text-[#6B7280]">
                    No amount is selected. The donor picks one before continuing.
                  </span>
                </span>
              </label>

              {amounts.length > 0 && (
                <label className="mt-2 flex cursor-pointer items-start gap-2 text-[13px] text-[#111827]">
                  <input
                    type="radio"
                    name="amountMode"
                    className={radio(amountMode === "preset")}
                    checked={amountMode === "preset"}
                    onChange={() => setAmountMode("preset")}
                  />
                  <span className="flex-1">
                    Pre-select an amount
                    <select
                      value={presetAmount}
                      onChange={(e) => { setPresetAmount(e.target.value); setAmountMode("preset"); }}
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[13px] text-[#111827]"
                    >
                      {amounts.map((a) => (
                        <option key={a.value} value={a.value}>
                          {a.value}{a.description ? ` — ${a.description}` : ""}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>
              )}

              <label className="mt-2 flex cursor-pointer items-start gap-2 text-[13px] text-[#111827]">
                <input
                  type="radio"
                  name="amountMode"
                  className={radio(amountMode === "custom")}
                  checked={amountMode === "custom"}
                  onChange={() => setAmountMode("custom")}
                />
                <span className="flex-1">
                  Custom amount
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setAmountMode("custom"); }}
                    placeholder="Enter an amount"
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[13px] text-[#111827]"
                  />
                </span>
              </label>
            </div>

            <div className="mt-4">
              <div className="text-[13px] font-semibold text-[#111827]">Payment type</div>

              <label className="mt-2 flex cursor-pointer items-center gap-2 text-[13px] text-[#111827]">
                <input
                  type="radio"
                  name="paymentType"
                  className={radio(paymentType === "one-time")}
                  checked={paymentType === "one-time"}
                  onChange={() => setPaymentType("one-time")}
                />
                One-time
              </label>

              <label className={`mt-1.5 flex items-start gap-2 text-[13px] ${allowRecurring ? "cursor-pointer text-[#111827]" : "cursor-not-allowed text-[#9CA3AF]"}`}>
                <input
                  type="radio"
                  name="paymentType"
                  className={radio(paymentType === "recurring")}
                  checked={paymentType === "recurring"}
                  disabled={!allowRecurring}
                  onChange={() => setPaymentType("recurring")}
                />
                <span className="flex-1">
                  Recurring
                  {!allowRecurring && (
                    <span className="block text-[11px]">This form does not allow recurring gifts.</span>
                  )}
                  {allowRecurring && paymentType === "recurring" && presets.length > 0 && (
                    <select
                      value={presetId}
                      onChange={(e) => setPresetId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[13px] text-[#111827]"
                    >
                      <option value="">Donor picks the schedule</option>
                      {presets.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                </span>
              </label>
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Link</div>
              <input
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-2 font-mono text-[12px] text-[#111827]"
              />
            </div>
          </>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-solid border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={copy}
            disabled={loading || !url}
            className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy URL
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FormUrlDialog;
