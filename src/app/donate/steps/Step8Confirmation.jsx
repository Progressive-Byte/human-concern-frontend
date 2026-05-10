"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useDonation } from "@/context/DonationContext";
import StripeCheckoutForm from "../DonateComponents/StripeCheckoutForm";
import StepProgress from "../DonateComponents/StepProgress";
import DonationPreview from "../DonateComponents/DonationPreview";
import { NoticeIcon } from "@/components/common/SvgIcon";

const Step8Confirmation = () => {
  const { data } = useDonation();
  const router   = useRouter();

  // If payment was already completed, redirect back to thank-you so the
  // browser back button never lands here after a successful payment.
  useEffect(() => {
    if (sessionStorage.getItem("hc_donation_done") === "1") {
      router.replace("/donate/thank-you");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stripePromise = useMemo(
    () => data.stripePublishableKey ? loadStripe(data.stripePublishableKey) : null,
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

  const isStripe        = data.paymentMethod === "stripe";
  const isRecurring     = data.paymentType   === "recurring";
  const hasStripeSession = data.stripeClientSecret && data.stripePublishableKey;

  const renderPaymentBody = () => {
    if (isStripe && hasStripeSession) {
      return (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret: data.stripeClientSecret, appearance }}
        >
          <StripeCheckoutForm
            grandTotal={data.grandTotal}
            currency={data.currency}
            isRecurring={isRecurring}
            donationId={data.donationId}
            guestSessionId={data.guestSessionId}
          />
        </Elements>
      );
    }

    if (isStripe && !hasStripeSession) {
      // Session was lost (e.g. cleared manually). Guide user to restart.
      return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-[14px] text-[#737373]">
            Your payment session has expired. Please start the donation again.
          </p>
          <button
            onClick={() => router.push(data.campaign ? `/${data.campaign}/1` : "/donate/1")}
            className="px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333] text-white text-[14px] font-semibold transition-all cursor-pointer"
          >
            Start New Donation
          </button>
        </div>
      );
    }

    // Non-stripe gateway (PayPal etc.)
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-[14px] text-[#737373]">
          {data.paymentMethod
            ? `${data.paymentMethod} payment gateway coming soon`
            : "No payment method selected."}
        </p>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#F9F9F9] pt-[120px] lg:pt-[160px] pb-16 px-4">
      <div className="max-w-[1024px] mx-auto">
        <StepProgress current={6} />

        <div className="flex flex-col lg:flex-row items-start gap-5">
          <div className="bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-6 sm:p-8 flex-1 min-w-0 w-full">
            <h2 className="text-[24px] font-bold text-[#383838] mb-1">Complete Payment</h2>
            <p className="text-sm text-[#8C8C8C] font-normal mb-6">
              {isStripe
                ? "Enter your card details to finalise your donation"
                : `Complete your payment using ${data.paymentMethod}`}
            </p>

            {renderPaymentBody()}

            <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] px-4 py-3">
              {NoticeIcon}
              <span className="text-[12px] text-[#AEAEAE]">
                Your payment is secured with 256-bit SSL encryption
              </span>
            </div>
          </div>

          <DonationPreview currentStep={6} />
        </div>

        <p className="text-center text-[12px] text-[#AEAEAE] mt-4">
          Your information is secure and encrypted.
        </p>
      </div>
    </main>
  );
};

export default Step8Confirmation;
