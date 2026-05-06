"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

export default function StripeCheckoutForm({ grandTotal, currency, isRecurring, donationId, guestSessionId }) {
  const stripe   = useStripe();
  const elements = useElements();
  const router   = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const sym = CURRENCY_SYMBOLS[currency] ?? "$";

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
        try {
          await apiRequest("payment/setup-intent/confirm", {
            method: "POST",
            body: JSON.stringify({
              donationId,
              setupIntentId: setupIntent.id,
              paymentMethodId: setupIntent.payment_method,
            }),
            headers: guestSessionId
              ? { "x-guest-session-id": String(guestSessionId) }
              : {},
          });
        } catch (err) {
          setError(err.message ?? "Failed to confirm setup. Please contact support.");
          setLoading(false);
          return;
        }

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
      } else if (paymentIntent?.status === "succeeded") {
        router.push("/donate/thank-you");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <PaymentElement options={{ layout: "tabs" }} />

      {error && (
        <p className="text-[13px] text-[#EA3335] bg-[#FFF5F5] border border-[#FFCCCC] rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] active:scale-95 text-white text-[15px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading
          ? (isRecurring ? "Setting up…" : "Processing…")
          : (isRecurring
            ? `Authorise Split Payments (${sym}${(grandTotal ?? 0).toFixed(2)})`
            : `Pay ${sym}${(grandTotal ?? 0).toFixed(2)}`)}
      </button>
    </form>
  );
}
