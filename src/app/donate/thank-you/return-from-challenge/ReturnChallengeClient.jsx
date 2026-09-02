"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useDonation } from "@/context/DonationContext";
import { apiRequest } from "@/services/api";
import {
  loadReturnSession,
  loadDonorReturnParams,
  loadUnifiedChallengeFromSession,
  clearUnifiedChallengeSession,
  extractDonorReturnParamsFromQuery,
} from "@/components/payment/UnifiedChallengeDispatcher";
import ReturnChallengeResultCard, { OUTCOMES } from "@/components/payment/ReturnChallengeResultCard";
import CountdownTimer from "@/components/common/CountdownTimer";
import { getUserFacingErrorMessage } from "@/utils/errorMaps";

const RETURN_QUERY_PARAMS = ["PayerID", "token", "paymentId", "customId", "provider"];
const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

function collectReturnQueryParams(rawSearchParams) {
  const collected = {};
  if (!rawSearchParams) return collected;
  RETURN_QUERY_PARAMS.forEach((key) => {
    try {
      const value = rawSearchParams.get(key);
      if (value !== null && value !== undefined) {
        collected[key] = value;
      }
    } catch {}
  });
  const extras = ["donationId", "pendingSessionId", "authChallengeId", "frontendReturnPayloadId", "setup_intent", "setupIntentId", "payment_intent", "paymentIntentId", "donorEmail", "orderId", "gatewayConfigurationId"];
  extras.forEach((key) => {
    try {
      const value = rawSearchParams.get(key);
      if (value !== null && value !== undefined) {
        collected[key] = value;
      }
    } catch {}
  });
  return collected;
}

function detectSessionMismatch({ returnSession, queryReturnParams, sessionChallenge }) {
  const mismatches = [];
  if (returnSession?.authChallengeId) {
    const qAuth = queryReturnParams.authChallengeId ?? null;
    const sAuth = sessionChallenge?.authChallengeId ?? null;
    if (qAuth && returnSession.authChallengeId !== qAuth) mismatches.push("authChallengeId");
    if (sAuth && returnSession.authChallengeId !== sAuth) mismatches.push("session authChallengeId");
  }
  if (returnSession?.frontendReturnPayloadId) {
    const qPayload = queryReturnParams.frontendReturnPayloadId ?? null;
    const sPayload = sessionChallenge?.frontendReturnPayloadId ?? null;
    if (qPayload && returnSession.frontendReturnPayloadId !== qPayload) mismatches.push("frontendReturnPayloadId");
    if (sPayload && returnSession.frontendReturnPayloadId !== sPayload) mismatches.push("session frontendReturnPayloadId");
  }
  if (returnSession?.pendingSessionId) {
    const qPending = queryReturnParams.pendingSessionId ?? null;
    if (qPending && returnSession.pendingSessionId !== qPending) mismatches.push("pendingSessionId");
  }
  return mismatches;
}

const ReturnChallengeClient = () => {
  const router = useRouter();
  const rawSearchParams = useSearchParams();
  const { data, update } = useDonation();

  const [outcome, setOutcome] = useState(null);
  const [outcomeResult, setOutcomeResult] = useState({});
  const [failureDetail, setFailureDetail] = useState({ failureCode: null, technicalMessage: "", resolution: null });
  const [finalizing, setFinalizing] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionWarnings, setSessionWarnings] = useState([]);
  const [attempt, setAttempt] = useState(0);
  const finalizeRef = useRef(false);
  const debugRef = useRef({ steps: [] });

  const sym = CURRENCY_SYMBOLS[data.currency] || "$";
  const donationAmount = Number(data.grandTotal ?? data.amountTier ?? 0);

  const queryReturnParams = useMemo(
    () => collectReturnQueryParams(rawSearchParams),
    [rawSearchParams]
  );

  const queryDonorReturnParams = useMemo(
    () => extractDonorReturnParamsFromQuery(rawSearchParams),
    [rawSearchParams]
  );

  const mergedDonorReturnParams = useMemo(() => {
    const fromSession = loadDonorReturnParams() ?? {};
    return { ...fromSession, ...queryDonorReturnParams };
  }, [queryDonorReturnParams]);

  const returnSession = useMemo(() => loadReturnSession(), []);
  const sessionChallenge = useMemo(() => loadUnifiedChallengeFromSession(), []);

  const donorEmail = outcomeResult?.donorEmail ?? mergedDonorReturnParams?.email ?? returnSession?.donorEmail ?? queryReturnParams.donorEmail ?? data.email ?? "";

  const provider =
    queryReturnParams.provider ??
    returnSession?.provider ??
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("provider")
      : null) ??
    (queryReturnParams.PayerID ? "paypal" : "stripe");

  const isPayPal = provider === "paypal";

  const mismatchDetected = useMemo(() => {
    return detectSessionMismatch({ returnSession, queryReturnParams, sessionChallenge });
  }, [returnSession, queryReturnParams, sessionChallenge]);

  const tamperRisk = useMemo(() => {
    const noSession = !returnSession && !sessionChallenge;
    if (noSession && (queryReturnParams.donationId || queryReturnParams.pendingSessionId || queryReturnParams.paymentId)) {
      return "NO_RETURN_SESSION";
    }
    if (mismatchDetected.length > 0) {
      return `SESSION_MISMATCH:${mismatchDetected.join(",")}`;
    }
    if (returnSession?.tamperRisk) return returnSession.tamperRisk;
    return null;
  }, [returnSession, sessionChallenge, queryReturnParams, mismatchDetected]);

  useEffect(() => {
    if (tamperRisk) {
      setSessionWarnings(Array.isArray(mismatchDetected) && mismatchDetected.length > 0
        ? mismatchDetected
        : [tamperRisk]);
      setFinalizing(false);
      setOutcome(OUTCOMES.SESSION_MISMATCH);
      setOutcomeResult({
        queryParams: { ...queryReturnParams },
        sessionFields: {
          authChallengeId: returnSession?.authChallengeId ?? null,
          frontendReturnPayloadId: returnSession?.frontendReturnPayloadId ?? null,
          pendingSessionId: returnSession?.pendingSessionId ?? null,
          donationId: returnSession?.donationId ?? null,
        },
        tamperRisk,
        provider,
      });
      finalizeRef.current = true;
    }
  }, [tamperRisk, queryReturnParams, returnSession, provider, mismatchDetected]);

  const sessionExpiresAt = returnSession?.expiresAt ?? sessionChallenge?.expiresAt ?? returnSession?.ttlUntil ?? null;

  const buildFinalizeBody = useCallback(() => {
    const body = {};

    if (isPayPal) {
      if (queryReturnParams.PayerID) body.payerId = queryReturnParams.PayerID;
      if (queryReturnParams.token) body.paypalToken = queryReturnParams.token;
      if (queryReturnParams.paymentId) body.paymentId = queryReturnParams.paymentId;
      if (queryReturnParams.customId) body.customId = queryReturnParams.customId;
      const resolvedOrderId =
        queryReturnParams.orderId ??
        data.paypalOrderId ??
        queryReturnParams.paymentId ??
        sessionChallenge?.orderId ??
        returnSession?.orderId ??
        null;
      if (resolvedOrderId) body.orderId = resolvedOrderId;
      body.paymentProvider = "paypal";
    }

    const authChallengeId =
      queryReturnParams.authChallengeId ??
      returnSession?.authChallengeId ??
      sessionChallenge?.authChallengeId ??
      data.authChallengeId ??
      null;
    const frontendReturnPayloadId =
      queryReturnParams.frontendReturnPayloadId ??
      returnSession?.frontendReturnPayloadId ??
      sessionChallenge?.frontendReturnPayloadId ??
      data.frontendReturnPayloadId ??
      null;
    const pendingSessionId =
      queryReturnParams.pendingSessionId ?? returnSession?.pendingSessionId ?? data.pendingSessionId ?? null;
    const donationId =
      queryReturnParams.donationId ?? returnSession?.donationId ?? data.donationId ?? null;
    const setupIntentId =
      queryReturnParams.setup_intent ??
      queryReturnParams.setupIntentId ??
      data.setupIntentId ??
      sessionChallenge?.setupIntentId ??
      returnSession?.setupIntentId ??
      null;
    const paymentIntentId =
      queryReturnParams.payment_intent ??
      queryReturnParams.paymentIntentId ??
      sessionChallenge?.paymentIntentId ??
      returnSession?.paymentIntentId ??
      null;
    const gatewayConfigurationId =
      queryReturnParams.gatewayConfigurationId ??
      data.gatewayConfigurationId ??
      sessionChallenge?.gatewayConfigurationId ??
      returnSession?.gatewayConfigurationId ??
      null;

    if (authChallengeId) body.authChallengeId = authChallengeId;
    if (frontendReturnPayloadId) body.frontendReturnPayloadId = frontendReturnPayloadId;
    if (pendingSessionId) body.pendingSessionId = pendingSessionId;
    if (donationId) body.donationId = donationId;
    if (setupIntentId) body.setupIntentId = setupIntentId;
    if (paymentIntentId) body.paymentIntentId = paymentIntentId;
    if (gatewayConfigurationId) body.gatewayConfigurationId = gatewayConfigurationId;

    const hasDonorParams =
      mergedDonorReturnParams && Object.keys(mergedDonorReturnParams).length > 0;
    if (hasDonorParams) {
      body.donorReturnParams = { ...mergedDonorReturnParams };
    }

    const paymentType = returnSession?.paymentMode ?? data.paymentType;
    const isSplit = paymentType === "split" || paymentType === "recurring" || !!setupIntentId;
    body.paymentMode = isSplit ? "split" : "one_time";

    body.orchestrationReturned = true;
    body.returnSource = provider;

    return body;
  }, [
    isPayPal,
    queryReturnParams,
    returnSession,
    sessionChallenge,
    data,
    mergedDonorReturnParams,
    provider,
  ]);

  const classFinalizeErrorToOutcome = useCallback((err) => {
    const status = Number(err?.statusCode ?? err?.status ?? 0);
    const code = String(err?.code ?? err?.errorCode ?? "");
    if (status === 410 || status === 408 || code === "CHALLENGE_EXPIRED" || code === "SESSION_EXPIRED") {
      return { outcome: OUTCOMES.EXPIRED };
    }
    if (status === 498 || status === 403 && (code === "INVALID_PAYLOAD_SIGNATURE" || code === "FRONTEND_PAYLOAD_MISMATCH" || code === "AUTH_CHALLENGE_MISMATCH")) {
      return { outcome: OUTCOMES.SESSION_MISMATCH, tamperReason: code };
    }
    if (status >= 400 && status < 500) {
      const userFacing = getUserFacingErrorMessage(code || status, err.message || "");
      return {
        outcome: OUTCOMES.FAILURE,
        failureDetail: {
          failureCode: code || status || "FINALIZE_4XX_FAILED",
          technicalMessage: err.technical || err.message || "",
          userMessage: userFacing,
        },
      };
    }
    if (status >= 500 || !status) {
      return {
        outcome: OUTCOMES.GENERIC_ERROR,
        failureDetail: {
          failureCode: code || status || "NETWORK_OR_SERVER_ERROR",
          technicalMessage: err.technical || err.message || "Network error. Please check your connection.",
        },
      };
    }
    return {
      outcome: OUTCOMES.FAILURE,
      failureDetail: { failureCode: "UNKNOWN", technicalMessage: err.message || "" },
    };
  }, []);

  useEffect(() => {
    if (tamperRisk) return;
    if (finalizeRef.current) return;
    if (attempt > 2) return;
    finalizeRef.current = true;

    const body = buildFinalizeBody();
    debugRef.current.steps.push({ body, ts: Date.now() });

    (async () => {
      setFinalizing(true);
      try {
        const endpoint =
          body.paymentMode === "split" ? "donations/finalize" : "donations/finalize-onetime";
        const opts = { method: "POST", body: JSON.stringify(body) };
        if (data.idempotencyKey) opts.idempotencyKey = data.idempotencyKey;

        let res;
        try {
          res = await apiRequest(endpoint, opts);
        } catch (firstErr) {
          if (firstErr && (firstErr.statusCode === 404 || firstErr.statusCode === 405) && endpoint === "donations/finalize-onetime") {
            res = await apiRequest("donations/finalize", opts);
          } else {
            throw firstErr;
          }
        }

        const payload = res?.data ?? res ?? {};
        const donationId =
          payload?.donationId ?? queryReturnParams.donationId ?? data.donationId ?? null;
        const finalizedId = donationId ?? "returned-challenge";
        const receipt = {
          ...payload,
          donationId: finalizedId,
          amount: payload.amount ?? payload.grandTotal ?? payload.amountMinor ? (payload.amountMinor / 100) : donationAmount,
          currency: payload.currency ?? data.currency ?? "USD",
          paymentType: body.paymentMode === "split" ? "recurring" : "one_time",
          isSplit: body.paymentMode === "split",
          paymentMode: body.paymentMode,
          donorEmail: mergedDonorReturnParams?.email ?? returnSession?.donorEmail ?? queryReturnParams.donorEmail ?? data.email ?? "",
          provider,
          receiptId: payload.receiptId ?? finalizedId,
        };

        update({
          finalizedDonationId: finalizedId,
          donationId: finalizedId,
          ...(body.setupIntentId && { setupIntentId: body.setupIntentId }),
          ...(body.paymentIntentId && { stripeClientSecret: body.paymentIntentId }),
          finalizeResult: payload,
        });

        try {
          clearUnifiedChallengeSession();
          sessionStorage.setItem("hc_donation_done", "1");
          sessionStorage.setItem("hc_finalize_result", JSON.stringify(payload));
          sessionStorage.setItem("hc_thankyou_result", JSON.stringify({ status: "success", paymentMode: body.paymentMode }));
        } catch {}

        setOutcomeResult({ receipt, finalizeResponse: payload, provider });
        setOutcome(OUTCOMES.SUCCESS);
        setFinalizing(false);
      } catch (err) {
        console.error("[return-challenge] finalize error", err);
        debugRef.current.steps.push({ error: String(err?.message || err), err, ts: Date.now() });

        const classification = classFinalizeErrorToOutcome(err);
        setOutcome(classification.outcome);
        if (classification.outcome === OUTCOMES.EXPIRED) {
          setSessionExpired(true);
          setOutcomeResult({
            expiresAt: sessionExpiresAt,
            challengeId: returnSession?.authChallengeId ?? queryReturnParams.authChallengeId,
          });
        } else if (classification.outcome === OUTCOMES.SESSION_MISMATCH) {
          setOutcomeResult({
            sessionFields: {
              authChallengeId: returnSession?.authChallengeId ?? null,
              frontendReturnPayloadId: returnSession?.frontendReturnPayloadId ?? null,
              pendingSessionId: returnSession?.pendingSessionId ?? null,
            },
            queryParams: { ...queryReturnParams },
            tamperReason: classification.tamperReason,
          });
          setSessionWarnings([classification.tamperReason || "PAYLOAD_VERIFICATION_FAILED"]);
        } else if (classification.outcome === OUTCOMES.FAILURE) {
          const fd = classification.failureDetail || {};
          setFailureDetail(fd);
          setOutcomeResult({
            failureCode: fd.failureCode,
            userMessage: fd.userMessage || err?.message,
            technicalMessage: fd.technicalMessage,
            provider,
          });
        } else {
          const fd = classification.failureDetail || {};
          setFailureDetail(fd);
          setOutcomeResult({
            technicalMessage: fd.technicalMessage || err?.message || "Unable to connect.",
            retryEndpoint: body.paymentMode === "split" ? "donations/finalize" : "donations/finalize-onetime",
          });
        }

        finalizeRef.current = false;
        setFinalizing(false);
      }
    })();
  }, [attempt, buildFinalizeBody, data.idempotencyKey, data.donationId, data.currency, data.email, donationAmount, router, update, classFinalizeErrorToOutcome, mergedDonorReturnParams, returnSession, queryReturnParams, provider, tamperRisk, sessionExpiresAt]);

  const handleRetryFinalize = useCallback(() => {
    finalizeRef.current = false;
    setOutcome(null);
    setFailureDetail({ failureCode: null, technicalMessage: "" });
    setAttempt((n) => n + 1);
  }, []);

  const handleManualVerifyAndFinalize = useCallback(() => {
    setSessionWarnings([]);
    setOutcome(null);
    finalizeRef.current = false;
    setAttempt((n) => n + 1);
  }, []);

  const handleRetryPayment = useCallback(() => {
    try { clearUnifiedChallengeSession(); } catch (_) {}
    router.replace("/donate");
  }, [router]);

  const handleEmailSecureRetryLink = useCallback(async () => {
    try {
      const email = donorEmail || outcomeResult?.receipt?.donorEmail || mergedDonorReturnParams?.email || data.email;
      const donationId = outcomeResult?.receipt?.donationId ?? queryReturnParams.donationId ?? data.donationId;
      if (!email) return;
      const endpoint = donationId
        ? `donations/${encodeURIComponent(donationId)}/retry-link?email=${encodeURIComponent(email)}`
        : `donations/retry-link?email=${encodeURIComponent(email)}`;
      await apiRequest(endpoint, { method: "POST" });
      setFailureDetail((prev) => ({ ...prev, emailRetrySent: true }));
      setOutcomeResult((prev) => ({ ...prev, emailRetrySent: true, email }));
    } catch (err) {
      console.warn(err);
    }
  }, [donorEmail, outcomeResult, mergedDonorReturnParams, data.email, queryReturnParams.donationId, data.donationId]);

  const handleNavigateSchedules = useCallback(() => router.replace("/dashboard/schedules"), [router]);
  const handleNavigateHome = useCallback(() => router.replace("/"), [router]);
  const handleNavigateThankYou = useCallback(() => router.replace("/donate/thank-you"), [router]);

  return (
    <main className="min-h-screen bg-[#F6F6F6] flex items-start justify-center py-16 px-4 sm:px-6">
      <div className="relative w-full max-w-[640px] flex flex-col gap-6">
        <div className="relative left-0 top-0 pointer-events-none select-none z-[1] hidden md:block absolute -left-40 -top-16 opacity-60">
          <Image
            src="/images/left-celebration-background.png"
            alt=""
            width={240}
            height={400}
            className="h-auto w-auto object-contain"
          />
        </div>

        {sessionExpiresAt && !sessionExpired && (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#6B7280] font-semibold mb-0.5">
                  Challenge window
                </p>
                <p className="text-[13px] text-[#374151]">
                  Finalize your payment before the countdown ends.
                </p>
              </div>
              <div className="min-w-[220px]">
                <CountdownTimer expiresAt={sessionExpiresAt} onExpire={() => setSessionExpired(true)} />
              </div>
            </div>
          </div>
        )}

        {sessionExpired && (
          <div className="bg-[#FFF5F5] border border-[#FECACA] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#EA3335] shrink-0">
                <path d="M12 8v5m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[13px] text-[#EA3335] font-medium">
                Session expired. Start a new donation.
              </p>
            </div>
          </div>
        )}

        {finalizing && !outcome && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-[#FFF8E1] via-[#FFF3E0] to-[#FFECB3] px-8 py-10 flex flex-col items-center gap-4 border-b border-[#FFE082]/40">
              <div className="relative w-[88px] h-[88px] rounded-full bg-white shadow-sm flex items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-[#003087]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-[22px] font-bold text-[#111827]">
                  Finalizing your donation…
                </h1>
                <p className="text-[13px] text-[#6B7280] max-w-[360px] leading-relaxed">
                  Please wait while we confirm your payment with {isPayPal ? "PayPal" : "our payment processor"} and finalize your receipt.
                </p>
              </div>
            </div>
            <div className="px-8 py-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-[#6B7280] text-[11px] uppercase tracking-wide font-medium">Donation</span>
                  <span className="text-[#111827] font-semibold text-[15px]">{sym}{donationAmount.toFixed(2)}</span>
                </div>
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-[#6B7280] text-[11px] uppercase tracking-wide font-medium">Provider</span>
                  <span className="text-[#111827] font-semibold capitalize">{provider}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {outcome && (
          <ReturnChallengeResultCard
            outcome={outcome}
            result={outcomeResult}
            failureDetail={failureDetail}
            sessionWarnings={sessionWarnings}
            provider={provider}
            sessionExpiresAt={sessionExpiresAt}
            onRetryFinalize={handleRetryFinalize}
            onManualVerify={handleManualVerifyAndFinalize}
            onRetryPayment={handleRetryPayment}
            onEmailRetryLink={handleEmailSecureRetryLink}
            onNavigateSchedules={handleNavigateSchedules}
            onNavigateHome={handleNavigateHome}
            onNavigateThankYou={handleNavigateThankYou}
            contactSupportUrl="/contact"
            donorEmail={donorEmail}
          />
        )}
      </div>
    </main>
  );
};

export default ReturnChallengeClient;
