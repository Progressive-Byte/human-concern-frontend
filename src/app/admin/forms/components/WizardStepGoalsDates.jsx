"use client";

import { useEffect, useMemo, useState } from "react";
import Toggle from "@/components/ui/Toggle";
import { getAdminFormGoalsDates, updateAdminFormGoalsDates } from "@/services/admin";
import { useToast } from "@/app/admin/campaigns/components/ToastProvider";
import FieldError from "./FieldError";
import WizardFooterNav from "./WizardFooterNav";

const CURRENCY_OPTIONS = [
  { code: "USD", label: "USD ($)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "CAD", label: "CAD (CA$)" },
];

function normalizeGoalsDatesResponse(res) {
  return res?.data?.data || res?.data?.item || res?.data?.goalsDates || res?.data || {};
}

function toDateInputValue(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  const t = Date.parse(s);
  if (Number.isNaN(t)) return "";
  const d = new Date(t);
  const yyyy = String(d.getUTCFullYear());
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseNumberOrEmpty(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const n = Number(raw);
  if (!Number.isFinite(n)) return "";
  return String(n);
}

function normalizeSuggestedAmounts(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean).join(",");
  }
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="h-6 w-1/3 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
        </div>
      </div>

      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="h-5 w-1/4 animate-pulse rounded-lg bg-[#F3F4F6]" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6]" />
          <div className="h-10 animate-pulse rounded-xl bg-[#F3F4F6] md:col-span-2" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-16 animate-pulse rounded-2xl bg-[#F3F4F6]" />
          <div className="h-16 animate-pulse rounded-2xl bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  );
}

export default function WizardStepGoalsDates({ campaignId, formId, onExit }) {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [currency, setCurrency] = useState("USD");
  const [goalAmount, setGoalAmount] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const [minimumDonation, setMinimumDonation] = useState("");
  const [maximumDonation, setMaximumDonation] = useState("");
  const [suggestedAmounts, setSuggestedAmounts] = useState("");

  const [allowRecurringDonations, setAllowRecurringDonations] = useState(false);
  const [enableTipping, setEnableTipping] = useState(false);

  const currencyOptions = useMemo(() => CURRENCY_OPTIONS, []);

  useEffect(() => {
    if (!formId) {
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setTopError("");
    (async () => {
      try {
        const res = await getAdminFormGoalsDates(formId);
        if (!alive) return;
        const d = normalizeGoalsDatesResponse(res);

        setCurrency(String(d?.currency || "USD").trim() || "USD");
        setGoalAmount(parseNumberOrEmpty(d?.goalAmount));
        setStartAt(toDateInputValue(d?.startAt));
        setEndAt(toDateInputValue(d?.endAt));

        setMinimumDonation(parseNumberOrEmpty(d?.minimumDonation));
        setMaximumDonation(parseNumberOrEmpty(d?.maximumDonation));
        setSuggestedAmounts(normalizeSuggestedAmounts(d?.suggestedAmounts));

        setAllowRecurringDonations(Boolean(d?.allowRecurringDonations));
        setEnableTipping(Boolean(d?.enableTipping));
      } catch (e) {
        if (!alive) return;
        setTopError(e?.message || "Failed to load goals & dates.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [formId]);

  function validate() {
    const errors = {};

    const nextCurrency = String(currency || "").trim();
    const nextStartAt = String(startAt || "").trim();
    const nextEndAt = String(endAt || "").trim();

    const goal = String(goalAmount ?? "").trim();
    const min = String(minimumDonation ?? "").trim();
    const max = String(maximumDonation ?? "").trim();
    const sugg = String(suggestedAmounts ?? "").trim();

    if (!nextCurrency) errors.currency = "Required";
    else if (nextCurrency.length < 3) errors.currency = "Min 3 characters";
    else if (nextCurrency.length > 10) errors.currency = "Max 10 characters";

    if (!nextStartAt) errors.startAt = "Required";
    else if (Number.isNaN(Date.parse(nextStartAt))) errors.startAt = "Invalid date";

    if (nextEndAt) {
      if (Number.isNaN(Date.parse(nextEndAt))) errors.endAt = "Invalid date";
      else if (!errors.startAt) {
        const s = new Date(Date.parse(nextStartAt));
        const e = new Date(Date.parse(nextEndAt));
        if (!(s.getTime() < e.getTime())) errors.endAt = "End date must be after start date";
      }
    }

    function validatePositiveNumber(fieldKey, raw) {
      if (!raw) return null;
      const n = Number(raw);
      if (!Number.isFinite(n)) {
        errors[fieldKey] = "Must be a number";
        return null;
      }
      if (!(n > 0)) {
        errors[fieldKey] = "Must be greater than 0";
        return null;
      }
      return n;
    }

    const goalN = validatePositiveNumber("goalAmount", goal);
    const minN = validatePositiveNumber("minimumDonation", min);
    const maxN = validatePositiveNumber("maximumDonation", max);

    if (minN !== null && maxN !== null && minN > maxN) {
      errors.maximumDonation = "Maximum must be greater than or equal to minimum";
    }

    const payload = {
      currency: nextCurrency,
      startAt: nextStartAt,
      endAt: nextEndAt ? nextEndAt : null,
      goalAmount: goalN === null ? undefined : goalN,
      minimumDonation: minN === null ? undefined : minN,
      maximumDonation: maxN === null ? undefined : maxN,
      suggestedAmounts: sugg ? sugg : undefined,
      allowRecurringDonations: Boolean(allowRecurringDonations),
      enableTipping: Boolean(enableTipping),
    };

    return { errors, payload };
  }

  async function save({ goNext } = { goNext: false }) {
    setTopError("");
    setFieldErrors({});

    if (!campaignId) {
      toast.error("Missing campaignId");
      return { ok: false };
    }
    if (!formId) {
      toast.error("Complete Basics first");
      return { ok: false };
    }

    const { errors, payload } = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error("Fix the highlighted fields");
      return { ok: false };
    }

    setSaving(true);
    try {
      await updateAdminFormGoalsDates(formId, payload);
      toast.success("Goals & dates saved");

      if (goNext) {
        onExit?.({ nextStep: "causes" });
      }
      return { ok: true };
    } catch (e) {
      const msg = e?.message || "Failed to save goals & dates.";
      setTopError(String(msg).includes("FORM_NOT_EDITABLE") ? "Form can’t be edited (not draft)." : msg);
      toast.error(msg);
      return { ok: false };
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton />;

  if (!formId) {
    return (
      <div className="hc-animate-fade-up rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 p-5 text-sm text-red-600">
        Missing formId. Please complete Basics first to create the draft form.
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onExit?.({ nextStep: "basics" })}
            className="cursor-pointer rounded-xl border border-dashed border-[#E5E7EB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            Back to Basics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {topError ? (
        <div className="hc-animate-fade-up rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {topError}
        </div>
      ) : null}

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="mb-4">
          <h2 className="text-[16px] font-semibold text-[#111827]">Fundraising Goals & Timeline</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Set the target amount and campaign duration</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Currency <span className="text-red-600">*</span>
            </div>
            <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={saving}
                className="w-full bg-transparent text-[13px] text-[#111827] outline-none"
              >
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <FieldError message={fieldErrors.currency} />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Fundraising Goal (Optional)</div>
            <input
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="5000"
              inputMode="decimal"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <FieldError message={fieldErrors.goalAmount} />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">
              Start Date <span className="text-red-600">*</span>
            </div>
            <input
              type="date"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <FieldError message={fieldErrors.startAt} />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">End Date (Optional)</div>
            <input
              type="date"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <FieldError message={fieldErrors.endAt} />
          </div>
        </div>
      </section>

      <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
        <div className="text-[14px] font-semibold text-[#111827]">Donation Settings</div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Minimum Donation</div>
            <input
              value={minimumDonation}
              onChange={(e) => setMinimumDonation(e.target.value)}
              placeholder="5"
              inputMode="decimal"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <FieldError message={fieldErrors.minimumDonation} />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Maximum Donation</div>
            <input
              value={maximumDonation}
              onChange={(e) => setMaximumDonation(e.target.value)}
              placeholder="100"
              inputMode="decimal"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <FieldError message={fieldErrors.maximumDonation} />
          </div>

          <div className="md:col-span-2">
            <div className="mb-2 text-[13px] font-semibold text-[#111827]">Suggested Amounts (comma-separated)</div>
            <input
              value={suggestedAmounts}
              onChange={(e) => setSuggestedAmounts(e.target.value)}
              placeholder="25,50,100,250"
              className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2.5 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
              disabled={saving}
            />
            <div className="mt-1 text-[12px] text-[#6B7280]">Example: 25,50,100,250</div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Allow Recurring Donations</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Let donors set up weekly, monthly, or custom schedules</div>
              </div>
              <Toggle enabled={allowRecurringDonations} onChange={setAllowRecurringDonations} />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">Enable Tipping</div>
                <div className="mt-1 text-[12px] text-[#6B7280]">Allow donors to add a platform tip</div>
              </div>
              <Toggle enabled={enableTipping} onChange={setEnableTipping} />
            </div>
          </div>
        </div>
      </section>

      <WizardFooterNav
        saving={saving}
        onBack={() => onExit?.({ nextStep: "basics" })}
        onSave={() => save({ goNext: false })}
        onNext={() => save({ goNext: true })}
        nextLabel="Next"
      />
    </div>
  );
}

