"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDonation } from "@/context/DonationContext";
import StepProgress from "../DonateComponents/StepProgress";
import { NoticeIcon } from "@/components/common/SvgIcon";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

function CheckoutForm({ grandTotal, currency }) {
  const stripe   = useStripe();
  const elements = useElements();
  const router   = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

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
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

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
        {loading ? "Processing…" : `Pay ${sym}${(grandTotal ?? 0).toFixed(2)}`}
      </button>
    </form>
  );
}

export default function Step8Confirmation() {
  const { data } = useDonation();
  const sym = CURRENCY_SYMBOLS[data.currency] ?? "$";

  const stripePromise = useMemo(
    () =>
      data.stripePublishableKey ? loadStripe(data.stripePublishableKey) : null,
    [data.stripePublishableKey]
  );

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#EA3335",
      colorBackground: "#ffffff",
      borderRadius: "12px",
      fontSizeBase: "14px",
    },
  };

  return (
    <main className="min-h-screen bg-[#F9F9F9] pt-[120px] lg:pt-[160px] pb-16 px-4">
      <div className="max-w-[700px] mx-auto">
        <StepProgress current={8} />

        <div className="bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-6 sm:p-8">
          <h2 className="text-[24px] font-bold text-[#383838] mb-1">Complete Payment</h2>
          <p className="text-sm text-[#8C8C8C] font-normal mb-6">
            Enter your card details to finalise your donation
          </p>

          {!data.stripeClientSecret || !data.stripePublishableKey ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-[14px] text-[#737373]">
                Payment session not found. Please go back and try again.
              </p>
              <Link
                href="/donate/7"
                className="text-[13px] text-[#EA3335] font-medium underline underline-offset-2"
              >
                Go back
              </Link>
            </div>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: data.stripeClientSecret, appearance }}
            >
              <CheckoutForm grandTotal={data.grandTotal} currency={data.currency} />
            </Elements>
          )}

          <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] px-4 py-3">
            {NoticeIcon}
            <span className="text-[12px] text-[#AEAEAE]">
              Your payment is secured with 256-bit SSL encryption
            </span>
          </div>

          <p className="text-center text-[12px] text-[#AEAEAE] mt-4">
            Step 8 of {data.isRamadan ? 8 : 7} — Your information is secure and encrypted.
          </p>
        </div>
      </div>
    </main>
  );
}
