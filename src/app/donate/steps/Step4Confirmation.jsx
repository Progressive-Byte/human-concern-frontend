"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { useDonation } from "@/context/DonationContext";
import { useBranding } from "@/context/BrandingContext";
import StripeCheckoutForm from "./StepComponents/Step4components/StripeCheckoutForm";
import PayPalCheckoutForm from "./StepComponents/Step4components/PayPalCheckoutForm";
import StepProgress from "./StepComponents/StepProgress";
import DonateFormHeader from "./StepComponents/DonateFormHeader";
import DonationPreview from "./StepComponents/DonationPreview";
import { NoticeIcon } from "@/components/common/SvgIcon";
import { usePaymentProviderInstance } from "./StepComponents/Step4components/usePaymentProviderInstance";

// Centralised copy (future i18n extraction point — English-only today).
const PROVIDER_LABELS = { stripe: "card", paypal: "PayPal", bank_transfer: "bank transfer" };
const SWAP_BANNER_COPY = {
  title: "We switched your payment method",
  body: (from, to) => {
    const fromLabel = PROVIDER_LABELS[from] || from || "original";
    const toLabel = PROVIDER_LABELS[to] || to || "another provider";
    return `Your ${fromLabel} payment couldn't be started, so we switched you to ${toLabel}. Your ${fromLabel} method was never charged.`;
  },
  continuingPrefix: "Continuing to PayPal in",
};
const MIN_SWAP_BANNER_DURATION_MS = 2500;

const Step4Confirmation = () => {
  const { data }          = useDonation();
  const { primaryColor }  = useBranding();
  const pathname          = usePathname();
  const router            = useRouter();
  const [ready, setReady] = useState(false);
  const isPreview = pathname.startsWith("/admin/forms/preview");
  const [swapDismissed, setSwapDismissed] = useState(false);
  const [swapCountdown, setSwapCountdown] = useState(null);

  const swapInfo = useMemo(() => {
    if (data.providerSwapped) {
      return {
        swapped: true,
        from: data.providerSwappedFrom ?? null,
        to: data.payment?.provider ?? data.paymentMethod ?? null,
        reasonCode: data.swappedReasonCode ?? null,
        donationId: data.donationId ?? null,
      };
    }
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("hc_provider_swap");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.swapped) return parsed;
        }
      } catch {
        // noop
      }
    }
    return null;
  }, [
    data.providerSwapped,
    data.providerSwappedFrom,
    data.swappedReasonCode,
    data.payment,
    data.paymentMethod,
    data.donationId,
  ]);

  const swapDismissKey = `hc_provider_swap_dismissed_${data.donationId ?? "current"}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setSwapDismissed(sessionStorage.getItem(swapDismissKey) === "1");
    } catch {
      // noop
    }
  }, [swapDismissKey]);

  const showSwapBanner = Boolean(swapInfo?.swapped) && !swapDismissed;

  const dismissSwapBanner = () => {
    setSwapDismissed(true);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(swapDismissKey, "1");
      } catch {
        // noop
      }
    }
  };

  const publicSettings = useMemo(() => ({
    provider: data.paymentMethod ?? null,
    stripePublishableKey: data.stripePublishableKey ?? null,
    paypalClientId: data.paypalClientId ?? null,
    stripeClientSecret: data.stripeClientSecret ?? null,
    setupIntentId: data.setupIntentId ?? null,
    paypalOrderId: data.paypalOrderId ?? null,
    gatewayConfigurationId: data.gatewayConfigurationId ?? null,
    isRecurring: data.paymentType === "recurring",
  }), [
    data.paymentMethod,
    data.stripePublishableKey,
    data.paypalClientId,
    data.stripeClientSecret,
    data.setupIntentId,
    data.paypalOrderId,
    data.gatewayConfigurationId,
    data.paymentType,
  ]);

  const responsePayment = useMemo(() => {
    if (!data.submitted) return {};
    return {
      provider: data.payment?.provider ?? data.paymentMethod ?? null,
      publishableKey: data.payment?.publishableKey ?? data.stripePublishableKey ?? null,
      clientId: data.payment?.clientId ?? data.paypalClientId ?? null,
      clientSecret: data.payment?.clientSecret ?? data.stripeClientSecret ?? null,
      setupIntentId: data.payment?.setupIntentId ?? data.setupIntentId ?? null,
      orderId: data.payment?.orderId ?? data.paypalOrderId ?? null,
      gatewayConfigurationId: data.payment?.gatewayConfigurationId ?? data.gatewayConfigurationId ?? null,
      paymentMode: data.payment?.paymentMode ?? (data.paymentType === "recurring" ? "split" : "one_time"),
      approvalUrl: data.payment?.approvalUrl ?? data.approvalUrl ?? data.paypalApprovalUrl ?? null,
      redirectUrl: data.payment?.redirectUrl ?? data.redirectUrl ?? data.paypalRedirectUrl ?? data.approvalUrl ?? data.paypalApprovalUrl ?? null,
      billingAgreementToken: data.payment?.billingAgreementToken ?? data.billingAgreementToken ?? data.paypalBillingAgreementToken ?? data.baToken ?? null,
    };
  }, [
    data.submitted,
    data.payment,
    data.paymentMethod,
    data.stripePublishableKey,
    data.paypalClientId,
    data.stripeClientSecret,
    data.setupIntentId,
    data.paypalOrderId,
    data.gatewayConfigurationId,
    data.paymentType,
    data.approvalUrl,
    data.paypalApprovalUrl,
    data.redirectUrl,
    data.paypalRedirectUrl,
    data.billingAgreementToken,
    data.paypalBillingAgreementToken,
    data.baToken,
  ]);

  const {
    config: sdkConfig,
    stripePromise,
    elementsKey,
    sdkReInitCounter,
  } = usePaymentProviderInstance(responsePayment, publicSettings, data.payment ?? null);

  const isRecurring = sdkConfig.isRecurring;
  const isStripe = sdkConfig.isStripe;
  const isPayPal =
    Boolean(sdkConfig.isPayPal) ||
    (responsePayment && responsePayment.provider === "paypal") ||
    (data.paymentMethod && String(data.paymentMethod).toLowerCase() === "paypal");
  const isPayPalRedirect =
    isPayPal &&
    data.submitted === true &&
    Boolean(
      sdkConfig.setupIntentId ||
      (responsePayment && responsePayment.setupIntentId) ||
      data.setupIntentId
    );

  useEffect(() => {
    if (isPreview) {
      setReady(true);
      return;
    }
    if (sessionStorage.getItem("hc_donation_done") === "1") {
      router.replace("/donate/thank-you");
      return;
    }

    const paypalProvider =
      (responsePayment && responsePayment.provider === "paypal") ||
      (publicSettings && publicSettings.provider === "paypal") ||
      (data.paymentMethod && String(data.paymentMethod).toLowerCase() === "paypal") ||
      Boolean(sdkConfig.isPayPal);
    const hasPaypalIdentifiers = Boolean(
      sdkConfig.orderId ||
      sdkConfig.setupIntentId ||
      (responsePayment && (responsePayment.orderId || responsePayment.setupIntentId)) ||
      data.paypalOrderId ||
      data.setupIntentId
    );
    const hasStripeSession = sdkConfig.isStripe && Boolean(sdkConfig.clientSecret);
    const hasPaypalSession = data.submitted === true && paypalProvider && hasPaypalIdentifiers;

    if (!hasStripeSession && !hasPaypalSession) {
      router.replace("/campaigns");
      return;
    }

    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sdkConfig.isStripe,
    sdkConfig.clientSecret,
    sdkConfig.isPayPal,
    sdkConfig.orderId,
    sdkConfig.setupIntentId,
    data.submitted,
    data.paymentMethod,
    data.paypalOrderId,
    data.setupIntentId,
    isPreview,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || isPreview || !isPayPalRedirect || data.submitted !== true) {
      return;
    }

    let storedRedirectUrl = "";
    try {
      const stored =
        sessionStorage.getItem("hc_unified_challenge") ||
        sessionStorage.getItem("hc_last_challenge") ||
        "";
      if (stored) {
        const parsed = JSON.parse(stored);
        storedRedirectUrl =
          parsed.redirectUrl ||
          parsed.challenge?.redirectUrl ||
          parsed.approvalUrl ||
          parsed.challenge?.approvalUrl ||
          "";
      }
    } catch (_) {
      storedRedirectUrl = "";
    }

    const responseRedirect =
      (responsePayment && (responsePayment.redirectUrl || responsePayment.approvalUrl)) ||
      data.redirectUrl ||
      data.approvalUrl ||
      data.paypalRedirectUrl ||
      data.paypalApprovalUrl ||
      "";

    const target = String(storedRedirectUrl || responseRedirect || "").trim();
    if (!target) {
      return;
    }

    // When we switched the donor to PayPal, keep the swap banner on screen for a
    // minimum duration before navigating so it is actually read/announced.
    const swapped = Boolean(swapInfo?.swapped);
    const delayMs = swapped ? MIN_SWAP_BANNER_DURATION_MS : 900;

    let disposed = false;
    let countdownInterval = null;
    if (swapped) {
      setSwapCountdown(Math.ceil(MIN_SWAP_BANNER_DURATION_MS / 1000));
      countdownInterval = window.setInterval(() => {
        setSwapCountdown((n) => (n && n > 1 ? n - 1 : n));
      }, 1000);
    }

    const token = window.setTimeout(() => {
      if (disposed) return;
      try {
        window.location.assign(target);
      } catch (_) {
        window.location.href = target;
      }
    }, delayMs);

    return () => {
      disposed = true;
      if (token) window.clearTimeout(token);
      if (countdownInterval) window.clearInterval(countdownInterval);
    };
  }, [
    isPreview,
    isPayPalRedirect,
    data.submitted,
    responsePayment,
    data.redirectUrl,
    data.approvalUrl,
    data.paypalRedirectUrl,
    data.paypalApprovalUrl,
    swapInfo?.swapped,
  ]);

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: primaryColor,
      colorBackground: "#ffffff",
      borderRadius: "12px",
      fontSizeBase: "14px",
    },
  };

  if (!ready) return null;

  const pkPrefix = typeof sdkConfig.sdkKey === "string"
    ? (sdkConfig.sdkKey.startsWith("pk_live_") ? "live" :
       sdkConfig.sdkKey.startsWith("pk_test_") ? "test" : "unknown")
    : "missing";
  const csPrefix = typeof sdkConfig.clientSecret === "string"
    ? (sdkConfig.clientSecret.startsWith("pi_") || sdkConfig.clientSecret.startsWith("seti_")
        ? (sdkConfig.clientSecret.includes("_live_") ? "live" :
           sdkConfig.clientSecret.includes("_test_") ? "test" : "unknown")
        : "malformed")
    : "missing";
  const hasEnvMismatch = sdkConfig.isStripe && pkPrefix !== "missing" && pkPrefix !== "unknown"
    && csPrefix !== "missing" && csPrefix !== "unknown" && csPrefix !== "malformed"
    && pkPrefix !== csPrefix;
  const hasSdkKeyMissing = sdkConfig.isStripe && !sdkConfig.sdkKey;
  const hasClientSecretMissing = sdkConfig.isStripe && !sdkConfig.clientSecret;
  const defaultSdkKey = typeof publicSettings.stripePublishableKey === "string" ? publicSettings.stripePublishableKey : null;
  const currentSdkKey = typeof sdkConfig.sdkKey === "string" ? sdkConfig.sdkKey : null;
  const defaultGatewayId = publicSettings.gatewayConfigurationId ?? null;
  const currentGatewayId = sdkConfig.gatewayConfigurationId ?? null;
  const hasGatewayCrossMatch = sdkConfig.isStripe
    && !hasSdkKeyMissing
    && currentSdkKey
    && defaultSdkKey
    && currentSdkKey === defaultSdkKey
    && currentGatewayId
    && defaultGatewayId
    && String(currentGatewayId) !== String(defaultGatewayId);
  const hasMalformedClientSecret = sdkConfig.isStripe
    && !hasClientSecretMissing
    && typeof sdkConfig.clientSecret === "string"
    && !sdkConfig.clientSecret.startsWith("pi_")
    && !sdkConfig.clientSecret.startsWith("seti_");
  const showStripeDiagnostic = sdkConfig.isStripe
    && (hasEnvMismatch || hasSdkKeyMissing || hasClientSecretMissing || hasGatewayCrossMatch || hasMalformedClientSecret);

  const elementsOptions = {
    clientSecret: sdkConfig.clientSecret,
    appearance,
  };

  return (
    <main className="min-h-screen bg-[#F9F9F9] pt-30 lg:pt-40 pb-16 px-4">
      <DonateFormHeader maxWidth="max-w-5xl" />

      <div className="max-w-5xl mx-auto">
        <StepProgress current={4} />

        {showSwapBanner && (
          <div
            role="status"
            aria-live="polite"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-[#FFE082] bg-[#FFF8E1] px-4 py-3"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#B45309] text-[12px] font-bold text-white">
              !
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[#7C4A03]">{SWAP_BANNER_COPY.title}</p>
              <p className="mt-0.5 text-[13px] text-[#8A5A12]">
                {SWAP_BANNER_COPY.body(swapInfo.from, swapInfo.to)}
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss payment method change notice"
              onClick={dismissSwapBanner}
              className="shrink-0 cursor-pointer rounded-full px-2 text-[18px] leading-none text-[#8A5A12] hover:text-[#5C3703]"
            >
              ×
            </button>
          </div>
        )}

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
            ) : isPayPalRedirect ? (
              <div className="flex flex-col items-center gap-4 py-14 text-center">
                <svg className="animate-spin h-8 w-8 text-[#1A1A1A]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-[15px] font-semibold text-[#383838]">Redirecting to PayPal…</p>
                <p className="text-[13px] text-[#737373]">
                  You will be sent to PayPal to approve your recurring donation. Once approved, you&apos;ll be returned here.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const stored =
                      sessionStorage.getItem("hc_unified_challenge") ||
                      sessionStorage.getItem("hc_last_challenge") ||
                      "";
                    let redirectUrl = "";
                    try {
                      if (stored) {
                        const parsed = JSON.parse(stored);
                        redirectUrl = parsed.redirectUrl || parsed.challenge?.redirectUrl || "";
                      }
                    } catch (_) {}
                    const responseRedirect =
                      (responsePayment && (responsePayment.redirectUrl || responsePayment.approvalUrl)) ||
                      data.redirectUrl ||
                      "";
                    const target = redirectUrl || responseRedirect;
                    if (target && typeof window !== "undefined") {
                      window.location.assign(target);
                    }
                  }}
                  className="mt-2 cursor-pointer rounded-full bg-[#1A1A1A] px-6 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[#333333] active:scale-95"
                >
                  {swapCountdown
                    ? `${SWAP_BANNER_COPY.continuingPrefix} ${swapCountdown}…`
                    : "Go to PayPal now"}
                </button>
              </div>
            ) : isStripe ? (
              <>
                {showStripeDiagnostic && (
                  <div className="mb-5 rounded-xl border border-[#FFB4B4] bg-[#FFF5F5] px-4 py-3">
                    <p className="text-[13px] font-semibold text-[#B91C1C] mb-1">Payment configuration issue (backend)</p>
                    <ul className="text-[12px] text-[#9B1C1C] space-y-1 list-disc pl-5">
                      {hasSdkKeyMissing && (
                        <li><strong>Stripe publishable key</strong> is missing. Backend returned no <code>publishableKey</code> / <code>stripePublishableKey</code> in submit response, and no gateway pre-selection was saved. Possible causes: GET /payment/settings default Stripe configuration not marked <code>configured=true</code>, or POST /donations/submit is not echoing back the orchestration <code>payment.publishableKey</code>.</li>
                      )}
                      {hasClientSecretMissing && (
                        <li><strong>Stripe clientSecret</strong> is missing. Backend returned no <code>clientSecret</code> / <code>stripeClientSecret</code> / <code>setupIntent.client_secret</code> in submit response. The server must create a PaymentIntent (one-time) or SetupIntent (split/recurring) on submit and pass its secret back to the frontend.</li>
                      )}
                      {hasEnvMismatch && (
                        <li><strong>Live / Test environment mismatch.</strong> The publishable key is <code>{pkPrefix}</code> (<code>{String(sdkConfig.sdkKey ?? "").slice(0, 14)}…</code>) but the clientSecret is <code>{csPrefix}</code> (secret starts with <code>{String(sdkConfig.clientSecret ?? "").slice(0, 14)}…</code>). These must be the same environment. Backend orchestration bug: the gateway used for submit used different Stripe account credentials than the one used to create the intent.</li>
                      )}
                      {hasGatewayCrossMatch && (
                        <li><strong>Cross-account gateway mismatch detected.</strong> The orchestrator switched to gateway <code>{String(currentGatewayId)}</code> (the failover winner), but the publishable key is still the default gateway <code>{String(defaultGatewayId)}</code> key. This means the backend <code>POST /donations/submit</code> response omitted the winning gateway&apos;s <code>payment.publishableKey</code>. The two credential families belong to DIFFERENT Stripe accounts → <code>&lt;PaymentElement&gt;</code> renders no card inputs. Check backend server logs for <code>GATEWAY_CONFIG_NOT_FOUND_IN_SETTINGS</code> or <code>SETTINGS_GATEWAY_CREDENTIAL_MISSING</code> / <code>SETTINGS_GATEWAY_CREDENTIAL_INVALID</code>.</li>
                      )}
                      {hasMalformedClientSecret && (
                        <li><strong>Stripe clientSecret is malformed.</strong> The secret value starts with <code>{String(sdkConfig.clientSecret ?? "").slice(0, 10)}…</code> but must begin with <code>pi_</code> (one-time) or <code>seti_</code> (split/recurring). This usually means the backend returned a placeholder (failover-engine disabled: look for env var <code>PAYMENT_FAILOVER_ENGINE_DISABLED=true</code>) or StripeAdapter is running in <code>env=&apos;test&apos;</code> mock bypass mode without calling real Stripe. PaymentElement will NOT render inputs for this value.</li>
                      )}
                    </ul>
                    <p className="text-[11px] text-[#9B1C1C] mt-2 opacity-80">
                      If you are the developer: check backend server logs for <code>GATEWAY_CONFIG_NOT_FOUND_IN_SETTINGS</code>, <code>SETTINGS_GATEWAY_CREDENTIAL_MISSING</code>, or <code>SETTINGS_GATEWAY_CREDENTIAL_INVALID</code>.
                    </p>
                  </div>
                )}
                {stripePromise && sdkConfig.clientSecret ? (
                  <Elements
                    key={elementsKey}
                    stripe={stripePromise}
                    options={elementsOptions}
                  >
                    <StripeCheckoutForm
                      grandTotal={data.grandTotal}
                      firstPaymentAmount={data.firstPaymentAmount}
                      firstPaymentDate={data.firstPaymentDate}
                      currency={data.currency}
                      isRecurring={isRecurring}
                    />
                  </Elements>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-14">
                    <svg className="animate-spin h-7 w-7 text-[#1A1A1A]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-[13px] text-[#737373]">Loading payment form…</p>
                    {!sdkConfig.clientSecret && !showStripeDiagnostic && (
                      <p className="text-[12px] text-[#B45309]">Waiting for server payment session…</p>
                    )}
                  </div>
                )}
              </>
            ) : isPayPal && !isPayPalRedirect ? (
              <PayPalCheckoutForm
                grandTotal={data.grandTotal}
                firstPaymentAmount={data.firstPaymentAmount}
                firstPaymentDate={data.firstPaymentDate}
                currency={data.currency}
                isRecurring={isRecurring}
              />
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
