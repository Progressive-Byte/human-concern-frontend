"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useDonation } from "@/context/DonationContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import { getReceiptDetail } from "@/services/donationService";
import { apiBase } from "@/utils/constants";
import { CircleCheckIcon, ShareCampaignIcon, DashboardTabIcon, BrowserIcon } from "@/components/common/SvgIcon";
import PaymentReceiptCard from "@/components/thank-you/PaymentReceiptCard";
import SmartRetryInfoBanner from "@/components/thank-you/SmartRetryInfoBanner";
import FailoverBanner from "@/components/thank-you/FailoverBanner";
import PendingRetryScheduleCard from "@/components/thank-you/PendingRetryScheduleCard";
import FailedPaymentCard from "@/components/thank-you/FailedPaymentCard";
import CampaignsSection from "./components/CampaignsSection";
import FinalizeScreen from "./components/FinalizeScreen";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };
const FREQUENCY_LABELS = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };

const DISPATCH_STATES = {
  SUCCESS: "SUCCESS",
  PENDING_RETRY_SCHEDULED: "PENDING_RETRY_SCHEDULED",
  FAILED: "FAILED",
};

function loadLocalDonationState() {
  if (typeof window === "undefined") return {};
  try {
    // ReturnChallengeClient writes these to sessionStorage — read the same store.
    const raw =
      sessionStorage.getItem("hc_finalize_result") ||
      sessionStorage.getItem("hc_thankyou_result") ||
      sessionStorage.getItem("hc_donation_done");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

const ThankYouClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, update } = useDonation();
  const { isAuthenticated } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");
  const [finalizeAttempt, setFinalizeAttempt] = useState(0);
  const [finalizeResult, setFinalizeResult] = useState(null);
  const [failoverOccurred, setFailoverOccurred] = useState(false);
  const [failoverPath, setFailoverPath] = useState("");
  const [smartRetryActive, setSmartRetryActive] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [receiptError, setReceiptError] = useState("");
  const [receiptAttempt, setReceiptAttempt] = useState(0);

  const receiptTargetRef = useRef(null);

  const sym = CURRENCY_SYMBOLS[data.currency] || "$";
  const donationAmount = data.grandTotal ?? data.amountTier;
  const isRecurring = data.paymentType === "recurring";
  const frequency = FREQUENCY_LABELS[data.frequency?.toLowerCase()] ?? data.frequency ?? "";
  const numberOfDays = data.numberOfDays ?? 0;
  const campaignTitle = data.campaignTitle ?? "";
  const donorEmail = data.email ?? data.donorEmail ?? "";
  const donationId = data.donationId ?? data.finalizedDonationId ?? "";

  const finalizeRef = useRef(false);

  const resolvedSetupIntentId = useMemo(() => {
    const fromState = String(data.setupIntentId || "").trim();
    if (fromState) return fromState;
    if (typeof window === "undefined") return "";
    try {
      const sp = searchParams?.get("setup_intent") || new URLSearchParams(window.location.search).get("setup_intent");
      return String(sp || "").trim();
    } catch {
      return "";
    }
  }, [data.setupIntentId, searchParams]);

  const pendingSessionId = useMemo(() => String(data.pendingSessionId || "").trim(), [data.pendingSessionId]);

  const needsFinalize = Boolean(
    isRecurring && pendingSessionId && resolvedSetupIntentId && !String(data.finalizedDonationId || "").trim()
  );

  const dispatchState = useMemo(() => {
    const qsStatus = String(searchParams?.get("status") || "").toLowerCase();
    if (qsStatus === "scheduled" || qsStatus === "pending_retry_scheduled") {
      return DISPATCH_STATES.PENDING_RETRY_SCHEDULED;
    }
    if (qsStatus === "failed" || qsStatus === "error" || qsStatus === "declined") {
      return DISPATCH_STATES.FAILED;
    }

    const local = loadLocalDonationState();
    const localStatus = String(local.status || local.state || "").toLowerCase();
    if (localStatus.includes("scheduled") || localStatus.includes("pending_retry")) {
      return DISPATCH_STATES.PENDING_RETRY_SCHEDULED;
    }
    if (localStatus.includes("failed") || localStatus.includes("declined") || localStatus.includes("error")) {
      return DISPATCH_STATES.FAILED;
    }
    if (finalizeResult) {
      const fStatus = String(finalizeResult.status || "").toLowerCase();
      if (fStatus.includes("scheduled") || fStatus.includes("pending_retry")) {
        return DISPATCH_STATES.PENDING_RETRY_SCHEDULED;
      }
      if (fStatus.includes("failed") || fStatus.includes("declined") || fStatus.includes("error")) {
        return DISPATCH_STATES.FAILED;
      }
    }

    return DISPATCH_STATES.SUCCESS;
  }, [searchParams, finalizeResult]);

  const challengeData = useMemo(() => {
    const local = loadLocalDonationState();
    return {
      status:
        searchParams?.get("challenge") ||
        searchParams?.get("failure") ||
        local.challenge?.status ||
        local.failure?.status ||
        finalizeResult?.challenge?.status ||
        finalizeResult?.failureStatus ||
        (dispatchState === DISPATCH_STATES.FAILED ? "failed" : "pending_retry_scheduled"),
      errorCode:
        searchParams?.get("error_code") ||
        searchParams?.get("code") ||
        local.challenge?.errorCode ||
        local.failure?.code ||
        finalizeResult?.errorCode ||
        finalizeResult?.failureCode ||
        local.errorCode ||
        "",
      rawError: local.errorMessage || finalizeResult?.errorMessage || "",
      nextRetryAt:
        searchParams?.get("retry_at") ||
        local.nextRetryAt ||
        local.scheduledRetryAt ||
        finalizeResult?.nextRetryAt ||
        finalizeResult?.retryScheduledAt ||
        null,
      attemptNumber: Number(
        searchParams?.get("attempt") || local.attemptNumber || finalizeResult?.attemptNumber || 1
      ),
      maxAttempts: Number(
        searchParams?.get("max_attempts") || local.maxAttempts || finalizeResult?.maxAttempts || 3
      ),
      donationId:
        searchParams?.get("donationId") ||
        searchParams?.get("donation_id") ||
        local.donationId ||
        finalizeResult?.donationId ||
        donationId ||
        "",
    };
  }, [searchParams, finalizeResult, donationId, dispatchState]);

  const clearDonationSession = () => {
    try {
      sessionStorage.removeItem("hc_donation_done");
      sessionStorage.removeItem("hc_donation");
    } catch {}
  };

  const handleRetry = () => {
    finalizeRef.current = false;
    setFinalizeError("");
    setFinalizeAttempt((n) => n + 1);
  };

  useEffect(() => {
    if (!needsFinalize || finalizeRef.current) return;
    finalizeRef.current = true;

    (async () => {
      setFinalizeLoading(true);
      setFinalizeError("");
      try {
        const res = await apiRequest("donations/finalize", {
          method: "POST",
          body: JSON.stringify({ pendingSessionId, setupIntentId: resolvedSetupIntentId }),
        });
        const result = res?.data ?? res ?? {};
        const resolvedDonationId =
          result?.donationId ?? result?.data?.donationId ?? null;

        const meta = result?.meta || result?.metadata || {};
        if (meta?.failoverOccurred) {
          setFailoverOccurred(true);
          setFailoverPath(meta?.providerFallbackPath || "");
        }
        if (meta?.smartRetryActive) {
          setSmartRetryActive(true);
        }

        setFinalizeResult(result);
        update({
          finalizedDonationId: resolvedDonationId ?? "1",
          donationId: resolvedDonationId ?? data.donationId ?? null,
          setupIntentId: resolvedSetupIntentId,
        });
        setFinalizeLoading(false);
      } catch (e) {
        setFinalizeLoading(false);
        setFinalizeError(e?.message || "Unable to finalize your donation. Please try again.");
        finalizeRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsFinalize, finalizeAttempt]);

  // Load the receipt (JSON) for this donation. The target is captured once, before the wizard
  // session is cleared, so the request still has the donation id/email it needs.
  useEffect(() => {
    if (dispatchState !== DISPATCH_STATES.SUCCESS) return;
    if (needsFinalize || finalizeLoading || finalizeError) return;

    if (!receiptTargetRef.current) {
      const id = String(
        finalizeResult?.donationId ??
          data.finalizedDonationId ??
          data.donationId ??
          challengeData.donationId ??
          ""
      ).trim();
      if (!id) return;
      receiptTargetRef.current = { donationId: id, email: String(donorEmail || "").trim() };
    }

    const target = receiptTargetRef.current;
    let alive = true;
    setReceiptError("");
    getReceiptDetail(target)
      .then((res) => {
        if (!alive) return;
        setReceipt(res?.data?.receipt || null);
      })
      .catch((e) => {
        if (!alive) return;
        setReceipt(null);
        setReceiptError(e?.message || "We couldn't load your receipt right now.");
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatchState, needsFinalize, finalizeLoading, finalizeError, receiptAttempt, isAuthenticated]);

  useEffect(() => {
    fetch(`${apiBase}campaigns/featured`)
      .then((r) => r.json())
      .then((res) => setCampaigns(res?.data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Clear the wizard session once we're on the success screen — for guests AND signed-in donors
  // (the receipt request above already captured what it needs).
  useEffect(() => {
    if (needsFinalize || finalizeLoading || finalizeError) return;
    if (dispatchState !== DISPATCH_STATES.SUCCESS) return;
    clearDonationSession();
  }, [needsFinalize, finalizeLoading, finalizeError, dispatchState]);

  const handleShare = async () => {
    const url = window.location.origin + "/campaigns";
    if (navigator.share) {
      await navigator.share({ title: campaignTitle || "Human Concern", url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRetryNow = () => {
    const params = new URLSearchParams();
    if (donationAmount) params.set("amount", String(donationAmount));
    if (data.currency) params.set("currency", data.currency);
    if (donorEmail) params.set("email", donorEmail);
    if (challengeData.donationId) params.set("retry_donation", challengeData.donationId);
    router.replace(`/donate/step3?${params.toString()}`);
  };

  const handleCancelRetry = async (id) => {
    if (!id) return;
    await apiRequest(`donations/${id}/cancel-retry`, { method: "POST" });
  };

  if (isAuthenticated && (needsFinalize || finalizeLoading || finalizeError)) {
    return (
      <FinalizeScreen
        loading={finalizeLoading}
        error={finalizeError}
        onRetry={handleRetry}
        onGoHistory={() => router.replace("/dashboard/donation-history")}
      />
    );
  }

  const effectiveDonationId = challengeData.donationId || donationId;

  return (
    <main className="min-h-screen bg-[#F6F6F6] pb-20">
      <div
        className={`relative w-full overflow-hidden pt-[100px] sm:pt-[120px] md:pt-[140px] lg:pt-[160px] pb-16 px-4 sm:px-6 ${
          dispatchState === DISPATCH_STATES.PENDING_RETRY_SCHEDULED ? "" : ""
        }`}
      >
        {dispatchState === DISPATCH_STATES.SUCCESS && (
          <>
            <div className="absolute left-0 top-0 h-full pointer-events-none select-none z-[1] hidden md:block">
              <Image
                src="/images/left-celebration-background.png"
                alt=""
                width={320}
                height={600}
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="absolute right-0 top-0 h-full pointer-events-none select-none z-[1] hidden md:block">
              <Image
                src="/images/right-celebration-background.png"
                alt=""
                width={320}
                height={600}
                className="h-full w-auto object-contain"
              />
            </div>
          </>
        )}

        <div className="relative z-20 flex items-center justify-center">
          <div className="relative w-full max-w-[1100px] flex flex-col items-center">
            {dispatchState === DISPATCH_STATES.SUCCESS && (
              <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="relative w-full md:w-[52%] md:max-w-[580px] h-[240px] sm:h-[320px] md:h-[600px] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/happy-thankyou.png"
                    alt="Happy children"
                    fill
                    sizes="(max-width: 768px) 100vw, 46vw"
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="relative z-20 w-full md:w-[50%] md:max-w-[520px] flex flex-col gap-5 mt-4 md:-ml-[12%] lg:-ml-[15%] md:mt-[20px]">
                  <div className="w-full bg-white rounded-2xl px-5 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10 flex flex-col items-center text-center shadow-2xl">
                    <div className="mt-3">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="30" fill="#055A46" fillOpacity="0.1" stroke="#055A46" strokeWidth="2" />
                        <path d="M20 33L28 41L44 25" stroke="#055A46" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h1 className="text-[24px] sm:text-[28px] md:text-[34px] font-bold text-[#383838] mt-6">
                      Thank You!
                    </h1>
                    <p className="text-[13px] sm:text-[14px] text-[#737373] mt-2 mb-5">
                      Your donation of{" "}
                      {donationAmount ? (
                        <span className="font-bold text-[#383838]">
                          {sym}
                          {Number(donationAmount).toFixed(2)}
                        </span>
                      ) : (
                        "your generous amount"
                      )}{" "}
                      {finalizeLoading ? "is being finalized." : "has been processed successfully."}
                    </p>

                    <div className="w-full bg-[#F6F6F6] rounded-xl px-4 py-4 mb-5 text-left">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AEAEAE] mb-3">
                        Donation Summary
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[12px] text-[#737373] shrink-0 pt-0.5">Campaign</span>
                          <span
                            className="text-[13px] font-semibold text-[#383838] text-right min-w-0 truncate"
                            title={campaignTitle || "—"}
                          >
                            {campaignTitle || "—"}
                          </span>
                        </div>
                        {isRecurring && frequency && (
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[12px] text-[#737373] shrink-0 pt-0.5">Frequency</span>
                            <span className="text-[13px] font-semibold text-[#383838] text-right shrink-0">
                              {frequency}
                            </span>
                          </div>
                        )}
                        {isRecurring && numberOfDays > 0 && (
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[12px] text-[#737373] shrink-0 pt-0.5">Duration</span>
                            <span className="text-[13px] font-semibold text-[#383838] text-right shrink-0 whitespace-nowrap">
                              {numberOfDays} days
                            </span>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-3 pt-2 border-t border-[#E5E5E5] mt-1">
                          <span className="text-[12px] text-[#737373] shrink-0 pt-0.5">Total</span>
                          <span className="text-[14px] font-bold text-[#055A46] text-right shrink-0 whitespace-nowrap">
                            {sym}
                            {donationAmount ? Number(donationAmount).toFixed(2) : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 w-full">
                      <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#383838] hover:bg-[#222] text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
                      >
                        {DashboardTabIcon}
                        View Dashboard
                      </button>
                      <button
                        onClick={() => router.push("/campaigns")}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EA3335] hover:bg-red-700 text-white text-[14px] font-semibold transition-colors active:scale-95 cursor-pointer"
                      >
                        {BrowserIcon}
                        Browse Campaigns
                      </button>
                      <button
                        onClick={handleShare}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-[14px] font-medium transition-all duration-200 active:scale-95 cursor-pointer ${
                          copied
                            ? "bg-[#055A46] border-[#055A46] text-white"
                            : "border-[#E5E5E5] hover:border-gray-400 text-[#383838]"
                        }`}
                      >
                        {copied ? (
                          <>
                            {CircleCheckIcon} Link Copied!
                          </>
                        ) : (
                          <>
                            {ShareCampaignIcon} Share Campaign
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dispatchState === DISPATCH_STATES.PENDING_RETRY_SCHEDULED && (
              <div className="w-full max-w-[820px]">
                <PendingRetryScheduleCard
                  donationId={effectiveDonationId}
                  nextRetryAt={challengeData.nextRetryAt}
                  attemptNumber={challengeData.attemptNumber}
                  maxAttempts={challengeData.maxAttempts}
                  amount={donationAmount}
                  currency={data.currency ?? "USD"}
                  onRetryNow={handleRetryNow}
                  onCancel={handleCancelRetry}
                />
                {failoverOccurred && (
                  <div className="mt-5">
                    <FailoverBanner providerFallbackPath={failoverPath} />
                  </div>
                )}
              </div>
            )}

            {dispatchState === DISPATCH_STATES.FAILED && (
              <div className="w-full max-w-[820px]">
                {failoverOccurred && (
                  <div className="mb-5">
                    <FailoverBanner providerFallbackPath={failoverPath} />
                  </div>
                )}
                <FailedPaymentCard
                  challengeStatus={challengeData.status}
                  errorCode={challengeData.errorCode}
                  rawError={challengeData.rawError}
                  donationId={effectiveDonationId}
                  amount={donationAmount}
                  currency={data.currency ?? "USD"}
                  donorEmail={donorEmail}
                  onRetryNow={handleRetryNow}
                  onContactSupport={() => router.push("/contact")}
                  faqUrl="/faq"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {dispatchState === DISPATCH_STATES.SUCCESS && (
        <div className="px-4 sm:px-6 -mt-2">
          <div className="max-w-[820px] mx-auto flex flex-col gap-5">
            {failoverOccurred && <FailoverBanner providerFallbackPath={failoverPath} />}
            {smartRetryActive && <SmartRetryInfoBanner />}

            <PaymentReceiptCard
              receipt={receipt}
              error={receiptError}
              onRetry={() => setReceiptAttempt((n) => n + 1)}
              donationId={effectiveDonationId}
              email={donorEmail}
            />

          </div>
        </div>
      )}

      <div className="mt-16">
        <CampaignsSection loading={loading} campaigns={campaigns} />
      </div>
    </main>
  );
};

export default ThankYouClient;
