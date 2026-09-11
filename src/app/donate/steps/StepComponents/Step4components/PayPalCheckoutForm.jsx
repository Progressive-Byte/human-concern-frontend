"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";
import { apiRequest } from "@/services/api";
import UnifiedChallengeDispatcher, {
  loadUnifiedChallengeFromSession,
  clearUnifiedChallengeSession,
} from "@/components/payment/UnifiedChallengeDispatcher";
import { resolvePaymentSdkConfig } from "@/app/donate/steps/StepComponents/Step4components/usePaymentProviderInstance";
import { loadPayPalScript, unloadPayPalScript } from "@/components/payment/PayPalBranchingButtons";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

function readSessionChallengeIds() {
  try {
    const challenge = loadUnifiedChallengeFromSession();
    return {
      authChallengeId: challenge?.authChallengeId ?? sessionStorage.getItem("hc_auth_challenge_id") ?? null,
      frontendReturnPayloadId:
        challenge?.frontendReturnPayloadId ??
        sessionStorage.getItem("hc_frontend_return_payload_id") ??
        null,
    };
  } catch {
    return { authChallengeId: null, frontendReturnPayloadId: null };
  }
}

const PAYPAL_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  READY: "ready",
  ERROR: "error",
};

const PayPalCheckoutForm = ({ grandTotal, currency, isRecurring }) => {
  const router = useRouter();
  const { data, update } = useDonation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [challengeExpired, setChallengeExpired] = useState(false);

  const [sdkState, setSdkState] = useState(PAYPAL_STATES.IDLE);
  const [sdkError, setSdkError] = useState(null);
  const buttonsContainerRef = useRef(null);
  const renderedButtonsRef = useRef(null);

  const publicSettings = useMemo(() => ({
    provider: "paypal",
    paypalClientId: data.paypalClientId ?? null,
    paypalOrderId: data.paypalOrderId ?? null,
    gatewayConfigurationId: data.gatewayConfigurationId ?? null,
    isRecurring,
  }), [data.paypalClientId, data.paypalOrderId, data.gatewayConfigurationId, isRecurring]);

  const responsePayment = useMemo(() => {
    if (!data.submitted) return {};
    return {
      provider: data.payment?.provider ?? data.paymentMethod ?? null,
      clientId: data.payment?.clientId ?? data.paypalClientId ?? null,
      setupIntentId: data.payment?.setupIntentId ?? data.setupIntentId ?? null,
      orderId: data.payment?.orderId ?? data.paypalOrderId ?? null,
      gatewayConfigurationId: data.payment?.gatewayConfigurationId ?? data.gatewayConfigurationId ?? null,
      paymentMode: isRecurring ? "split" : "one_time",
      approvalUrl: data.payment?.approvalUrl ?? data.approvalUrl ?? data.paypalApprovalUrl ?? null,
      redirectUrl: data.payment?.redirectUrl ?? data.redirectUrl ?? data.paypalRedirectUrl ?? data.approvalUrl ?? data.paypalApprovalUrl ?? null,
      billingAgreementToken: data.payment?.billingAgreementToken ?? data.billingAgreementToken ?? data.paypalBillingAgreementToken ?? data.baToken ?? null,
    };
  }, [
    data.submitted,
    data.payment,
    data.paymentMethod,
    data.paypalClientId,
    data.setupIntentId,
    data.paypalOrderId,
    data.gatewayConfigurationId,
    isRecurring,
    data.approvalUrl,
    data.paypalApprovalUrl,
    data.redirectUrl,
    data.paypalRedirectUrl,
    data.billingAgreementToken,
    data.paypalBillingAgreementToken,
    data.baToken,
  ]);

  const sdkConfig = useMemo(
    () => resolvePaymentSdkConfig(responsePayment, publicSettings, data.payment ?? null),
    [responsePayment, publicSettings, data.payment]
  );

  const sym = CURRENCY_SYMBOLS[currency] ?? "$";

  const finalizeSplitDonation = useCallback(async ({
    setupIntentId,
    authChallengeId,
    frontendReturnPayloadId,
    idempotencyKey,
  }) => {
    const body = {
      setupIntentId,
      paymentProvider: data.payment?.provider ?? data.paymentMethod ?? "paypal",
      ...(data.donationId && { donationId: data.donationId }),
      ...(data.pendingSessionId && { pendingSessionId: data.pendingSessionId }),
      ...(authChallengeId && { authChallengeId }),
      ...(frontendReturnPayloadId && { frontendReturnPayloadId }),
    };
    const opts = { method: "POST", body: JSON.stringify(body) };
    if (idempotencyKey) opts.idempotencyKey = idempotencyKey;

    try {
      const res = await apiRequest("donations/finalize", opts);
      const finalizedId = res?.data?.donationId ?? res?.donationId ?? data.donationId ?? null;
      if (finalizedId) update({ finalizedDonationId: finalizedId });
      return res;
    } catch (err) {
      const status = Number(err?.statusCode ?? 0);
      if (status === 404 || status === 405 || status === 400) {
        return { legacyFallback: true, err };
      }
      throw err;
    }
  }, [data.donationId, data.pendingSessionId, data.payment, data.paymentMethod, update]);

  const finalizeOneTimeDonation = useCallback(async ({
    orderId,
    payerId,
    paypalToken,
    paymentId,
    authChallengeId,
    frontendReturnPayloadId,
    idempotencyKey,
  }) => {
    const body = {
      paymentMode: "one_time",
      ...(orderId && { orderId }),
      ...(payerId && { payerId }),
      ...(paypalToken && { paypalToken }),
      ...(paymentId && { paymentId }),
      paymentProvider: data.payment?.provider ?? data.paymentMethod ?? "paypal",
      ...(data.donationId && { donationId: data.donationId }),
      ...(data.pendingSessionId && { pendingSessionId: data.pendingSessionId }),
      ...(authChallengeId && { authChallengeId }),
      ...(frontendReturnPayloadId && { frontendReturnPayloadId }),
    };
    const opts = { method: "POST", body: JSON.stringify(body) };
    if (idempotencyKey) opts.idempotencyKey = idempotencyKey;

    try {
      const res = await apiRequest("donations/finalize-onetime", opts);
      const finalizedId = res?.data?.donationId ?? res?.donationId ?? data.donationId ?? null;
      if (finalizedId) update({ finalizedDonationId: finalizedId });
      return res;
    } catch (err) {
      const status = Number(err?.statusCode ?? 0);
      if (status === 404 || status === 405) {
        try {
          const fallbackOpts = { method: "POST", body: JSON.stringify(body) };
          if (idempotencyKey) fallbackOpts.idempotencyKey = idempotencyKey;
          const fallback = await apiRequest("donations/finalize", fallbackOpts);
          return { legacyFallback: true, fallback };
        } catch (fallbackErr) {
          const fs2 = Number(fallbackErr?.statusCode ?? 0);
          if (fs2 === 404 || fs2 === 405 || fs2 === 400) {
            return { legacyFallback: true, err: fallbackErr };
          }
          throw fallbackErr;
        }
      }
      if (status === 400) {
        return { legacyFallback: true, err };
      }
      throw err;
    }
  }, [data.donationId, data.pendingSessionId, data.payment, data.paymentMethod, update]);

  useEffect(() => {
    if (!sdkConfig.sdkKey) {
      setSdkState(PAYPAL_STATES.ERROR);
      setSdkError("PayPal client ID missing. Please refresh and try again.");
      return;
    }

    let cancelled = false;

    setSdkState(PAYPAL_STATES.LOADING);
    setSdkError(null);

    loadPayPalScript({
      clientId: sdkConfig.sdkKey,
      merchantId: "",
      currency,
      intent: isRecurring ? "authorize" : "capture",
      vault: isRecurring,
    })
      .then(() => {
        if (cancelled) return;
        setSdkState(PAYPAL_STATES.READY);
      })
      .catch((err) => {
        if (cancelled) return;
        setSdkState(PAYPAL_STATES.ERROR);
        setSdkError(err?.message ?? "Unable to load PayPal SDK");
      });

    return () => {
      cancelled = true;
      if (renderedButtonsRef.current && typeof renderedButtonsRef.current.close === "function") {
        try { renderedButtonsRef.current.close(); } catch (_) {}
      }
      renderedButtonsRef.current = null;
    };
  }, [sdkConfig.sdkKey, currency, isRecurring]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isRecurring) return;
    if (sdkState !== PAYPAL_STATES.READY) return;

    let storedRedirectUrl = "";
    try {
      const challenge = loadUnifiedChallengeFromSession();
      storedRedirectUrl =
        challenge?.redirectUrl ||
        challenge?.approvalUrl ||
        challenge?.challenge?.redirectUrl ||
        challenge?.challenge?.approvalUrl ||
        "";
      if (!storedRedirectUrl) {
        const last = sessionStorage.getItem("hc_last_challenge") || "";
        if (last) {
          const parsed = JSON.parse(last);
          storedRedirectUrl =
            parsed.redirectUrl ||
            parsed.challenge?.redirectUrl ||
            parsed.approvalUrl ||
            parsed.challenge?.approvalUrl ||
            "";
        }
      }
    } catch (_) {
      storedRedirectUrl = "";
    }

    const sdkRedirectTarget =
      (sdkConfig.redirectUrl || sdkConfig.approvalUrl ||
        responsePayment.redirectUrl || responsePayment.approvalUrl ||
        data.redirectUrl || data.approvalUrl ||
        data.paypalRedirectUrl || data.paypalApprovalUrl ||
        "")
        .toString()
        .trim();

    const target = String(storedRedirectUrl || sdkRedirectTarget || "").trim();
    if (!target) return;

    let disposed = false;
    const timer = window.setTimeout(() => {
      if (disposed) return;
      try {
        window.location.assign(target);
      } catch (_) {
        window.location.href = target;
      }
    }, 800);

    return () => {
      disposed = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [
    isRecurring,
    sdkState,
    sdkConfig.redirectUrl,
    sdkConfig.approvalUrl,
    responsePayment.redirectUrl,
    responsePayment.approvalUrl,
    data.redirectUrl,
    data.approvalUrl,
    data.paypalRedirectUrl,
    data.paypalApprovalUrl,
  ]);

  useEffect(() => {
    if (sdkState !== PAYPAL_STATES.READY) return;
    if (!buttonsContainerRef.current) return;
    if (typeof window === "undefined" || !window.paypal) return;

    const containerNode = buttonsContainerRef.current;
    let renderedButtons = null;

    if (renderedButtonsRef.current && typeof renderedButtonsRef.current.close === "function") {
      try { renderedButtonsRef.current.close(); } catch (_) {}
      renderedButtonsRef.current = null;
    }
    containerNode.innerHTML = "";

    const challengeIds = readSessionChallengeIds();
    const idempotencyKey = data.idempotencyKey ?? "";

    let buttonConfig = {};

    if (!isRecurring) {
      buttonConfig = {
        createOrder: () => {
          if (sdkConfig.orderId) return Promise.resolve(sdkConfig.orderId);
          return Promise.reject(new Error("Missing PayPal order. Please go back and re-submit."));
        },
        onApprove: async (paypalData, actions) => {
          setLoading(true);
          setError(null);
          try {
            const resolvedOrderId = paypalData?.orderID || paypalData?.orderId || sdkConfig.orderId;
            const resolvedPayerId = paypalData?.payerID || paypalData?.payerId || paypalData?.PayerID || "";

            let finalized;
            try {
              finalized = await finalizeOneTimeDonation({
                orderId: resolvedOrderId,
                payerId: resolvedPayerId,
                authChallengeId: challengeIds.authChallengeId,
                frontendReturnPayloadId: challengeIds.frontendReturnPayloadId,
                idempotencyKey,
              });
            } catch (finalizeErr) {
              console.warn("PayPal onApprove finalize call threw:", finalizeErr);
              const status = Number(finalizeErr?.statusCode ?? 0);
              if (status === 409 || status === 422 || status === 200) {
                finalized = { ok: true, status: "succeeded" };
              } else {
                throw finalizeErr;
              }
            }

            clearUnifiedChallengeSession();
            sessionStorage.setItem("hc_donation_done", "1");
            router.push("/donate/thank-you");
            return finalized;
          } catch (err) {
            setError(err?.message ?? "Payment finalization failed. Please try again.");
            return actions?.redirect ? actions.redirect() : null;
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          setError(err?.message ?? "PayPal payment encountered an error.");
          setLoading(false);
        },
        onCancel: () => {
          setError(null);
          setLoading(false);
        },
      };
    } else {
      const hasBillingAgreementToken = Boolean(sdkConfig.billingAgreementToken);
      const hasRedirectUrl = Boolean(sdkConfig.redirectUrl || sdkConfig.approvalUrl);

      if (hasBillingAgreementToken && window.paypal?.Buttons?.driver) {
        buttonConfig = {
          createBillingAgreement: () => Promise.resolve(sdkConfig.billingAgreementToken),
          onApprove: async (paypalData, actions) => {
            setLoading(true);
            setError(null);
            try {
              const resolvedSetupIntentId =
                paypalData?.billingToken ||
                paypalData?.billingAgreementToken ||
                paypalData?.ba_token ||
                sdkConfig.setupIntentId ||
                sdkConfig.billingAgreementToken;

              if (resolvedSetupIntentId) {
                update({ setupIntentId: resolvedSetupIntentId });
              }

              try {
                await finalizeSplitDonation({
                  setupIntentId: resolvedSetupIntentId || sdkConfig.setupIntentId || sdkConfig.billingAgreementToken || "",
                  authChallengeId: challengeIds.authChallengeId,
                  frontendReturnPayloadId: challengeIds.frontendReturnPayloadId,
                  idempotencyKey,
                });
              } catch (finalizeErr) {
                console.warn("PayPal split finalize call failed, continuing to thank-you:", finalizeErr);
              }

              clearUnifiedChallengeSession();
              sessionStorage.setItem("hc_donation_done", "1");
              router.push("/donate/thank-you");
            } catch (err) {
              setError(err?.message ?? "Billing agreement setup failed. Please try again.");
            } finally {
              setLoading(false);
            }
          },
          onError: (err) => {
            setError(err?.message ?? "PayPal billing agreement encountered an error.");
            setLoading(false);
          },
          onCancel: () => {
            setError(null);
            setLoading(false);
          },
        };
      } else {
        return;
      }
    }

    try {
      const buttons = window.paypal.Buttons(buttonConfig);
      if (buttons && buttons.render) {
        buttons.render(containerNode);
        renderedButtons = buttons;
        renderedButtonsRef.current = buttons;
      }
    } catch (renderErr) {
      setSdkState(PAYPAL_STATES.ERROR);
      setSdkError(renderErr?.message ?? "PayPal Buttons failed to render.");
    }

    return () => {
      if (renderedButtons && typeof renderedButtons.close === "function") {
        try { renderedButtons.close(); } catch (_) {}
      }
      renderedButtonsRef.current = null;
      if (containerNode) {
        containerNode.innerHTML = "";
      }
    };
  }, [
    sdkState,
    isRecurring,
    sdkConfig.orderId,
    sdkConfig.setupIntentId,
    sdkConfig.billingAgreementToken,
    sdkConfig.redirectUrl,
    sdkConfig.approvalUrl,
    finalizeOneTimeDonation,
    finalizeSplitDonation,
    update,
    router,
    data.idempotencyKey,
  ]);

  const handleChallengeDispatch = useCallback(() => {}, []);

  const handleChallengeExpire = useCallback(() => {
    setChallengeExpired(true);
    setError("Your security verification session has timed out. Please go back and re-submit your donation.");
    clearUnifiedChallengeSession();
  }, []);

  const splitRedirectTarget = sdkConfig.redirectUrl || sdkConfig.approvalUrl || "";

  if (!sdkConfig.sdkKey || typeof sdkConfig.sdkKey !== 'string' || sdkConfig.sdkKey.length < 8) {
    return (
      <div className="w-full border border-[#FECACA] rounded-xl bg-[#FEF2F2] px-4 py-6 text-center">
        <p className="text-[13px] font-semibold text-[#991B1B]">PayPal configuration is missing.</p>
        <p className="text-[12px] text-[#7F1D1D] mt-1">
          Please notify the site administrator. Reference: missing clientId ({String(sdkConfig.sdkKey || 'empty').slice(0, 8)}…)
        </p>
      </div>
    );
  }

  return (
    <UnifiedChallengeDispatcher
      challenge={data.unifiedChallenge ?? null}
      provider="paypal"
      onDispatch={handleChallengeDispatch}
      onExpire={handleChallengeExpire}
    >
      <div className="flex flex-col gap-5">
        {sdkState === PAYPAL_STATES.LOADING && (
          <div className="flex flex-col items-center gap-3 py-8">
            <svg className="animate-spin h-7 w-7 text-[#1A1A1A]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-[13px] text-[#737373]">Loading PayPal payment form…</p>
          </div>
        )}

        {sdkState === PAYPAL_STATES.ERROR && (
          <div className="rounded-xl border border-[#FFB4B4] bg-[#FFF5F5] px-4 py-3">
            <p className="text-[13px] text-[#EA3335]">{sdkError || "PayPal failed to load."}</p>
          </div>
        )}

        {sdkState === PAYPAL_STATES.READY && isRecurring && !Boolean(sdkConfig.billingAgreementToken) && splitRedirectTarget ? (
          <div className="flex flex-col items-center gap-4 py-3 text-center">
            <p className="text-[13px] text-[#737373]">
              You will be redirected to PayPal to approve your recurring billing agreement.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.assign(splitRedirectTarget);
                }
              }}
              className="cursor-pointer w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] active:scale-95 text-white text-[15px] font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Redirecting…</span>
                </>
              ) : (
                <>Go to PayPal now ({sym}{(grandTotal ?? 0).toFixed(2)}/installment)</>
              )}
            </button>
          </div>
        ) : (
          <div ref={buttonsContainerRef} className="min-h-[120px] flex items-center justify-center" />
        )}

        {challengeExpired && (
          <p className="text-[13px] text-[#B45309] bg-[#FFF8E1] border border-[#FFE082] rounded-xl px-4 py-3">
            Your verification window expired. No charge was made — please return to the previous step and try again.
          </p>
        )}

        {error && (
          <p className="text-[13px] text-[#EA3335] bg-[#FFF5F5] border border-[#FFCCCC] rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {!isRecurring && sdkState === PAYPAL_STATES.READY && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] px-4 py-3 mt-2">
            <svg className="w-4 h-4 text-[#737373]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span className="text-[12px] text-[#737373]">
              Pay {sym}{(grandTotal ?? 0).toFixed(2)} securely via PayPal
            </span>
          </div>
        )}
      </div>
    </UnifiedChallengeDispatcher>
  );
};

export default PayPalCheckoutForm;
