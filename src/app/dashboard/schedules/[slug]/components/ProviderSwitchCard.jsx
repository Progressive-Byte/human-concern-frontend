"use client";

import { useEffect, useState } from "react";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/services/api";
import { postFinalizeSplit, startSchedulePaymentMethodSwitch } from "@/services/donationService";
import { Spinner } from "@/components/common/SvgIcon";

let stripePromise = null;
async function getStripe() {
  if (stripePromise) return stripePromise;
  const res = await apiRequest("payment/settings");
  const raw = res?.data?.gateways ?? res?.gateways ?? {};
  const gateway = Object.values(raw).find((g) => g?.provider === "stripe");
  const key = gateway?.publishableKey ?? null;
  if (!key) throw new Error("Stripe is not configured.");
  stripePromise = loadStripe(key);
  return stripePromise;
}

function alternateProvider(currentProvider) {
  const p = String(currentProvider || "").toLowerCase();
  if (p === "paypal") return "stripe";
  if (p === "stripe") return "paypal";
  return "stripe";
}

function StripeVaultForm({ clientSecret, authChallengeId, frontendReturnPayloadId, onDone, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    onError("");
    try {
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card },
      });
      if (result?.error) {
        onError(result.error.message || "Card could not be saved.");
        return;
      }
      // Finalize the vault_setup challenge so the backend switches the schedule.
      if (authChallengeId) {
        await postFinalizeSplit({
          authChallengeId,
          frontendReturnPayloadId: frontendReturnPayloadId || undefined,
          donorReturnParams: {},
        });
      }
      onDone();
    } catch (e) {
      onError(e?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-dashed border-[#E5E7EB] px-3.5 py-3">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={submitting || !stripe}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? Spinner : null}
        {submitting ? "Saving card…" : "Save card & continue"}
      </button>
      <p className="text-[11px] text-[#6B7280]">
        Your future scheduled donations will be charged to this card.
      </p>
    </div>
  );
}

export function ProviderSwitchCard({ scheduleId, currentProvider, onDone }) {
  const target = alternateProvider(currentProvider);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [stripeObj, setStripeObj] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (challenge?.interactionType !== "modal_client_secret" && !challenge?.clientSecret) return;
    let alive = true;
    (async () => {
      try {
        const s = await getStripe();
        if (alive) setStripeObj(s);
      } catch (e) {
        if (alive) setError(e?.message || "Stripe failed to load.");
      }
    })();
    return () => { alive = false; };
  }, [open, challenge]);

  const handleStart = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await startSchedulePaymentMethodSwitch(scheduleId, target);
      const payload = res?.data?.data ?? res?.data ?? res ?? {};
      if (payload?.redirectUrl) {
        window.location.href = String(payload.redirectUrl);
        return;
      }
      if (!payload?.clientSecret) {
        setError("We couldn't start the payment method update.");
        return;
      }
      setChallenge(payload);
      setOpen(true);
    } catch (e) {
      setError(e?.message || "Could not start the payment method update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <h2 className="text-base font-semibold text-[#111827]">Payment Method</h2>
      <p className="mt-1 text-sm text-[#6B7280]">
        {currentProvider
          ? `This schedule is charged via ${String(currentProvider)}.`
          : "Update the payment method used for this schedule."}
      </p>

      {error ? (
        <div className="mt-3 rounded-xl border border-dashed border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {!challenge ? (
        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? Spinner : null}
          {loading ? "Starting…" : `Switch to ${target}`}
        </button>
      ) : null}

      {challenge?.clientSecret && stripeObj ? (
        <Elements stripe={stripeObj}>
          <StripeVaultForm
            clientSecret={challenge.clientSecret}
            authChallengeId={challenge.authChallengeId}
            frontendReturnPayloadId={challenge.frontendReturnPayloadId}
            onDone={() => { setChallenge(null); setOpen(false); onDone?.(); }}
            onError={setError}
          />
        </Elements>
      ) : null}

      {loading || (challenge && !stripeObj) ? (
        <p className="mt-3 text-xs text-[#6B7280]">Preparing secure form…</p>
      ) : null}
    </div>
  );
}

export default ProviderSwitchCard;
