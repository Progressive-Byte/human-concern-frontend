"use client";

import { useState } from "react";
import { downloadReceipt } from "@/services/donationService";
import { Spinner } from "@/components/common/SvgIcon";
import { formatCurrency } from "@/utils/helpers";

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function Row({ label, value, mono }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[12px] text-[#737373] shrink-0 pt-0.5">{label}</span>
      <span
        className={`text-[13px] font-semibold text-[#383838] text-right min-w-0 break-words ${
          mono ? "font-mono text-[12px]" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="pt-3 mt-3 border-t border-[#E5E5E5] first:pt-0 first:mt-0 first:border-t-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#AEAEAE] mb-2">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function LineItem({ label, amount, currency }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[12px] text-[#383838] min-w-0 break-words">{label}</span>
      <span className="text-[12px] font-semibold text-[#383838] shrink-0 tabular-nums">
        {formatCurrency(Number(amount) || 0, currency)}
      </span>
    </div>
  );
}

// The same receipt the PDF/email renders, drawn on screen. Data comes from POST /receipt/detail.
const PaymentReceiptCard = ({ receipt, error, onRetry, donationId, email }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleDownload = async () => {
    if (!donationId || downloading) return;
    setDownloading(true);
    setDownloadError("");
    try {
      await downloadReceipt({ donationId, email });
    } catch (e) {
      setDownloadError(e?.message || "Could not download the receipt. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // The PDF is built from the same data as this card, so the download is offered even when the
  // JSON request failed. Direct download — the donor's email is taken from the checkout.
  const downloadButton = donationId ? (
    <div className="pt-3 mt-3 border-t border-[#E5E5E5]">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#EA3335] hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed px-4 py-3 text-[13px] font-semibold text-white transition-colors active:scale-[0.98] cursor-pointer"
      >
        {downloading ? (
          <>
            <span className="text-white">{Spinner}</span>
            Preparing...
          </>
        ) : (
          <>Download Receipt</>
        )}
      </button>
      {downloadError ? (
        <p className="mt-2 text-[12px] font-medium text-[#EA3335]">{downloadError}</p>
      ) : null}
    </div>
  ) : null;

  if (error) {
    return (
      <div className="w-full bg-white rounded-2xl border border-dashed border-[#E5E5E5] p-5 sm:p-6 text-left">
        <h3 className="text-[13px] font-semibold uppercase tracking-widest text-gray-500">Donation Receipt</h3>
        <p className="text-[13px] text-[#737373] mt-3">{error}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-xl border border-[#E5E5E5] px-4 py-2 text-[12px] font-semibold text-[#383838] transition-colors hover:border-gray-400 cursor-pointer"
          >
            Try again
          </button>
        ) : null}
        {downloadButton}
      </div>
    );
  }

  if (!receipt) return null;

  const currency = receipt.currency || "USD";
  const money = (value) => formatCurrency(Number(value) || 0, currency);
  const recurring = receipt.recurring || {};
  const organization = receipt.organization || {};
  const recurringLabel =
    recurring.index && recurring.count
      ? `Payment ${recurring.index} of ${recurring.count}`
      : receipt.isRecurring
      ? "Recurring"
      : "";

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm text-left">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h3 className="text-[13px] font-semibold uppercase tracking-widest text-gray-500">Donation Receipt</h3>
        {organization.name ? (
          <span className="text-[12px] text-[#737373]">
            {organization.name}
            {organization.taxId ? ` · Tax ID ${organization.taxId}` : ""}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col">
        <Section title="Payment">
          <Row label="Payment reference" value={receipt.reference} mono />
          <Row label="Date" value={formatDate(receipt.paidAt)} />
          {receipt.scheduledDate ? <Row label="Scheduled date" value={formatDate(receipt.scheduledDate)} /> : null}
          <Row label="Base amount" value={money(receipt.baseAmount)} />
          {receipt.processingFee ? (
            <Row label="Processing fee" value={`-${money(receipt.processingFee)}`} />
          ) : null}
          {receipt.netAmount ? <Row label="Net amount" value={money(receipt.netAmount)} /> : null}
          {receipt.isRecurring ? <Row label="Recurring payment" value={recurringLabel} /> : null}
          {receipt.isRecurring && recurring.frequency ? <Row label="Frequency" value={recurring.frequency} /> : null}
          {recurring.nextPaymentDate ? (
            <Row label="Next payment date" value={formatDate(recurring.nextPaymentDate)} />
          ) : null}
          {receipt.totalDonationAmount ? (
            <Row label="Total donation amount" value={money(receipt.totalDonationAmount)} />
          ) : null}
          <Row label="Provider" value={receipt.provider} />
          <Row label="Payment method" value={receipt.paymentMethod} />
          <Row label="Currency" value={String(currency).toUpperCase()} />
        </Section>

        {(receipt.donor?.name || receipt.donor?.email || receipt.campaignName) && (
          <Section title="Donor">
            <Row label="Name" value={receipt.donor?.name} />
            <Row label="Email" value={receipt.donor?.email} />
            <Row label="Campaign" value={receipt.campaignName} />
          </Section>
        )}

        {receipt.fundBreakdown?.length ? (
          <Section title="Fund breakdown">
            {receipt.fundBreakdown.map((row, index) => (
              <LineItem
                key={`${row.fundCode}-${row.designation}-${index}`}
                label={[row.fundCode, row.designation].filter(Boolean).join("  —  ") || "Allocation"}
                amount={row.amount}
                currency={currency}
              />
            ))}
          </Section>
        ) : null}

        {receipt.addons?.length ? (
          <Section title="Add-ons">
            {receipt.addons.map((addon, index) => (
              <LineItem key={`${addon.name}-${index}`} label={addon.name} amount={addon.amount} currency={currency} />
            ))}
          </Section>
        ) : null}

        {receipt.tip?.amount > 0 ? (
          <Section title="Platform support">
            <LineItem
              label={receipt.tip.percent ? `Platform support (${receipt.tip.percent}%)` : "Platform support"}
              amount={receipt.tip.amount}
              currency={currency}
            />
          </Section>
        ) : null}

        <div className="flex items-center justify-between gap-4 pt-3 mt-3 border-t border-[#E5E5E5]">
          <span className="text-[13px] font-semibold text-[#383838]">Amount charged today</span>
          <span className="text-[18px] font-bold text-[#055A46] tabular-nums">{money(receipt.amountChargedToday)}</span>
        </div>

        {organization.statement ? (
          <p className="text-[11px] text-[#737373] mt-3 italic">{organization.statement}</p>
        ) : null}

        {downloadButton}
      </div>
    </div>
  );
};

export default PaymentReceiptCard;
