"use client";

import { useMemo, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useDonation } from "@/context/DonationContext";
import { useBranding } from "@/context/BrandingContext";
import StripeCheckoutForm from "./StepComponents/Step4components/StripeCheckoutForm";
import StepProgress from "./StepComponents/StepProgress";
import DonationPreview from "./StepComponents/DonationPreview";
import { NoticeIcon } from "@/components/common/SvgIcon";

const Step4Confirmation = () => {
  const { data }          = useDonation();
  const { primaryColor }  = useBranding();
  const pathname          = usePathname();
  const router            = useRouter();
  const [ready, setReady] = useState(false);
  const isPreview = pathname.startsWith("/admin/forms/preview");

  useEffect(() => {
    if (isPreview) {
      setReady(true);
      return;
    }
    // If payment was already completed, send back to thank-you.
    if (sessionStorage.getItem("hc_donation_done") === "1") {
      router.replace("/donate/thank-you");
      return;
    }

    // No valid payment session — redirect to campaigns listing.
    if (!data.stripeClientSecret) {
      router.replace("/campaigns");
      return;
    }

    // Session is valid — allow rendering.
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stripePromise = useMemo(
    () => (isPreview ? null : (data.stripePublishableKey ? loadStripe(data.stripePublishableKey) : null)),
    [data.stripePublishableKey, isPreview]
  );

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: primaryColor,
      colorBackground: "#ffffff",
      borderRadius: "12px",
      fontSizeBase: "14px",
    },
  };

  const isStripe    = data.paymentMethod === "stripe";
  const isRecurring = data.paymentType   === "recurring";

  // Suppress any flash while the redirect is in flight.
  if (!ready) return null;

  return (
    <main className="min-h-screen bg-[#F9F9F9] pt-30 lg:pt-40 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <StepProgress current={4} />

        <div className="flex flex-col lg:flex-row items-start gap-5">
          <div className="bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-6 sm:p-8 flex-1 min-w-0 w-full">
            <h2 className="text-[24px] font-bold text-[#383838] mb-1">{isPreview ? "Preview Confirmation" : "Complete Payment"}</h2>
            <p className="text-sm text-[#8C8C8C] font-normal mb-6">
              {isPreview
                ? "Preview mode: no payment will be processed."
                : isStripe
                  ? "Enter your card details to finalise your donation"
                  : `Complete your payment using ${data.paymentMethod}`}
            </p>

            {isPreview ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-dashed border-[#EBEBEB] bg-[#F9F9F9] px-4 py-4">
                  <div className="text-[14px] font-semibold text-[#383838]">Payment disabled</div>
                  <div className="mt-1 text-[13px] text-[#737373]">
                    This page shows the end-to-end donation flow UI without creating a real donation or requiring Stripe configuration.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/forms/preview/1")}
                  className="w-fit cursor-pointer rounded-full bg-[#1A1A1A] px-6 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[#333333] active:scale-95"
                >
                  Start Over
                </button>
              </div>
            ) : isStripe ? (
              <Elements stripe={stripePromise} options={{ clientSecret: data.stripeClientSecret, appearance }}>
                <StripeCheckoutForm grandTotal={data.grandTotal} currency={data.currency} isRecurring={isRecurring} />
              </Elements>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-[14px] text-[#737373]">
                  {data.paymentMethod ? `${data.paymentMethod} payment gateway coming soon` : "No payment method selected."}
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] px-4 py-3">
              {NoticeIcon}
              <span className="text-[12px] text-[#AEAEAE]">
                Your payment is secured with 256-bit SSL encryption
              </span>
            </div>
          </div>

          <DonationPreview currentStep={4} />
        </div>

        <p className="text-center text-[12px] text-[#AEAEAE] mt-4">
          Your information is secure and encrypted.
        </p>
      </div>
    </main>
  );
};

export default Step4Confirmation;
