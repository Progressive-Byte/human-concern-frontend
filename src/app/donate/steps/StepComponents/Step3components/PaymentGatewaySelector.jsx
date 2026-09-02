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
  paymentMethods = [],
  onChange,
  donorData = null,
  currency,
  amount,
}) => {
  // Orchestration mode: expose ONLY provider-level method types (stripe / paypal).
  // The backend orchestrator picks the best specific configuration internally.
  const [providers,       setProviders]       = useState([]); // [{ provider, publishableKey, clientId, merchantId, orchestration }]
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const initialProviderStr =
    (typeof initialGateway === "string" && ["stripe", "paypal"].includes(initialGateway))
      ? initialGateway
      : initialGateway?.provider ?? initialGateway?.gateway ?? null;
  const [selectedProvider, setSelectedProvider] = useState(initialProviderStr);

  useEffect(() => {
    let alive = true;
    setGatewaysLoading(true);
    apiRequest("payment/settings")
      .then((res) => {
        if (!alive) return;
        const providersByKey = res?.data?.gateways ?? {};
        const SUPPORTED = new Set(["stripe", "paypal"]);

        // Campaign-level ordering preference (if any) applies to provider priority.
        const campaignProviderOrder = new Map();
        if (Array.isArray(paymentMethods) && paymentMethods.length > 0) {
          paymentMethods.forEach((m, idx) => {
            if (!m) return;
            const p = String(m.provider || "").toLowerCase();
            if (p && SUPPORTED.has(p) && !campaignProviderOrder.has(p)) {
              campaignProviderOrder.set(p, idx);
            }
          });
        }

        // Aggregate all enabled+configured configs per provider.
        // Keep the best one (by campaign order, then isDefault, then priority, then name)
        // as the representative for frontend settings (publishableKey / clientId / merchantId).
        // The backend orchestrator picks the ACTUAL config — we just need a valid frontend key.
        const aggregated = [];
        Object.values(providersByKey).forEach((providerBucket) => {
          if (!providerBucket || typeof providerBucket !== "object") return;
          const provider = String(providerBucket.provider || "").toLowerCase();
          if (!SUPPORTED.has(provider)) return;

          const cfgs = Array.isArray(providerBucket.configurations)
            ? providerBucket.configurations
            : [];
          const allCandidates = [];

          cfgs.forEach((cfg, idx) => {
            if (!cfg || typeof cfg !== "object") return;
            const enabled = cfg.enabled !== false && providerBucket.enabled !== false;
            const configured = Boolean(cfg.configured ?? providerBucket.configured);
            if (!enabled || !configured) return;
            allCandidates.push({
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
              merchantId:
                cfg.merchantId ??
                cfg.merchant_id ??
                providerBucket.merchantId ??
                providerBucket.merchant_id ??
                null,
            });
          });

          if (
            allCandidates.length === 0 &&
            providerBucket.enabled !== false &&
            Boolean(providerBucket.configured)
          ) {
            allCandidates.push({
              ...providerBucket,
              provider,
              configurationId:
                providerBucket.configurationId ?? `${provider}_default`,
              publishableKey:
                providerBucket.publishableKey ?? providerBucket.apiKey ?? null,
              clientId:
                providerBucket.clientId ?? providerBucket.publishableKey ?? null,
              merchantId:
                providerBucket.merchantId ?? providerBucket.merchant_id ?? null,
            });
          }

          if (allCandidates.length === 0) return;

          // Pick the best representative config within this provider bucket.
          const best = [...allCandidates].sort((a, b) => {
            if (Boolean(a.isDefault) !== Boolean(b.isDefault)) return a.isDefault ? -1 : 1;
            const pa = Number(a.priority ?? 50);
            const pb = Number(b.priority ?? 50);
            if (pb !== pa) return pb - pa;
            return String(a.name || "").localeCompare(String(b.name || ""));
          })[0];

          const orchestration =
            best.orchestration ??
            best.orchestrationMode ??
            (provider === "paypal"
              ? (best.redirectSupported ? "redirect" : "sdk")
              : "sdk");

          aggregated.push({
            provider,
            configurationId: best.configurationId ?? null,
            publishableKey: best.publishableKey,
            clientId: best.clientId,
            merchantId: best.merchantId,
            orchestration,
            config: best.config || {},
            configCount: allCandidates.length,
          });
        });

        // Sort provider-level tiles by campaign preference (if any), then: Stripe before PayPal.
        aggregated.sort((a, b) => {
          const ra = campaignProviderOrder.has(a.provider) ? campaignProviderOrder.get(a.provider) : 9999;
          const rb = campaignProviderOrder.has(b.provider) ? campaignProviderOrder.get(b.provider) : 9999;
          if (ra !== rb) return ra - rb;
          // Prefer card (stripe) first as the default option for most donors.
          if (a.provider !== b.provider) return a.provider === "stripe" ? -1 : 1;
          return 0;
        });

        setProviders(aggregated);
        const defaultProvider = aggregated[0]?.provider ?? null;
        const selected =
          (initialProviderStr && aggregated.some((p) => p.provider === initialProviderStr))
            ? initialProviderStr
            : defaultProvider;
        setSelectedProvider(selected);

        if (selected) {
          const picked = aggregated.find((p) => p.provider === selected);
          const stripe = aggregated.find((p) => p.provider === "stripe");
          const paypal = aggregated.find((p) => p.provider === "paypal");
          emitSelection({ picked, stripe, aggregated, donorData, currency, amount, onChange });
        } else {
          onChange({ gateway: null, publishableKey: null });
        }
      })
      .catch(() => {
        if (!alive) return;
        setProviders([]);
      })
      .finally(() => {
        if (!alive) return;
        setGatewaysLoading(false);
      });

    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(paymentMethods.map((m) => m && ({ name: m.name, provider: m.provider })))]);

  if (gatewaysLoading) return null;

  const hasAny = providers.length > 0;

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
        // Orchestration: 1 tile per provider type — donors pick method category only.
        // The orchestrator internally selects the best specific gateway configuration.
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          {providers.map((row) => {
            const isSelected = selectedProvider === row.provider;
            return (
              <MethodTile
                key={row.provider}
                label={row.provider === "stripe" ? "Stripe" : "PayPal"}
                sublabel={null}
                logo={row.provider === "stripe" ? "/images/stripe.jpg" : "/images/paypal.png"}
                alt={row.provider}
                isSelected={isSelected}
                onClick={() => {
                  setSelectedProvider(row.provider);
                  const stripe = providers.find((p) => p.provider === "stripe");
                  emitSelection({
                    picked: row,
                    stripe,
                    aggregated: providers,
                    donorData,
                    currency,
                    amount,
                    onChange,
                  });
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

function emitSelection({ picked, stripe, aggregated, donorData, currency, amount, onChange }) {
  if (!picked) return;
  if (picked.provider === "paypal") {
    const isRedirect = picked.orchestration === "redirect";
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
      gateway: "paypal",
      configurationId: picked.configurationId ?? null,
      publishableKey: stripe?.publishableKey ?? picked.publishableKey ?? null,
      orchestration: isRedirect ? "redirect" : "sdk",
      provider: "paypal",
      paypalConfig: {
        configurationId: picked.configurationId ?? null,
        clientId: picked.clientId ?? picked.publishableKey ?? null,
        merchantId: picked.merchantId ?? null,
        ...(picked.config || {}),
      },
      returnUrl,
      returnBase,
      donorReturnParams,
      challenge,
    });
  } else {
    onChange({
      gateway: "stripe",
      configurationId: picked.configurationId ?? null,
      publishableKey: picked.publishableKey ?? null,
      orchestration: "sdk",
      provider: "stripe",
    });
  }
}

export default PaymentGatewaySelector;
