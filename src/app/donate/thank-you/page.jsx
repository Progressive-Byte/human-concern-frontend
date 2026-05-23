"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useDonation } from "@/context/DonationContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import CampaignCard from "@/app/(site)/campaigns/components/CampaignCard";
import { arrowIcon, ThankyouIcon, ShareCampaignIcon, CircleCheckIcon, DashboardTabIcon, BrowserIcon } from "@/components/common/SvgIcon";
import { serverApiBase } from "@/utils/constants";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const FREQUENCY_LABELS = {
  daily:   "Daily",
  weekly:  "Weekly",
  monthly: "Monthly",
};

const ThankYouPage = () => {
  const router = useRouter();
  const { data, update } = useDonation();
  const { isAuthenticated } = useAuth();
  const sym = CURRENCY_SYMBOLS[data.currency] || "$";

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState(false);
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");
  const [finalizeAttempt, setFinalizeAttempt] = useState(0);

  const donationAmount = data.grandTotal ?? data.amountTier;
  const isRecurring    = data.paymentType === "recurring";
  const frequency      = FREQUENCY_LABELS[data.frequency?.toLowerCase()] ?? data.frequency ?? "";
  const numberOfDays   = data.numberOfDays ?? 0;
  const campaignTitle  = data.campaignTitle ?? "";

  const finalizeRef = useRef(false);
  const resolvedSetupIntentId = useMemo(() => {
    const fromState = String(data.setupIntentId || "").trim();
    if (fromState) return fromState;
    if (typeof window === "undefined") return "";
    try {
      const sp = new URLSearchParams(window.location.search);
      const fromQuery = String(sp.get("setup_intent") || "").trim();
      return fromQuery;
    } catch {
      return "";
    }
  }, [data.setupIntentId]);

  const pendingSessionId = useMemo(() => String(data.pendingSessionId || "").trim(), [data.pendingSessionId]);

  const needsFinalize = Boolean(
    isRecurring &&
    pendingSessionId &&
    resolvedSetupIntentId &&
    !String(data.finalizedDonationId || "").trim()
  );

  const clearDonationSession = () => {
    try {
      sessionStorage.removeItem("hc_donation_done");
      sessionStorage.removeItem("hc_donation");
    } catch {}
  };

  useEffect(() => {
    if (!needsFinalize) return;
    if (finalizeRef.current) return;
    finalizeRef.current = true;

    (async () => {
      setFinalizeLoading(true);
      setFinalizeError("");
      try {
        const res = await apiRequest("donations/finalize", {
          method: "POST",
          body: JSON.stringify({
            pendingSessionId,
            setupIntentId: resolvedSetupIntentId,
          }),
        });
        const donationId =
          res?.data?.donationId ??
          res?.data?.data?.donationId ??
          res?.donationId ??
          null;
        update({
          finalizedDonationId: donationId ?? "1",
          donationId: donationId ?? data.donationId ?? null,
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

  // If logged in, save data to sessionStorage and redirect to donation-history with popup flag
  useEffect(() => {
    if (isAuthenticated && !needsFinalize && !finalizeLoading && !finalizeError) {
      sessionStorage.setItem("thankyouData", JSON.stringify({
        donationAmount,
        currency:     data.currency   ?? "USD",
        campaignTitle,
        isRamadan:    data.isRamadan  ?? false,
        causes:       data.causes     ?? [],
        isRecurring,
        frequency,
        numberOfDays,
        paymentType:  data.paymentType ?? "one-time",
      }));
      clearDonationSession();
      router.replace("/dashboard/donation-history?thankyou=1");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, needsFinalize, finalizeLoading, finalizeError]);

  useEffect(() => {
    fetch(`${serverApiBase}campaigns/featured`)
      .then((r) => r.json())
      .then((res) => setCampaigns(res?.data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) return;
    if (needsFinalize) return;
    if (finalizeLoading) return;
    if (finalizeError) return;
    clearDonationSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, needsFinalize, finalizeLoading, finalizeError]);

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

  if (isAuthenticated) {
    if (finalizeLoading) {
      return (
        <main className="min-h-screen bg-[#F6F6F6] pt-[140px] px-4">
          <div className="max-w-[720px] mx-auto bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-6">
            <h1 className="text-[20px] font-bold text-[#383838]">Finalizing your donation…</h1>
            <p className="text-[13px] text-[#737373] mt-1">Please keep this tab open.</p>
          </div>
        </main>
      );
    }
    if (finalizeError) {
      return (
        <main className="min-h-screen bg-[#F6F6F6] pt-[140px] px-4">
          <div className="max-w-[720px] mx-auto bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-6">
            <h1 className="text-[20px] font-bold text-[#383838]">We couldn’t finalize your donation</h1>
            <p className="text-[13px] text-[#737373] mt-1">{finalizeError}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  finalizeRef.current = false;
                  setFinalizeError("");
                  setFinalizeAttempt((n) => n + 1);
                }}
                className="rounded-xl bg-[#EA3335] px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => router.replace("/dashboard/donation-history")}
                className="rounded-xl border border-[#E5E5E5] bg-white px-4 py-2 text-[13px] font-semibold text-[#383838] hover:bg-[#F9F9F9] transition cursor-pointer"
              >
                Go to Donation History
              </button>
            </div>
          </div>
        </main>
      );
    }
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F6F6F6] pb-20">
      <div className="relative w-full overflow-hidden pt-[100px] sm:pt-[120px] md:pt-[140px] lg:pt-[160px] pb-16 px-4 sm:px-6">
        {/* Left confetti */}
        <div className="absolute left-0 top-0 h-full pointer-events-none select-none z-[1] hidden md:block">
          <Image src="/images/left-celebration-background.png" alt="" width={320} height={600} className="h-full w-auto object-contain" />
        </div>
        {/* Right confetti */}
        <div className="absolute right-0 top-0 h-full pointer-events-none select-none z-[1] hidden md:block">
          <Image src="/images/right-celebration-background.png" alt="" width={320} height={600} className="h-full w-auto object-contain" />
        </div>

        {/* Container */}
        <div className="relative z-20 flex items-center justify-center">
          <div className="relative w-full max-w-[1100px] min-h-[520px] flex flex-col md:flex-row items-center justify-center">

            {/* Left image */}
            <div className="relative w-full md:w-[55%] md:max-w-[600px] h-[260px] sm:h-[340px] md:h-[660px] rounded-[24px] overflow-hidden">
              <Image
                src="/images/happy-thankyou.png"
                alt="Happy children"
                fill
                sizes="(max-width: 768px) 100vw, 46vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Card */}
            <div className="relative z-20 w-full md:w-[50%] md:max-w-[500px] h-auto md:h-[600px] bg-white rounded-[24px] px-5 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10 flex flex-col items-center text-center mt-4 md:-ml-[15%] lg:-ml-[18%] md:mt-[20px] shadow-2xl">
              <div className="mt-3">
                {ThankyouIcon}
              </div>

              <h1 className="text-[24px] sm:text-[28px] md:text-[34px] font-bold text-[#383838] mt-6">
                Thank You!
              </h1>

              <p className="text-[13px] sm:text-[14px] text-[#737373] mt-2 mb-5">
                Your donation of{" "}
                {donationAmount ? (
                  <span className="font-bold text-[#383838]">
                    {sym}{Number(donationAmount).toFixed(2)}
                  </span>
                ) : "your generous amount"}{" "}
                {finalizeLoading ? "is being finalized." : "has been processed successfully."}
              </p>

              {finalizeError ? (
                <div className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-5 text-left">
                  <p className="text-[13px] font-semibold text-red-700">Finalization failed</p>
                  <p className="text-[12px] text-red-700/90 mt-1">{finalizeError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      finalizeRef.current = false;
                      setFinalizeError("");
                      setFinalizeAttempt((n) => n + 1);
                    }}
                    className="mt-3 rounded-lg bg-[#EA3335] px-3 py-2 text-[12px] font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : null}

              {/* Donation details card */}
              <div className="w-full bg-[#F6F6F6] rounded-xl px-4 py-4 mb-5 text-left">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AEAEAE] mb-3">
                  Donation Details
                </p>

                <div className="flex flex-col gap-2">
                  {/* Campaign name */}
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#737373]">Campaign</span>
                    <span className="text-[13px] font-semibold text-[#383838]">
                      {campaignTitle || "—"}
                    </span>
                  </div>

                  {/* Causes */}
                  {(data.causes ?? []).length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#737373]">Cause</span>
                      <span className="text-[13px] font-semibold text-[#383838]">
                        {data.causes.join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Recurring */}
                  {isRecurring && frequency && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#737373]">Frequency</span>
                      <span className="text-[13px] font-semibold text-[#383838]">{frequency}</span>
                    </div>
                  )}
                  {isRecurring && numberOfDays > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#737373]">Duration</span>
                      <span className="text-[13px] font-semibold text-[#383838]">{numberOfDays} days</span>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] mt-1">
                    <span className="text-[12px] text-[#737373]">Total</span>
                    <span className="text-[14px] font-bold text-[#055A46]">
                      {sym}{donationAmount ? Number(donationAmount).toFixed(2) : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
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
                    <>{CircleCheckIcon} Link Copied!</>
                  ) : (
                    <>{ShareCampaignIcon} Share Campaign</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 md:mt-[100px] mt-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1A1A1A]">
              Support other urgent appeals!
            </h2>
            <p className="text-sm sm:text-base font-normal mt-2 text-[#737373]">
              Every donation makes a difference.
            </p>
          </div>
          <Link
            href="/campaigns"
            className="group inline-flex items-center gap-2 bg-white text-[#383838] text-sm sm:text-base md:text-lg font-normal rounded-full px-4 sm:px-5 py-2.5 sm:py-3 transition-all duration-300 whitespace-nowrap hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0 self-start sm:self-auto"
          >
            View All Campaigns
            <span className="flex items-center transition-transform duration-300 group-hover:translate-x-1">
              {arrowIcon}
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-[480px] animate-pulse" />
            ))
          ) : campaigns.length === 0 ? (
            <p className="col-span-full text-center text-[#737373]">No campaigns found.</p>
          ) : (
            campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)
          )}
        </div>
      </section>
    </main>
  );
};

export default ThankYouPage;
