"use client";

import { useState } from "react";
import OrchestrationStatusBadge from "@/components/common/OrchestrationStatusBadge";
import CountdownTimer from "@/components/common/CountdownTimer";
import { Spinner } from "@/components/common/SvgIcon";
import { apiRequest } from "@/services/api";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const SmartRetryEngineInfo = ({ maxAttempts = 3, supportEmail = "support@humanconcern.org" }) => {
  const cards = [
    {
      title: "What is Smart Retry?",
      desc: "Smart Retry automatically re-attempts temporarily declined payments using optimized timing, back-off strategies, and alternate payment providers.",
    },
    {
      title: `Up to ${maxAttempts} Attempts`,
      desc: `We will retry your donation up to ${maxAttempts} times with increasing delays. Each attempt uses the best available provider at that moment.`,
    },
    {
      title: "Do NOT Donate Manually",
      desc: "Please do NOT create a new donation. Automatic retries prevent duplicate charges. If all retries fail, you'll get a secure retry link via email.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4"
        >
          <p className="text-[12px] font-bold text-amber-900 mb-1.5">{card.title}</p>
          <p className="text-[11.5px] text-amber-800/80 leading-relaxed">{card.desc}</p>
        </div>
      ))}
      <div className="sm:col-span-3 rounded-2xl border border-amber-200/60 bg-white/70 p-3.5 flex items-center gap-3">
        <div className="shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-600">
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-gray-800">Need help?</p>
          <p className="text-[11.5px] text-gray-600">
            Contact us at{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-amber-700 font-semibold hover:underline"
            >
              {supportEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const PendingRetryScheduleCard = ({
  donationId = "",
  nextRetryAt = null,
  attemptNumber = 1,
  maxAttempts = 3,
  amount = 0,
  currency = "USD",
  onRetryNow,
  onCancel,
  className = "",
}) => {
  const sym = CURRENCY_SYMBOLS[currency] || "$";
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const handleCancel = async () => {
    if (!donationId || !onCancel) {
      setCancelled(true);
      return;
    }
    setCancelling(true);
    setCancelError("");
    try {
      if (typeof onCancel === "function") {
        await onCancel(donationId);
      } else {
        await apiRequest(`donations/${donationId}/cancel-retry`, { method: "POST" });
      }
      setCancelled(true);
    } catch (e) {
      setCancelError(e?.message || "Could not cancel retry schedule.");
    } finally {
      setCancelling(false);
    }
  };

  if (cancelled) {
    return (
      <div className={`w-full rounded-2xl border border-gray-300 bg-gray-50 p-6 shadow-sm ${className}`}>
        <div className="text-center py-4">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="mx-auto text-gray-400 mb-3">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-[14px] font-bold text-gray-800">Automatic Retries Cancelled</p>
          <p className="text-[12px] text-gray-600 mt-1.5 max-w-sm mx-auto">
            Your retry schedule has been cancelled. No further automatic payment attempts will be made.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6 shadow-lg ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <div className="mb-2">
            <OrchestrationStatusBadge type="challenge" value="pending_retry_scheduled" />
          </div>
          <h2 className="text-[20px] sm:text-[22px] font-bold text-amber-900 mt-2">
            Payment Pending — Retry Scheduled
          </h2>
          <p className="text-[13px] text-amber-800/80 mt-1.5">
            Your donation of{" "}
            <span className="font-bold text-amber-900">
              {sym}{Number(amount).toFixed(2)}
            </span>{" "}
            could not be processed right now. Smart Retry is handling it automatically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl border border-amber-300/50 bg-white p-4">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-amber-600 mb-2">
            Next Retry At
          </p>
          {nextRetryAt ? (
            <CountdownTimer
              expiresAt={nextRetryAt}
              size="lg"
              className="!text-[14px]"
            />
          ) : (
            <p className="text-[13px] font-semibold text-gray-700">Calculating...</p>
          )}
          {nextRetryAt && (
            <p className="text-[11px] text-amber-700/70 mt-2">
              {new Date(nextRetryAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-300/50 bg-white p-4">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-amber-600 mb-2">
            Attempt Progress
          </p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxAttempts }).map((_, i) => {
              const done = i < attemptNumber - 1;
              const current = i === attemptNumber - 1;
              return (
                <div
                  key={i}
                  className={`h-2.5 flex-1 rounded-full transition-all ${
                    done
                      ? "bg-red-400"
                      : current
                      ? "bg-amber-400 animate-pulse"
                      : "bg-gray-200"
                  }`}
                />
              );
            })}
          </div>
          <p className="text-[12px] text-amber-800/80 mt-2.5 font-medium">
            Attempt {attemptNumber} of {maxAttempts}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <button
          type="button"
          onClick={onRetryNow}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-3 text-[13px] font-semibold text-white transition-colors active:scale-[0.98] shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          I want to pay NOW instead of waiting
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 disabled:opacity-50 px-5 py-3 text-[13px] font-semibold text-amber-800 transition-colors"
        >
          {cancelling ? (
            <span className="text-amber-700">{Spinner}</span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          )}
          Cancel Retry Schedule
        </button>
      </div>

      {cancelError && (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-700 font-medium">
          {cancelError}
        </div>
      )}

      <SmartRetryEngineInfo maxAttempts={maxAttempts} />
    </div>
  );
};

export default PendingRetryScheduleCard;
