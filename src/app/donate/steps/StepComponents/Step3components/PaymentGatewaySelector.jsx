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
  paymentMethods = [],   // [{name, publishableKey, configurationId, provider}] from goalsDates
  onChange,
  donorData = null,
  currency,
  amount,
}) => {
  // Always load the live settings so Enable/Disable toggles in admin are respected immediately.
  // The campaign's embedded `paymentMethods` is only used for ordering & selection hints.
  const [gateways,        setGateways]        = useState([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [selectedConfigId, setSelectedConfigId] = useState(
    initialGateway?.configurationId ??
    (String(initialGateway || "").includes("_cfg_") ? String(initialGateway) : null)
  );

  useEffect(() => {
    let alive = true;
    setGatewaysLoading(true);
    apiRequest("payment/settings")
      .then((res) => {
        if (!alive) return;
        const providersByKey = res?.data?.gateways ?? {};
        const flattened = [];
        const SUPPORTED = new Set(["stripe", "paypal"]);
        Object.values(providersByKey).forEach((providerBucket) => {
          if (!providerBucket || typeof providerBucket !== "object") return;
          const provider = String(providerBucket.provider || "").toLowerCase();
          if (!SUPPORTED.has(provider)) return;
          const cfgs = Array.isArray(providerBucket.configurations)
            ? providerBucket.configurations
            : [];
          if (cfgs.length > 0) {
            cfgs.forEach((cfg, idx) => {
              if (!cfg || typeof cfg !== "object") return;
              const enabled = cfg.enabled !== false && providerBucket.enabled !== false;
              const configured = Boolean(cfg.configured ?? providerBucket.configured);
              if (!enabled || !configured) return;
              flattened.push({
                ...cfg,
                provider,
                configurationId:
                  cfg.configurationId ??
                  cfg.configId ??
                  `${provider}_idx_${idx}`,
                publishableKey:
                  cfg.publishableKey ??
                  providerBucket.publishableKey ??
                  cfg.apiKey ??
                  providerBucket.apiKey ??
                  null,
                clientId:
                  cfg.clientId ??
                  providerBucket.clientId ??
                  cfg.publishableKey ??
                  providerBucket.publishableKey ??
                  null,
              });
            });
          } else if (
            providerBucket.enabled !== false &&
            Boolean(providerBucket.configured)
          ) {
            flattened.push({
              ...providerBucket,
              provider,
              configurationId:
                providerBucket.configurationId ?? `${provider}_default`,
              publishableKey:
                providerBucket.publishableKey ?? providerBucket.apiKey ?? null,
              clientId:
                providerBucket.clientId ?? providerBucket.publishableKey ?? null,
            });
          }
        });

        let ordered = flattened;
        // If campaign embedded methods exist → re-order / prefer campaign-selected methods first
        // (while still filtering out anything the admin disabled).
        if (Array.isArray(paymentMethods) && paymentMethods.length > 0) {
          const order = new Map();
          paymentMethods.forEach((m, idx) => {
            if (!m) return;
            const cfgId = String(m.configurationId ?? m.configId ?? m.id ?? "").trim();
            if (cfgId) order.set(cfgId, idx);
          });
          ordered = [...flattened].sort((a, b) => {
            const ra = order.has(a.configurationId) ? order.get(a.configurationId) : 9999;
            const rb = order.has(b.configurationId) ? order.get(b.configurationId) : 9999;
            if (ra !== rb) return ra - rb;
            if (Boolean(a.isDefault) !== Boolean(b.isDefault)) return a.isDefault ? -1 : 1;
            const pa = Number(a.priority ?? 50);
            const pb = Number(b.priority ?? 50);
            if (pb !== pa) return pb - pa;
            return String(a.name || "").localeCompare(String(b.name || ""));
          });
        } else {
          ordered = flattened.sort((a, b) => {
            if (Boolean(a.isDefault) !== Boolean(b.isDefault)) return a.isDefault ? -1 : 1;
            const pa = Number(a.priority ?? 50);
            const pb = Number(b.priority ?? 50);
            if (pb !== pa) return pb - pa;
            return String(a.name || "").localeCompare(String(b.name || ""));
          });
        }

        setGateways(ordered);
        const initialCfg = ordered[0] ?? null;
        const initialId = initialCfg?.configurationId ?? null;
        setSelectedConfigId(initialId);
        const stripeCfg = ordered.find((g) => g.provider === "stripe") ?? null;
        if (initialCfg) {
          onChange({
            gateway: initialCfg.provider,
            configurationId: initialId,
            publishableKey: stripeCfg?.publishableKey ?? initialCfg.publishableKey ?? null,
          });
        } else {
          onChange({ gateway: null, configurationId: null, publishableKey: null });
        }
      })
      .catch(() => {
        if (!alive) return;
        setGateways([]);
      })
      .finally(() => {
        if (!alive) return;
        setGatewaysLoading(false);
      });

    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(paymentMethods.map((m) => m && ({ configurationId: m.configurationId, name: m.name, publishableKey: m.publishableKey, provider: m.provider })))]);

  if (gatewaysLoading) return null;

  const hasAny = gateways.length > 0;

  return (
    <div className="pt-1">
      <p className="text-[14px] font-semibold text-[#383838] mb-3">Payment Method</p>

      {!hasAny ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E5E5E5] bg-[#FAFAFA] px-5 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M12 6v6l4 2M22 12a10 10 0 11-20 0 10 10 0 0120 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-[#383838]">No payment methods available yet</p>
          <p className="max-w-[380px] text-[12px] leading-relaxed text-[#737373]">
            The admin has not enabled any payment gateways for this site. Donations cannot be processed right now.
          </p>
        </div>
      ) : (
        // Unified tile grid (1-3 cards): campaign order is preserved ONLY for enabled+configured gateways.
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gateways.map((gateway) => {
            const isSelected = selectedConfigId === gateway.configurationId;
            return (
              <MethodTile
                key={gateway.configurationId}
                label={gateway.provider === "stripe" ? "Stripe" : "PayPal"}
                sublabel={gateway.name || (gateway.isDefault ? "Default" : undefined)}
                logo={gateway.provider === "stripe" ? "/images/stripe.jpg" : "/images/paypal.png"}
                alt={gateway.provider}
                isSelected={isSelected}
                onClick={() => {
                  setSelectedConfigId(gateway.configurationId);
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
                      configurationId: gateway.configurationId,
                      publishableKey: stripe?.publishableKey ?? gateway.publishableKey ?? null,
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
                      configurationId: gateway.configurationId,
                      publishableKey: gateway.publishableKey ?? null,
                      orchestration: "sdk",
                      provider: "stripe",
                    });
                  }
                }}
              />
            );
          })}
        </div>
      )}

      {isRecurring && <RecurringNotice />}
    </div>
  );
};

export default PaymentGatewaySelector;
