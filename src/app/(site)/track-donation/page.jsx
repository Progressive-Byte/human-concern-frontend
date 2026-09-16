"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTrackedDonations } from "@/services/trackDonationService";
import TrackEmailForm from "./components/TrackEmailForm";
import TrackedDonations from "./components/TrackedDonations";

const INVALID_LINK_MESSAGE = "This link is invalid or has expired. Request a new one.";

function LoadingPanel() {
  return (
    <div className="mt-8 rounded-3xl border border-[#EBEBEB] bg-white p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3 text-[15px] text-[#555555]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#CC1F1F] border-t-transparent" />
        Verifying your link…
      </div>
    </div>
  );
}

function TrackDonationPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = String(searchParams?.get("token") || "").trim();

  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setResult(null);
      setError("");
      return undefined;
    }

    let alive = true;
    setLoading(true);
    setError("");
    setResult(null);

    (async () => {
      try {
        const res = await getTrackedDonations({ token });
        if (!alive) return;
        const data = res?.data || {};
        setResult({
          email: String(data.email || ""),
          hasAccount: Boolean(data.hasAccount),
          items: Array.isArray(data.items) ? data.items : [],
        });
      } catch (e) {
        if (!alive) return;
        setResult(null);
        setError(
          e?.code === "TRACK_LINK_INVALID"
            ? INVALID_LINK_MESSAGE
            : e?.message || "We couldn't load your donations. Please try again.",
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token]);

  function startOver() {
    router.replace("/track-donation");
    setResult(null);
    setError("");
  }

  return (
    <main className="min-h-[70vh] px-4 sm:px-6 lg:px-8 pt-[140px] pb-16 sm:pb-20">
      <div className={`mx-auto w-full ${token ? "max-w-[900px]" : "max-w-[560px]"}`}>
        <h1 className="m-0 text-[28px] sm:text-[36px] font-bold text-[#111111]">Track Your Donation</h1>

        {!token ? (
          <>
            <p className="mt-3 text-[15px] sm:text-[17px] text-[#383838] leading-relaxed">
              Enter the email address you used when you donated and we&apos;ll email you a secure link to
              your donation history.
            </p>
            <TrackEmailForm />
          </>
        ) : loading ? (
          <LoadingPanel />
        ) : error ? (
          <div className="mt-8 rounded-3xl border border-[#F5D9D9] bg-[#FFF6F6] p-6 sm:p-8">
            <h2 className="m-0 text-[18px] font-bold text-[#111111]">We couldn&apos;t open that link</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#555555]">{error}</p>
            <button
              type="button"
              onClick={startOver}
              className="mt-5 cursor-pointer rounded-full bg-[#CC1F1F] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#A81A1A]"
            >
              Request a new link
            </button>
          </div>
        ) : result ? (
          <TrackedDonations
            email={result.email}
            hasAccount={result.hasAccount}
            items={result.items}
            token={token}
          />
        ) : null}
      </div>
    </main>
  );
}

const TrackDonationPage = () => (
  <Suspense
    fallback={
      <main className="min-h-[70vh] px-4 sm:px-6 lg:px-8 pt-[140px] pb-16 sm:pb-20">
        <div className="mx-auto w-full max-w-[560px]">
          <h1 className="m-0 text-[28px] sm:text-[36px] font-bold text-[#111111]">Track Your Donation</h1>
          <LoadingPanel />
        </div>
      </main>
    }
  >
    <TrackDonationPageInner />
  </Suspense>
);

export default TrackDonationPage;
