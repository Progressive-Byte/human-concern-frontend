import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserInstallmentAction } from "@/services/donationService";

export function useInstallmentAction(installmentId) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionData, setActionData] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    if (!installmentId) {
      setActionLoading(false);
      setActionError("");
      setActionData(null);
      setSyncStatus(null);
      return;
    }

    let alive = true;
    (async () => {
      setActionLoading(true);
      setActionError("");
      setActionData(null);
      setSyncStatus(null);
      try {
        const res = await getUserInstallmentAction(installmentId);
        if (!alive) return;
        const payload = res?.data?.data ?? res?.data ?? res ?? {};
        const status = String(payload?.status || "").trim().toLowerCase();
        if (status) setSyncStatus(status);
        setActionData({
          clientSecret: payload?.clientSecret ?? null,
          paymentIntentId: payload?.paymentIntentId ?? null,
          amount: payload?.amount,
          currency: payload?.currency,
          dueDate: payload?.dueDate,
          title: payload?.title,
        });
      } catch (e) {
        if (!alive) return;
        const msg = e?.message || "Failed to load verification details.";
        setActionError(msg);
        const lower = String(msg || "").toLowerCase();
        if (lower.includes("unauthorized") || lower.includes("unauthorised")) {
          const next = `${window.location.pathname}${window.location.search}`;
          router.push(`/user/login?redirect=${encodeURIComponent(next)}`);
        }
      } finally {
        if (!alive) return;
        setActionLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [installmentId, router]);

  return { actionLoading, actionError, setActionError, actionData, syncStatus, setSyncStatus };
}
