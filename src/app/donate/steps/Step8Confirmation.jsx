"use client";

import { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useDonation } from "@/context/DonationContext";
import StripeCheckoutForm from "../DonateComponents/StripeCheckoutForm";
import StepProgress from "../DonateComponents/StepProgress";
import { NoticeIcon } from "@/components/common/SvgIcon";

const Step8Confirmation = () => {
  const { data } = useDonation();

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

  const isStripe = data.paymentMethod === "stripe";
  const hasStripeSession = data.stripeClientSecret && data.stripePublishableKey;

  return (
    <main className="min-h-screen bg-[#F9F9F9] pt-[120px] lg:pt-[160px] pb-16 px-4">
      <div className="max-w-[700px] mx-auto">
        <StepProgress current={8} />

        <div className="bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-6 sm:p-8">
          <h2 className="text-[24px] font-bold text-[#383838] mb-1">Complete Payment</h2>
          <p className="text-sm text-[#8C8C8C] font-normal mb-6">
            {isStripe
              ? "Enter your card details to finalise your donation"
              : `Complete your payment using ${data.paymentMethod}`}
          </p>

          {isStripe && hasStripeSession ? (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret: data.stripeClientSecret, appearance }}
            >
              <StripeCheckoutForm grandTotal={data.grandTotal} currency={data.currency} />
            </Elements>
          ) : isStripe ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-[14px] text-[#737373]">
                Payment session not found. Please go back and try again.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-[14px] text-[#737373]">
                {data.paymentMethod
                  ? `${data.paymentMethod} payment gateway coming soon`
                  : "No payment method selected."}
              </p>
            </div>
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
};

export default Step8Confirmation;
