"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { apiRequest } from "@/services/api";
import {
  buildDonorReturnParams,
  buildDonorReturnQueryString,
  saveDonorReturnParams,
} from "@/components/payment/UnifiedChallengeDispatcher";

const RecurringNotice = () => (
  <div className="flex items-start gap-2.5 px-1 mt-4">
    <span className="text-[15px] shrink-0 mt-px">🚨</span>
    <p className="text-[13px] text-[#383838] leading-relaxed">
      For subscriptions or recurring donations, a temporary{" "}
      <span className="font-semibold">$1 authorization charge</span> will be placed on your
      card to verify it. This charge will be reversed within{" "}
      <span className="font-semibold">3-5 business days</span>.
    </p>
  </div>
);

const MethodTile = ({ label, sublabel, logo, alt, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
      isSelected
        ? "border-[#383838] bg-white shadow-sm"
        : "border-[#E5E5E5] bg-white hover:border-[#AEAEAE]"
    }`}
  >
    <div>
      <span className="text-[14px] font-medium text-[#383838]">{label}</span>
      {sublabel && (
        <span className="ml-1.5 text-[13px] text-[#737373]">· {sublabel}</span>
      )}
    </div>
    <div className="relative w-[60px] h-[24px] shrink-0">
      <Image src={logo} alt={alt} fill className="object-contain" />
    </div>
  </button>
);

function buildPayPalReturnUrl({ donorData, currency, amount }) {
  const returnBase =
    (typeof window !== "undefined" ? window.location.origin : "") +
    "/donate/thank-you/return-from-challenge";

  const donorReturnParams = buildDonorReturnParams(
    {},
    {
      firstName: donorData?.firstName,
      lastName: donorData?.lastName,
      email: donorData?.email,
      donorCountryCode: donorData?.donorCountryCode,
      locale: donorData?.locale,
      utm_source: donorData?.utm_source,
      utm_campaign: donorData?.utm_campaign,
      utm_medium: donorData?.utm_medium,
      info: donorData?.info || donorData,
    }
  );
  saveDonorReturnParams(donorReturnParams);

  const qs = buildDonorReturnQueryString(donorReturnParams);
  const params = new URLSearchParams();
  params.set("provider", "paypal");
  params.set("orchestration", "redirect");
  if (currency) params.set("currency", currency);
  if (amount) params.set("amount", String(amount));

  const combined =
    returnBase +
    "?" +
    params.toString() +
    (qs ? "&" + qs : "");

  return {
    returnUrl: returnBase + "?" + params.toString() + (qs ? "&" + qs : ""),
    donorReturnParams,
    returnBase,
  };
}

const PaymentGatewaySelector = ({
  isRecurring,
  initialGateway,
  paymentMethods = [],   // [{name, publishableKey}] from goalsDates — all Stripe
  onChange,
  donorData = null,
  currency,
  amount,
}) => {
  const hasCampaignMethods = paymentMethods.length > 0;

  // ── State for campaign-specific methods ──
  const [selectedIdx, setSelectedIdx] = useState(0);

  // ── State for global-settings fallback ──
  const [gateways,        setGateways]        = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(!hasCampaignMethods);
  const [selectedGateway, setSelectedGateway] = useState(initialGateway ?? null);

  useEffect(() => {
    if (hasCampaignMethods) {
      // Initialize with first campaign method
      onChange({ gateway: "stripe", publishableKey: paymentMethods[0].publishableKey ?? null });
      return;
    }

    // Fallback: fetch global payment settings
    apiRequest("payment/settings")
      .then((res) => {
        const raw       = res?.data?.gateways ?? {};
        const available = Object.values(raw).filter((g) => g.enabled && g.configured);
        setGateways(available);
        const stripe  = available.find((g) => g.provider === "stripe");
        const initial = initialGateway ?? (available.length > 0 ? available[0].provider : null);
        setSelectedGateway(initial);
        onChange({ gateway: initial, publishableKey: stripe?.publishableKey ?? null });
      })
      .catch(() => {})
      .finally(() => setGatewaysLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasCampaignMethods && gatewaysLoading) return null;

  return (
    <div className="pt-1">
      <p className="text-[14px] font-semibold text-[#383838] mb-3">Payment Method</p>

      {hasCampaignMethods ? (
        // Campaign-specific Stripe configurations
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method, idx) => (
            <MethodTile
              key={idx}
              label="Stripe"
              sublabel={method.name || undefined}
              logo="/images/stripe.jpg"
              alt="Stripe"
              isSelected={selectedIdx === idx}
              onClick={() => {
                setSelectedIdx(idx);
                onChange({ gateway: "stripe", publishableKey: method.publishableKey ?? null });
              }}
            />
          ))}
        </div>
      ) : (
        // Global settings: Stripe + PayPal
        <div className="grid grid-cols-3 gap-3">
          {gateways
            .filter((g) => g.provider === "stripe" || g.provider === "paypal")
            .map((gateway) => (
              <MethodTile
                key={gateway.provider}
                label={gateway.provider === "stripe" ? "Stripe" : "PayPal"}
                logo={gateway.provider === "stripe" ? "/images/stripe.jpg" : "/images/paypal.png"}
                alt={gateway.provider}
                isSelected={selectedGateway === gateway.provider}
                onClick={() => {
                  setSelectedGateway(gateway.provider);
                  const stripe = gateways.find((g) => g.provider === "stripe");

                  if (gateway.provider === "paypal") {
                    const orchestration =
                      gateway.orchestration ??
                      gateway.orchestrationMode ??
                      (gateway.redirectSupported ? "redirect" : "sdk");
                    const isRedirect = orchestration === "redirect";

                    const { returnUrl, donorReturnParams, returnBase } = buildPayPalReturnUrl({
                      donorData,
                      currency,
                      amount,
                    });

                    const challenge = isRedirect
                      ? {
                          provider: "paypal",
                          interactionType: "redirect",
                          orchestration: "redirect",
                          redirectUrl: null,
                          returnUrl,
                          donorReturnParams,
                        }
                      : null;

                    onChange({
                      gateway: gateway.provider,
                      publishableKey: stripe?.publishableKey ?? null,
                      orchestration: isRedirect ? "redirect" : "sdk",
                      provider: "paypal",
                      paypalConfig: {
                        clientId: gateway.clientId ?? gateway.publishableKey ?? null,
                        merchantId: gateway.merchantId ?? gateway.merchant_id ?? null,
                        ...(gateway.config || {}),
                      },
                      returnUrl,
                      returnBase,
                      donorReturnParams,
                      challenge,
                    });
                  } else {
                    onChange({
                      gateway: gateway.provider,
                      publishableKey: stripe?.publishableKey ?? null,
                      orchestration: "sdk",
                      provider: "stripe",
                    });
                  }
                }}
              />
            ))}
        </div>
      )}

      {isRecurring && <RecurringNotice />}
    </div>
  );
};

export default PaymentGatewaySelector;
