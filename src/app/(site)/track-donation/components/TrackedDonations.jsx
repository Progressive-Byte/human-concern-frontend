"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/helpers";
import { downloadReceipt } from "@/services/donationService";
import AccountRequiredModal from "@/components/common/AccountRequiredModal";

const causeBadgeStyles = {
  Zakat: "bg-[#ECFDF5] text-[#047857]",
  Sadaqah: "bg-[#FFF8EC] text-[#B45309]",
};

function statusClass(key) {
  const status = String(key || "").toLowerCase();
  if (status === "succeeded") return "text-[#047857]";
  if (status === "pending") return "text-[#B45309]";
  if (status === "failed") return "text-[#EA3335]";
  if (status === "refunded") return "text-[#6B7280]";
  return "text-[#047857]";
}

function formatDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function isRecurring(item) {
  return String(item?.paymentMode || "") === "split" || Boolean(item?.scheduleType);
}

const TrackedDonations = ({ email, hasAccount = false, items = [] }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  const rows = (Array.isArray(items) ? items : []).map((item, index) => ({
    id: String(item?.donationId || index),
    date: formatDate(item?.date),
    campaign: String(item?.campaign?.name || "").trim() || "—",
    cause: String(item?.causeTag?.label || "").trim(),
    amount: Number(item?.amount ?? 0),
    currency: String(item?.currency || "USD"),
    status: String(item?.status?.label || "").trim() || "—",
    statusKey: String(item?.status?.key || ""),
    recurring: isRecurring(item),
  }));

  async function handleReceipt(row) {
    if (busyId) return;
    setBusyId(row.id);
    setError("");
    try {
      await downloadReceipt({ donationId: row.id, email });
    } catch (e) {
      setError(e?.message || "Could not download the receipt.");
    } finally {
      setBusyId("");
    }
  }

  function handleManageRecurring() {
    if (isAuthenticated) {
      router.push("/dashboard/schedules");
      return;
    }
    setAccountModalOpen(true);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-[20px] font-bold text-[#111111]">
          Donations for <span className="text-[#CC1F1F]">{email}</span>
        </h2>
        <span className="text-[13px] text-[#777777]">
          {rows.length} donation{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-[#F5D9D9] bg-[#FFF6F6] px-4 py-3 text-[13px] text-[#CC1F1F]">
          {error}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-[#EBEBEB] text-left text-[12px] uppercase tracking-wide text-[#777777]">
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Campaign</th>
                <th className="hidden px-4 py-4 font-medium sm:table-cell">Cause</th>
                <th className="px-4 py-4 font-medium">Amount</th>
                <th className="hidden px-4 py-4 font-medium md:table-cell">Status</th>
                <th className="px-4 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[14px] text-[#777777]">
                    No donations found for this email address.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-[#F9FAFB] ${index !== rows.length - 1 ? "border-b border-[#EBEBEB]" : ""}`}
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-[#111111]">{row.date}</td>
                    <td className="px-4 py-4">
                      <p className="m-0 leading-snug text-[#111111]">{row.campaign}</p>
                      {row.recurring ? (
                        <span className="mt-1 inline-block rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#1D4ED8]">
                          Recurring
                        </span>
                      ) : null}
                    </td>
                    <td className="hidden px-4 py-4 sm:table-cell">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[11px] font-medium ${
                          causeBadgeStyles[row.cause] || "bg-[#F3F4F6] text-[#6B7280]"
                        }`}
                      >
                        {row.cause || "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#111111]">
                      {formatCurrency(row.amount, row.currency)}
                    </td>
                    <td className={`hidden px-4 py-4 md:table-cell ${statusClass(row.statusKey)}`}>{row.status}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleReceipt(row)}
                          disabled={busyId === row.id}
                          className="cursor-pointer rounded-full border border-[#DDDDDD] px-3.5 py-1.5 text-[12px] font-semibold text-[#111111] transition-colors hover:border-[#CC1F1F] hover:text-[#CC1F1F] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busyId === row.id ? "Preparing…" : "Receipt"}
                        </button>
                        {row.recurring ? (
                          <button
                            type="button"
                            onClick={handleManageRecurring}
                            className="cursor-pointer rounded-full bg-[#F3F4F6] px-3.5 py-1.5 text-[12px] font-semibold text-[#111111] transition-colors hover:bg-[#E5E7EB]"
                          >
                            Manage recurring
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-[12px] text-[#777777]">
        You&apos;re viewing donations for the email address you verified.
      </p>

      <AccountRequiredModal
        open={accountModalOpen}
        hasAccount={hasAccount}
        onClose={() => setAccountModalOpen(false)}
      />
    </div>
  );
};

export default TrackedDonations;
