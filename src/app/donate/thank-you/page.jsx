"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDonation } from "@/context/DonationContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import { serverApiBase } from "@/utils/constants";
import FinalizeScreen from "./components/FinalizeScreen";
import DonationCard from "./components/DonationCard";
import CampaignsSection from "./components/CampaignsSection";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };
const FREQUENCY_LABELS = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };

const ThankYouPage = () => {
  const router = useRouter();
  const { data, update } = useDonation();
  const { isAuthenticated } = useAuth();

  const [campaigns, setCampaigns]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [copied, setCopied]                 = useState(false);
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [finalizeError, setFinalizeError]   = useState("");
  const [finalizeAttempt, setFinalizeAttempt] = useState(0);

  const sym           = CURRENCY_SYMBOLS[data.currency] || "$";
  const donationAmount = data.grandTotal ?? data.amountTier;
  const isRecurring   = data.paymentType === "recurring";
  const frequency     = FREQUENCY_LABELS[data.frequency?.toLowerCase()] ?? data.frequency ?? "";
  const numberOfDays  = data.numberOfDays ?? 0;
  const campaignTitle = data.campaignTitle ?? "";
  const causes        = data.causes ?? [];

  const finalizeRef = useRef(false);

  const resolvedSetupIntentId = useMemo(() => {
    const fromState = String(data.setupIntentId || "").trim();
    if (fromState) return fromState;
    if (typeof window === "undefined") return "";
    try {
      return String(new URLSearchParams(window.location.search).get("setup_intent") || "").trim();
    } catch {
      return "";
    }
  }, [data.setupIntentId]);

  const pendingSessionId = useMemo(() => String(data.pendingSessionId || "").trim(), [data.pendingSessionId]);

  const needsFinalize = Boolean(
    isRecurring && pendingSessionId && resolvedSetupIntentId && !String(data.finalizedDonationId || "").trim()
  );

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
        const donationId =
          res?.data?.donationId ?? res?.data?.data?.donationId ?? res?.donationId ?? null;
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

  useEffect(() => {
    if (isAuthenticated && !needsFinalize && !finalizeLoading && !finalizeError) {
      sessionStorage.setItem("thankyouData", JSON.stringify({
        donationAmount,
        currency:     data.currency  ?? "USD",
        campaignTitle,
        isRamadan:    data.isRamadan ?? false,
        causes,
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
    if (isAuthenticated || needsFinalize || finalizeLoading || finalizeError) return;
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
    return (
      <FinalizeScreen
        loading={finalizeLoading}
        error={finalizeError}
        onRetry={handleRetry}
        onGoHistory={() => router.replace("/dashboard/donation-history")}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F6F6] pb-20">
      <div className="relative w-full overflow-hidden pt-[100px] sm:pt-[120px] md:pt-[140px] lg:pt-[160px] pb-16 px-4 sm:px-6">
        {/* Confetti backgrounds */}
        <div className="absolute left-0 top-0 h-full pointer-events-none select-none z-[1] hidden md:block">
          <Image src="/images/left-celebration-background.png" alt="" width={320} height={600} className="h-full w-auto object-contain" />
        </div>
        <div className="absolute right-0 top-0 h-full pointer-events-none select-none z-[1] hidden md:block">
          <Image src="/images/right-celebration-background.png" alt="" width={320} height={600} className="h-full w-auto object-contain" />
        </div>

        <div className="relative z-20 flex items-center justify-center">
          <div className="relative w-full max-w-[1100px] min-h-[520px] flex flex-col md:flex-row items-center justify-center">
            {/* Hero image */}
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

            <DonationCard
              sym={sym}
              donationAmount={donationAmount}
              finalizeLoading={finalizeLoading}
              finalizeError={finalizeError}
              onRetry={handleRetry}
              campaignTitle={campaignTitle}
              causes={causes}
              isRecurring={isRecurring}
              frequency={frequency}
              numberOfDays={numberOfDays}
              copied={copied}
              onShare={handleShare}
              onDashboard={() => router.push("/dashboard")}
              onBrowse={() => router.push("/campaigns")}
            />
          </div>
        </div>
      </div>

      <CampaignsSection loading={loading} campaigns={campaigns} />
    </main>
  );
};

export default ThankYouPage;
