"use client";

import { useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/services/api";
import { createUserPaymentMethodSetupIntent, finalizeUserPaymentMethod, getUserPaymentMethods } from "@/services/user";

function ModalShell({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close modal overlay" />
      <div className="hc-animate-dropdown relative w-full max-w-[640px] rounded-2xl border border-dashed border-[#E5E7EB] bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] px-5 py-4">
          <div className="text-[15px] font-semibold text-[#111827]">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, disabled, variant = "light" }) {
  const cls =
    variant === "dark"
      ? "bg-[#111827] text-white hover:bg-[#111827]/90"
      : variant === "danger"
        ? "bg-white text-[#111827] hover:bg-red-500/10 hover:text-red-700"
        : "bg-white text-[#111827] hover:bg-[#F9FAFB]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-[13px] font-semibold transition disabled:opacity-60 ${cls}`}
    >
      {children}
    </button>
  );
}

function ToggleSwitch({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(enabled)}
      disabled={disabled}
      onClick={() => onChange?.(!enabled)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-60 ${
        enabled ? "bg-[#111827]" : "bg-[#D1D5DB]"
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function normalizePaymentSettings(res) {
  const data = res?.data?.data || res?.data || {};
  const gateways = Array.isArray(data?.gateways)
    ? data.gateways
    : data?.gateways && typeof data.gateways === "object"
      ? Object.values(data.gateways)
      : [];
  const stripe = gateways.find((g) => String(g?.provider || "").toLowerCase() === "stripe");
  const publishableKey = stripe?.publishableKey ?? stripe?.apiKey ?? stripe?.publicKey ?? null;
  return publishableKey ? String(publishableKey) : null;
}

function AddCardForm({ clientSecret, configurationId, setDefault, onChangeSetDefault, onCancel, onSaved }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!stripe || !elements || busy) return;
    setBusy(true);
    setError("");
    try {
      const returnUrl = `${window.location.origin}/dashboard/payment-methods`;
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });

      if (result?.error) {
        throw new Error(result.error.message || "Stripe setup failed.");
      }

      const setupIntentId = result?.setupIntent?.id;
      if (!setupIntentId) throw new Error("Missing setup intent id.");

      await finalizeUserPaymentMethod({ setupIntentId, configurationId, setDefault });
      onSaved?.();
    } catch (e) {
      setError(e?.message || "Failed to add card.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-[#111827]">Set as default</div>
          <div className="mt-1 text-[12px] text-[#6B7280]">Use this payment method by default for future payments</div>
        </div>
        <ToggleSwitch enabled={setDefault} disabled={busy} onChange={onChangeSetDefault} />
      </div>

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      <div className="flex items-center justify-end gap-2">
        <ActionButton onClick={onCancel} disabled={busy} variant="light">
          Cancel
        </ActionButton>
        <ActionButton onClick={handleSubmit} disabled={!stripe || !elements || busy || !clientSecret} variant="dark">
          Add Card
        </ActionButton>
      </div>
    </div>
  );
}

export default function AddCardModal({ open, onClose, onAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [configurationId, setConfigurationId] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [setDefault, setSetDefault] = useState(true);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      setClientSecret("");
      setConfigurationId("");
      setPublishableKey("");
      try {
        const listRes = await getUserPaymentMethods();
        const items = listRes?.data?.items || listRes?.data?.data?.items || [];
        const hasDefault = Array.isArray(items) ? items.some((it) => Boolean(it?.isDefault)) : false;
        if (alive) setSetDefault(!hasDefault);

        const [settingsRes, setupRes] = await Promise.all([apiRequest("payment/settings"), createUserPaymentMethodSetupIntent({ setDefault: false })]);
        if (!alive) return;

        const key = normalizePaymentSettings(settingsRes);
        if (!key) throw new Error("Stripe is not configured.");
        const secret = setupRes?.data?.clientSecret || setupRes?.data?.data?.clientSecret || null;
        const nextConfigurationId = setupRes?.data?.configurationId || setupRes?.data?.data?.configurationId || null;
        if (!secret) throw new Error("Missing setup intent client secret.");
        if (!nextConfigurationId) throw new Error("Missing saved cards configuration.");

        setPublishableKey(String(key));
        setClientSecret(String(secret));
        setConfigurationId(String(nextConfigurationId));
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to start card setup.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open]);

  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);
  const appearance = useMemo(() => ({ theme: "stripe" }), []);

  return (
    <ModalShell open={open} title="Add Payment Method" onClose={onClose}>
      {loading ? <div className="text-[13px] text-[#6B7280]">Loading...</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div> : null}

      {!loading && !error && stripePromise && clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <AddCardForm
            clientSecret={clientSecret}
            configurationId={configurationId}
            setDefault={setDefault}
            onChangeSetDefault={setSetDefault}
            onCancel={onClose}
            onSaved={() => {
              onAdded?.();
              onClose?.();
            }}
          />
        </Elements>
      ) : null}
    </ModalShell>
  );
}
