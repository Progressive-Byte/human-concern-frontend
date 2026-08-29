"use client";

import { useState } from "react";
import OrchestrationStatusBadge from "@/components/common/OrchestrationStatusBadge";
import { getUserFacingErrorMessage, classifyBankFailure } from "@/utils/errorMaps";
import { Spinner, CircleCheckIcon } from "@/components/common/SvgIcon";
import { apiRequest } from "@/services/api";
import { validateEmail } from "@/utils/validateEmail";

const CURRENCY_SYMBOLS = { USD: "$", GBP: "£", EUR: "€", CAD: "CA$" };

const FailedPaymentCard = ({
  challengeStatus = "failed",
  errorCode = "",
  rawError = "",
  donationId = "",
  amount = 0,
  currency = "USD",
  donorEmail = "",
  onRetryNow,
  onContactSupport,
  faqUrl = "/faq",
  className = "",
}) => {
  const sym = CURRENCY_SYMBOLS[currency] || "$";
  const userMessage = getUserFacingErrorMessage(errorCode, rawError || "Your payment could not be completed.");
  const classification = classifyBankFailure(errorCode);

  const [emailForLink, setEmailForLink] = useState(donorEmail || "");
  const [linkStatus, setLinkStatus] = useState("idle");
  const [linkError, setLinkError] = useState("");
  const [linkSentMsg, setLinkSentMsg] = useState("");
  const [showEmailField, setShowEmailField] = useState(!donorEmail);

  const classificationBadge = {
    non_retriable: { label: "Cannot Auto-Retry", className: "bg-red-100 text-red-700" },
    retriable_temporary: { label: "Temporary Issue", className: "bg-amber-100 text-amber-700" },
    unknown: { label: "Review Required", className: "bg-gray-100 text-gray-700" },
  }[classification];

  const handleSendRetryLink = async () => {
    const trimmed = String(emailForLink || "").trim();
    if (validateEmail(trimmed)) {
      setLinkError("Please enter a valid email address.");
      return;
    }
    if (!donationId) {
      setLinkError("Missing donation reference.");
      return;
    }
    setLinkStatus("loading");
    setLinkError("");
    setLinkSentMsg("");
    try {
      await apiRequest(`donations/${donationId}/retry-link?email=${encodeURIComponent(trimmed)}`, {
        method: "POST",
      });
      setLinkStatus("success");
      setLinkSentMsg(`Secure retry link sent to ${trimmed}. Please check your inbox.`);
    } catch (e) {
      setLinkStatus("error");
      setLinkError(e?.message || "Could not send retry link. Please contact support.");
      setTimeout(() => setLinkStatus("idle"), 3000);
    }
  };

  return (
    <div className={`w-full rounded-2xl border-2 border-red-400/60 bg-gradient-to-br from-red-50 via-white to-rose-50 p-6 shadow-lg ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <OrchestrationStatusBadge type="challenge" value={challengeStatus} />
            {classificationBadge && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${classificationBadge.className}`}>
                {classificationBadge.label}
              </span>
            )}
          </div>
          <h2 className="text-[20px] sm:text-[22px] font-bold text-red-900 mt-2">
            Payment Failed
          </h2>
          <p className="text-[13px] text-red-800/80 mt-1.5">
            Your donation of{" "}
            <span className="font-bold text-red-900">
              {sym}{Number(amount).toFixed(2)}
            </span>{" "}
            could not be processed.
          </p>
        </div>
        <div className="shrink-0 hidden sm:block">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-red-500/80">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="rounded-2xl border border-red-300/50 bg-white p-4 mb-5">
        <p className="text-[11px] uppercase tracking-widest font-semibold text-red-600 mb-2">
          What happened
        </p>
        <p className="text-[13.5px] text-gray-800 font-medium leading-relaxed">
          {userMessage}
        </p>
        {errorCode && (
          <p className="text-[11px] text-gray-500 mt-2">
            Error code: <span className="font-mono">{String(errorCode)}</span>
          </p>
        )}
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onRetryNow}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#EA3335] hover:bg-red-700 px-4 py-3.5 text-[13.5px] font-semibold text-white transition-colors active:scale-[0.98] shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Retry Payment Now
        </button>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-gray-800">Email me a secure retry link</p>
              <p className="text-[11.5px] text-gray-600 mt-0.5">
                Complete your payment later from any device. No need to restart.
              </p>
            </div>
            {!showEmailField && donorEmail && (
              <button
                type="button"
                onClick={() => setShowEmailField(true)}
                className="shrink-0 text-[11px] font-semibold text-red-600 hover:underline"
              >
                Change email
              </button>
            )}
          </div>

          {(showEmailField || !donorEmail) && (
            <div className="mb-3">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1.5 block">
                Your Email
              </label>
              <input
                type="email"
                value={emailForLink}
                onChange={(e) => setEmailForLink(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-[13px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition"
              />
            </div>
          )}

          {linkError && (
            <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-700 font-medium">
              {linkError}
            </div>
          )}

          {linkSentMsg && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 px-3 py-2">
              <span className="text-emerald-600 shrink-0">{CircleCheckIcon}</span>
              <span className="text-[12px] text-emerald-700 font-medium">{linkSentMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSendRetryLink}
            disabled={linkStatus === "loading"}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[#EA3335] bg-white hover:bg-red-50 disabled:opacity-50 px-4 py-2.5 text-[13px] font-semibold text-[#EA3335] transition-colors"
          >
            {linkStatus === "loading" ? (
              <span className="text-[#EA3335]">{Spinner}</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
            )}
            {linkStatus === "loading" ? "Sending..." : "Email Secure Retry Link"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onContactSupport}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 px-4 py-3 text-[13px] font-semibold text-gray-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            Contact Support
          </button>

          <a
            href={faqUrl}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 px-4 py-3 text-[13px] font-semibold text-gray-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
            </svg>
            View FAQ
          </a>
        </div>
      </div>
    </div>
  );
};

export default FailedPaymentCard;
