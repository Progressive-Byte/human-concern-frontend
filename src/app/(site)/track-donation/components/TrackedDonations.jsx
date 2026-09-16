"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/helpers";
import { downloadReceipt } from "@/services/donationService";
import AccountRequiredModal from "@/components/common/AccountRequiredModal";
import TrackedDonationDetailsModal from "./TrackedDonationDetailsModal";

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

const TrackedDonations = ({ email, hasAccount = false, items = [], token = "" }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);

  const rows = (Array.isArray(items) ? items : []).map((item, index) => {
    const summary = item?.scheduleSummary || {};
    const upcoming = Array.isArray(summary.upcoming) ? summary.upcoming : [];
    const next = upcoming[0] || null;
    return {
      id: String(item?.donationId || index),
      date: formatDate(item?.date),
      campaign: String(item?.campaign?.name || "").trim() || "—",
      cause: String(item?.causeTag?.label || "").trim(),
      amount: Number(item?.amount ?? 0),
      currency: String(item?.currency || "USD"),
      status: String(item?.status?.label || "").trim() || "—",
      statusKey: String(item?.status?.key || ""),
      // A receipt only exists once the payment has actually completed.
      hasReceipt: String(item?.status?.key || "") === "succeeded",
      recurring: isRecurring(item),
      nextPayment: next ? Number(next.amount ?? 0) : null,
      nextPaymentDate: next ? formatDate(next.dueDate) : "",
      paidSoFar: summary.paidTotal != null ? Number(summary.paidTotal) : null,
      item,
    };
  });

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

  // Actions for the currently open details modal.
  function handleModalReceipt() {
    if (!detailsItem) return;
    handleReceipt({ id: String(detailsItem.donationId || ""), currency: detailsItem.currency });
  }

  function handleModalManageRecurring() {
    setDetailsItem(null);
    handleManageRecurring();
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
                <th className="px-4 py-4 font-medium">Amount</th>
                <th className="hidden px-4 py-4 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[14px] text-[#777777]">
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
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {row.recurring ? (
                          <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#1D4ED8]">
                            Recurring
                          </span>
                        ) : null}
                        {row.cause ? (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                              causeBadgeStyles[row.cause] || "bg-[#F3F4F6] text-[#6B7280]"
                            }`}
                          >
                            {row.cause}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="font-semibold text-[#111111]">{formatCurrency(row.amount, row.currency)}</div>
                      {row.recurring && row.nextPayment != null ? (
                        <div className="mt-0.5 text-[11px] text-[#6B7280]">
                          Next {formatCurrency(row.nextPayment, row.currency)} · {row.nextPaymentDate}
                        </div>
                      ) : null}
                    </td>
                    <td className={`hidden whitespace-nowrap px-4 py-4 sm:table-cell ${statusClass(row.statusKey)}`}>
                      {row.status}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDetailsItem(row.item)}
                        className="cursor-pointer rounded-full border border-[#DDDDDD] px-4 py-1.5 text-[12px] font-semibold text-[#111111] transition-colors hover:border-[#CC1F1F] hover:text-[#CC1F1F]"
                      >
                        Details
                      </button>
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

      <TrackedDonationDetailsModal
        item={detailsItem}
        token={token}
        onClose={() => setDetailsItem(null)}
        canDownloadReceipt={String(detailsItem?.status?.key || "") === "succeeded"}
        receiptBusy={Boolean(busyId)}
        onDownloadReceipt={handleModalReceipt}
        onManageRecurring={handleModalManageRecurring}
      />
    </div>
  );
};

export default TrackedDonations;
