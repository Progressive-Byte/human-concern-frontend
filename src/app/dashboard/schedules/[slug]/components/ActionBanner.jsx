"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { AlertIcon, Spinner } from "@/components/common/SvgIcon";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { apiRequest } from "@/services/api";
import { syncUserInstallment } from "@/services/donationService";
import { formatCurrency } from "@/utils/helpers";
function formatShortDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

export function ActionBanner({
  installmentId,
  actionLoading,
  actionError,
  setActionError,
  actionData,
  syncStatus,
  setSyncStatus,
  currency,
  onDismiss,
  onRefresh,
}) {
  const [busy, setBusy] = useState(false);

  const getStripePublishableKey = async () => {
    const res = await apiRequest("payment/settings");
    const raw = res?.data?.gateways ?? res?.gateways ?? {};
    const gateway = Object.values(raw).find((g) => g?.provider === "stripe");
    const key = gateway?.publishableKey ?? null;
    if (!key) throw new Error("Stripe is not configured.");
    return key;
  };

  const pollSync = async ({ attemptsLeft }) => {
    const res = await syncUserInstallment(installmentId);
    const payload = res?.data?.data ?? res?.data ?? res ?? {};
    const status = String(payload?.status || payload?.installmentStatus || "").trim().toLowerCase();
    if (status) setSyncStatus(status);

    if (status === "processing" && attemptsLeft > 0) {
      await new Promise((r) => window.setTimeout(r, 3500));
      return pollSync({ attemptsLeft: attemptsLeft - 1 });
    }
    if (status === "succeeded") {
      onRefresh();
      onDismiss();
    }
    return status || null;
  };

  const handleCompleteVerification = async () => {
    if (!installmentId) return;
    setBusy(true);
    setActionError("");
    try {
      const clientSecret = actionData?.clientSecret;
      if (!clientSecret) throw new Error("Missing Stripe client secret.");
      const publishableKey = await getStripePublishableKey();
      const stripe = await loadStripe(publishableKey);
      if (!stripe) throw new Error("Stripe failed to load.");
      const result = await stripe.confirmCardPayment(clientSecret);
      if (result?.error?.message) setActionError(result.error.message);
      await pollSync({ attemptsLeft: 10 });
    } catch (e) {
      setActionError(e?.message || "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#111827]">Action required to complete your payment</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Complete authentication to finish your scheduled installment.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB]"
        >
          Dismiss
        </button>
      </div>

      {actionError ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          <span className="mt-0.5 shrink-0"><AlertIcon size={14} /></span>
          <span className="min-w-0">{actionError}</span>
        </div>
      ) : null}

      {actionLoading ? (
        <SkeletonBlock className="mt-4 h-16 rounded-xl" />
      ) : (
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#111827]">
              {typeof actionData?.amount === "number"
                ? formatCurrency(actionData.amount, String(actionData?.currency || currency))
                : "—"}
              <span className="text-[#6B7280] font-medium">
                {actionData?.dueDate ? ` • Due ${formatShortDate(actionData.dueDate)}` : ""}
              </span>
            </div>
            <div className="mt-1 text-xs text-[#6B7280] truncate">
              {actionData?.title ? String(actionData.title) : ""}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy || actionLoading}
              onClick={handleCompleteVerification}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA3335] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? <span className="inline-flex items-center gap-2">{Spinner}Processing…</span> : "Complete verification"}
            </button>
            <button
              type="button"
              disabled={busy || actionLoading}
              onClick={onRefresh}
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {syncStatus ? (
        <div className="mt-3 text-xs text-[#6B7280]">
          Status: <span className="font-semibold text-[#111827]">{syncStatus}</span>
        </div>
      ) : null}
    </div>
  );
}
