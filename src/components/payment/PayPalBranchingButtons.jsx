"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { apiRequest } from "@/services/api";
import {
  buildDonorReturnParams,
  saveDonorReturnParams,
  saveUnifiedChallengeToSession,
} from "@/components/payment/UnifiedChallengeDispatcher";

const PAYPAL_SDK_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  READY: "ready",
  ERROR: "error",
};

const BranchButton = ({
  label,
  sublabel,
  icon,
  iconAlt,
  isSelected,
  onClick,
  disabled,
  variant,
}) => {
  const variantClasses =
    variant === "primary"
      ? isSelected
        ? "border-[#003087] bg-[#003087] text-white shadow-md ring-2 ring-[#003087]/20"
        : "border-[#003087]/40 bg-white hover:border-[#003087] hover:shadow-sm text-[#003087]"
      : isSelected
      ? "border-[#383838] bg-[#383838] text-white shadow-md ring-2 ring-[#383838]/20"
      : "border-[#E5E5E5] bg-white hover:border-[#383838] hover:shadow-sm text-[#383838]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-2 px-5 py-5 rounded-2xl border transition-all duration-200 text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[140px] ${variantClasses}`}
    >
      <div className="relative w-[52px] h-[20px] shrink-0">
        <Image src={icon} alt={iconAlt} fill className="object-contain" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-semibold leading-tight">{label}</span>
        {sublabel && (
          <span className={`text-[11px] font-medium leading-tight ${isSelected ? "opacity-85" : "text-[#737373]"}`}>
            {sublabel}
          </span>
        )}
      </div>
    </button>
  );
};

const LoadingDots = () => (
  <span className="inline-flex items-center gap-1">
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40 animate-bounce [animation-delay:-0.3s]" />
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.15s]" />
    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
  </span>
);

function loadPayPalScript({ clientId, merchantId, currency, intent, vault }) {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.paypal) return Promise.resolve(window.paypal);

  const existing = document.querySelector('script[data-paypal-sdk="true"]');
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(window.paypal), { once: true });
      existing.addEventListener("error", () => reject(new Error("PayPal SDK failed")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const params = new URLSearchParams();
    if (clientId) params.set("client-id", clientId);
    if (merchantId) params.set("merchant-id", merchantId);
    if (currency) params.set("currency", currency);
    if (intent) params.set("intent", intent);
    if (vault) params.set("vault", "true");
    params.set("components", "buttons,messages");
    params.set("enable-funding", "paylater,venmo,card");

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-paypal-sdk", "true");
    script.setAttribute("data-client-token", "paypal-sdk");
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("PayPal SDK load failed"));
    document.body.appendChild(script);
  });
}

const PayPalBranchingButtons = ({
  amount,
  currency = "USD",
  isRecurring = false,
  paymentGatewayConfig = null,
  donationData = {},
  submitBody = null,
  onSubmitting = () => {},
  onVaultIntent = null,
  onCaptureIntent = null,
  onError = () => {},
  disabled = false,
}) => {
  const [sdkState, setSdkState] = useState(PAYPAL_SDK_STATES.IDLE);
  const [sdkError, setSdkError] = useState(null);
  const [payPalConfig, setPayPalConfig] = useState(null);
  const [gatewaySettings, setGatewaySettings] = useState(null);
  const [activeBranch, setActiveBranch] = useState(null);
  const [branchLoading, setBranchLoading] = useState(false);
  const [fetchedSettings, setFetchedSettings] = useState(false);

  const sym =
    { USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$", NZD: "NZ$", SGD: "S$", HKD: "HK$", CHF: "CHF", JPY: "¥" }[
      currency
    ] ?? currency;

  const formattedAmount = `${sym}${(Number(amount) || 0).toFixed(2)}`;

  useEffect(() => {
    if (fetchedSettings) return;
    if (paymentGatewayConfig) {
      setPayPalConfig(paymentGatewayConfig);
      setFetchedSettings(true);
      return;
    }
    setFetchedSettings(true);
    apiRequest("payment/settings", { method: "GET" })
      .then((res) => {
        const gateways = res?.data?.gateways ?? {};
        const paypal = Object.values(gateways).find((g) => g.provider === "paypal");
        setGatewaySettings(gateways);
        if (paypal && paypal.enabled && paypal.configured) {
          setPayPalConfig(paypal);
        }
      })
      .catch(() => {});
  }, [paymentGatewayConfig, fetchedSettings]);

  useEffect(() => {
    if (!payPalConfig) return;
    if (sdkState !== PAYPAL_SDK_STATES.IDLE) return;

    setSdkState(PAYPAL_SDK_STATES.LOADING);
    const clientId = payPalConfig.clientId ?? payPalConfig.publishableKey ?? payPalConfig.client_id ?? "";
    const merchantId = payPalConfig.merchantId ?? payPalConfig.merchant_id ?? "";

    loadPayPalScript({
      clientId,
      merchantId,
      currency,
      intent: isRecurring ? "authorize" : "capture",
      vault: isRecurring,
    })
      .then(() => setSdkState(PAYPAL_SDK_STATES.READY))
      .catch((err) => {
        setSdkState(PAYPAL_SDK_STATES.ERROR);
        setSdkError(err?.message ?? "Unable to load PayPal");
      });
  }, [payPalConfig, sdkState, currency, isRecurring]);

  const donorReturnParams = useCallback(() => {
    const ctx = {
      firstName: donationData.firstName ?? "",
      lastName: donationData.lastName ?? "",
      email: donationData.email ?? "",
      donorCountryCode: donationData.donorCountryCode ?? "",
      locale: donationData.locale ?? "",
      ...(donationData.info || {}),
    };
    const params = buildDonorReturnParams(submitBody ?? {}, ctx);
    saveDonorReturnParams(params);
    return params;
  }, [donationData, submitBody]);

  const handleVaultBranch = useCallback(async () => {
    if (disabled || branchLoading) return;
    setActiveBranch("vault");
    setBranchLoading(true);
    onSubmitting(true, "vault");

    try {
      const params = donorReturnParams();
      const body = {
        ...(submitBody ?? {}),
        donorReturnParams: params,
        paymentMethod: "paypal",
        orchestrationMode: "redirect",
      };

      if (typeof onVaultIntent === "function") {
        const result = await onVaultIntent(body);
        if (result?.challenge) {
          saveUnifiedChallengeToSession(result.challenge);
          saveDonorReturnParams(params);
        }
        return;
      }

      const endpoint = isRecurring ? "donations/paypal/setup-intent" : "donations/paypal/vault-setup";
      const opts = { method: "POST", body: JSON.stringify(body) };
      if (donationData.idempotencyKey) opts.idempotencyKey = donationData.idempotencyKey;
      const res = await apiRequest(endpoint, opts);
      const challenge = res?.data?.challenge ?? res?.challenge ?? null;
      if (challenge) {
        saveUnifiedChallengeToSession(challenge);
        saveDonorReturnParams(params);
      }
    } catch (err) {
      setActiveBranch(null);
      setSdkError(err?.message ?? "Vault setup failed");
      onError(err);
    } finally {
      setBranchLoading(false);
      onSubmitting(false, "vault");
    }
  }, [disabled, branchLoading, onSubmitting, onVaultIntent, onError, donorReturnParams, submitBody, isRecurring, donationData]);

  const handleCaptureBranch = useCallback(async () => {
    if (disabled || branchLoading) return;
    setActiveBranch("capture");
    setBranchLoading(true);
    onSubmitting(true, "capture");

    try {
      const params = donorReturnParams();
      const body = {
        ...(submitBody ?? {}),
        donorReturnParams: params,
        paymentMethod: "paypal",
        orchestrationMode: "redirect",
      };

      if (typeof onCaptureIntent === "function") {
        const result = await onCaptureIntent(body);
        if (result?.challenge) {
          saveUnifiedChallengeToSession(result.challenge);
          saveDonorReturnParams(params);
        }
        return;
      }

      const endpoint = "donations/paypal/capture-intent";
      const opts = { method: "POST", body: JSON.stringify(body) };
      if (donationData.idempotencyKey) opts.idempotencyKey = donationData.idempotencyKey;
      const res = await apiRequest(endpoint, opts);
      const challenge = res?.data?.challenge ?? res?.challenge ?? null;
      if (challenge) {
        saveUnifiedChallengeToSession(challenge);
        saveDonorReturnParams(params);
      }
    } catch (err) {
      setActiveBranch(null);
      setSdkError(err?.message ?? "Capture setup failed");
      onError(err);
    } finally {
      setBranchLoading(false);
      onSubmitting(false, "capture");
    }
  }, [disabled, branchLoading, onSubmitting, onCaptureIntent, onError, donorReturnParams, submitBody, donationData]);

  if (!payPalConfig) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="relative w-[60px] h-[20px] shrink-0">
            <Image src="/images/paypal.png" alt="PayPal" fill className="object-contain" />
          </div>
          <span className="text-[12px] text-[#737373]">Choose your PayPal checkout mode</span>
        </div>
        {sdkState === PAYPAL_SDK_STATES.LOADING && (
          <span className="text-[11px] text-[#737373] flex items-center gap-1.5">
            <LoadingDots />
            <span>Loading PayPal…</span>
          </span>
        )}
        {sdkState === PAYPAL_SDK_STATES.ERROR && (
          <span className="text-[11px] text-[#EA3335]">{sdkError}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BranchButton
          label="Vault & Pay Later"
          sublabel={isRecurring ? `Save payment method · ${formattedAmount}/installment` : "Save for future · Split payments"}
          icon="/images/paypal.png"
          iconAlt="PayPal Vault"
          isSelected={activeBranch === "vault"}
          onClick={handleVaultBranch}
          disabled={disabled || sdkState === PAYPAL_SDK_STATES.LOADING || sdkState === PAYPAL_SDK_STATES.ERROR || branchLoading}
          variant="primary"
        />
        <BranchButton
          label="Capture Now"
          sublabel={`One-time payment · ${formattedAmount}`}
          icon="/images/paypal.png"
          iconAlt="PayPal Capture"
          isSelected={activeBranch === "capture"}
          onClick={handleCaptureBranch}
          disabled={disabled || sdkState === PAYPAL_SDK_STATES.LOADING || sdkState === PAYPAL_SDK_STATES.ERROR || branchLoading}
          variant="default"
        />
      </div>

      <p className="text-[11px] text-[#737373] text-center leading-relaxed px-2">
        You will be redirected to PayPal to complete your payment securely and return here to finish.
      </p>
    </div>
  );
};

export default PayPalBranchingButtons;
