"use client";

import { useCallback, useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { apiRequest } from "@/services/api";
import UnifiedChallengeDispatcher, {
  loadUnifiedChallengeFromSession,
  clearUnifiedChallengeSession,
} from "@/components/payment/UnifiedChallengeDispatcher";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

function readSessionChallengeIds() {
  try {
    const challenge = loadUnifiedChallengeFromSession();
    return {
      authChallengeId: challenge?.authChallengeId ?? sessionStorage.getItem("hc_auth_challenge_id") ?? null,
      frontendReturnPayloadId:
        challenge?.frontendReturnPayloadId ??
        sessionStorage.getItem("hc_frontend_return_payload_id") ??
        null,
    };
  } catch {
    return { authChallengeId: null, frontendReturnPayloadId: null };
  }
}

const StripeCheckoutForm = ({ grandTotal, firstPaymentAmount, firstPaymentDate, currency, isRecurring }) => {
  const stripe   = useStripe();
  const elements = useElements();
  const router   = useRouter();
  const { data, update } = useDonation();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [challengeExpired, setChallengeExpired] = useState(false);

  const sym = CURRENCY_SYMBOLS[currency] ?? "$";

  const finalizeSplitDonation = useCallback(async ({
    setupIntentId,
    authChallengeId,
    frontendReturnPayloadId,
    idempotencyKey,
  }) => {
    const body = {
      setupIntentId,
      paymentProvider: data.payment?.provider ?? data.paymentMethod ?? "stripe",
      ...(data.donationId && { donationId: data.donationId }),
      ...(data.pendingSessionId && { pendingSessionId: data.pendingSessionId }),
      ...(authChallengeId && { authChallengeId }),
      ...(frontendReturnPayloadId && { frontendReturnPayloadId }),
    };
    const opts = { method: "POST", body: JSON.stringify(body) };
    if (idempotencyKey) opts.idempotencyKey = idempotencyKey;

    try {
      const res = await apiRequest("donations/finalize", opts);
      const finalizedId = res?.data?.donationId ?? res?.donationId ?? data.donationId ?? null;
      if (finalizedId) update({ finalizedDonationId: finalizedId });
      return res;
    } catch (err) {
      const status = Number(err?.statusCode ?? 0);
      if (status === 404 || status === 405 || status === 400) {
        return { legacyFallback: true, err };
      }
      throw err;
    }
  }, [data.donationId, data.pendingSessionId, data.payment, data.paymentMethod, update]);

  const finalizeOneTimeDonation = useCallback(async ({
    paymentIntentId,
    authChallengeId,
    frontendReturnPayloadId,
    idempotencyKey,
  }) => {
    const body = {
      paymentMode: "one_time",
      ...(paymentIntentId && { paymentIntentId }),
      paymentProvider: data.payment?.provider ?? data.paymentMethod ?? "stripe",
      ...(data.donationId && { donationId: data.donationId }),
      ...(data.pendingSessionId && { pendingSessionId: data.pendingSessionId }),
      ...(authChallengeId && { authChallengeId }),
      ...(frontendReturnPayloadId && { frontendReturnPayloadId }),
    };
    const opts = { method: "POST", body: JSON.stringify(body) };
    if (idempotencyKey) opts.idempotencyKey = idempotencyKey;

    try {
      const res = await apiRequest("donations/finalize-onetime", opts);
      const finalizedId = res?.data?.donationId ?? res?.donationId ?? data.donationId ?? null;
      if (finalizedId) update({ finalizedDonationId: finalizedId });
      return res;
    } catch (err) {
      const status = Number(err?.statusCode ?? 0);
      if (status === 404 || status === 405) {
        try {
          const fallbackOpts = { method: "POST", body: JSON.stringify(body) };
          if (idempotencyKey) fallbackOpts.idempotencyKey = idempotencyKey;
          const fallback = await apiRequest("donations/finalize", fallbackOpts);
          return { legacyFallback: true, fallback };
        } catch (fallbackErr) {
          const fs2 = Number(fallbackErr?.statusCode ?? 0);
          if (fs2 === 404 || fs2 === 405 || fs2 === 400) {
            return { legacyFallback: true, err: fallbackErr };
          }
          throw fallbackErr;
        }
      }
      if (status === 400) {
        return { legacyFallback: true, err };
      }
      throw err;
    }
  }, [data.donationId, data.pendingSessionId, data.payment, data.paymentMethod, update]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    const challengeIds = readSessionChallengeIds();
    const idempotencyKey = data.idempotencyKey ?? "";

    if (isRecurring) {
      const { error: setupError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donate/thank-you`,
        },
        redirect: "if_required",
      });

      if (setupError) {
        setError(setupError.message);
        setLoading(false);
        return;
      }

      if (setupIntent?.status === "succeeded") {
        update({ setupIntentId: setupIntent.id ?? null });
        try {
          await finalizeSplitDonation({
            setupIntentId: setupIntent.id,
            authChallengeId: challengeIds.authChallengeId,
            frontendReturnPayloadId: challengeIds.frontendReturnPayloadId,
            idempotencyKey,
          });
        } catch (finalizeErr) {
          console.warn("Finalize call failed, continuing to thank-you screen:", finalizeErr);
        } finally {
          clearUnifiedChallengeSession();
        }
        sessionStorage.setItem("hc_donation_done", "1");
        router.push("/donate/thank-you");
      }
    } else {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donate/thank-you`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        try {
          await finalizeOneTimeDonation({
            paymentIntentId: paymentIntent.id,
            authChallengeId: challengeIds.authChallengeId,
            frontendReturnPayloadId: challengeIds.frontendReturnPayloadId,
            idempotencyKey,
          });
        } catch (finalizeErr) {
          console.warn("Finalize call failed, continuing to thank-you screen:", finalizeErr);
        } finally {
          clearUnifiedChallengeSession();
        }
        sessionStorage.setItem("hc_donation_done", "1");
        router.push("/donate/thank-you");
      }
    }
  };

  const handleChallengeDispatch = useCallback(() => {}, []);

  const handleChallengeExpire = useCallback(() => {
    setChallengeExpired(true);
    setError("Your security verification session has timed out. Please go back and re-submit your donation.");
    clearUnifiedChallengeSession();
  }, []);

  return (
    <UnifiedChallengeDispatcher
      challenge={data.unifiedChallenge ?? null}
      provider="stripe"
      onDispatch={handleChallengeDispatch}
      onExpire={handleChallengeExpire}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <PaymentElement options={{ layout: "tabs" }} />

        {challengeExpired && (
          <p className="text-[13px] text-[#B45309] bg-[#FFF8E1] border border-[#FFE082] rounded-xl px-4 py-3">
            Your verification window expired. No charge was made — please return to the previous step and try again.
          </p>
        )}

        {error && (
          <p className="text-[13px] text-[#EA3335] bg-[#FFF5F5] border border-[#FFCCCC] rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!stripe || loading || challengeExpired}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] active:scale-95 text-white text-[15px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{isRecurring ? "Setting up…" : "Processing…"}</span>
            </>
          ) : isRecurring ? (
            firstPaymentAmount != null
              ? `Authorise split payments — first payment ${sym}${Number(firstPaymentAmount).toFixed(2)}${firstPaymentDate ? ` on ${firstPaymentDate}` : ""}`
              : `Authorise Split Payments (${sym}${(grandTotal ?? 0).toFixed(2)})`
          ) : (
            `Pay ${sym}${(grandTotal ?? 0).toFixed(2)}`
          )}
        </button>
      </form>
    </UnifiedChallengeDispatcher>
  );
};
export default StripeCheckoutForm;
