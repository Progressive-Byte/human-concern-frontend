"use client";

import { formatCurrency } from "@/utils/helpers";

function FlagIcon({ code, label }) {
  const c = String(code || "").toUpperCase().slice(0, 2);
  const display = c || "🏳️";
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F3F4F6] text-sm" title={label || code || ""}>
      {display}
    </span>
  );
}

function ShieldIcon({ ok }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill={ok ? "currentColor" : "none"}
      />
      {ok ? (
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 9l6 6M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BulletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

const SCA_THRESHOLDS_EUR = {
  default: 30,
  AT: 30, BE: 30, BG: 75, HR: 100, CY: 50, CZ: 1500, DK: 500,
  EE: 30, FI: 30, FR: 50, DE: 30, GR: 30, HU: 150, IE: 30,
  IT: 25, LV: 75, LT: 50, LU: 30, MT: 30, NL: 30, PL: 100,
  PT: 30, RO: 50, SK: 50, SI: 40, ES: 30, SE: 25, NO: 30,
  IS: 30, LI: 30, GB: 25,
};

function findScaThreshold(merchantCountry, currency) {
  const c = String(merchantCountry || "").toUpperCase().slice(0, 2);
  const curr = String(currency || "").toUpperCase();
  const base = SCA_THRESHOLDS_EUR[c] || SCA_THRESHOLDS_EUR.default;
  const mult = curr === "GBP" ? 0.86 : curr === "USD" ? 1.08 : 1;
  return { threshold: Math.round(base * mult * 100) / 100, currency: curr };
}

const ThreeDSComplianceAuditDetail = ({ discrepancy, rawProviderSnapshot = null, rawLocalSnapshot = null }) => {
  const provider = rawProviderSnapshot || discrepancy?.rawProviderSnapshot || {};
  const local = rawLocalSnapshot || discrepancy?.rawLocalSnapshot || {};
  const threeDS = provider?.threeDS || provider?.three_ds || local?.threeDS || local?.three_ds || {};

  const merchantCountry = String(provider?.merchantCountry || local?.merchantCountry || "");
  const donorCountry = String(provider?.donorCountry || local?.donorCountry || provider?.cardCountry || local?.cardCountry || "");
  const amount = Number(provider?.amount || local?.amount || 0);
  const currency = String(provider?.currency || local?.currency || "USD");
  const { threshold, currency: thresholdCurrency } = findScaThreshold(merchantCountry, currency);
  const overScaThreshold = amount > 0 && amount >= threshold;

  const challengeRequired = Boolean(threeDS?.challengeRequired ?? threeDS?.challenge_required);
  const liabilityShifted = Boolean(threeDS?.liabilityShifted ?? threeDS?.liability_shifted);
  const eci = String(threeDS?.eci || threeDS?.ECI || "");

  const eciPass = /^(0[257]|06|2|5)$/.test(eci);

  const audited = Boolean(provider?.threeDS || provider?.three_ds || local?.threeDS || local?.three_ds);
  const passes = audited && liabilityShifted && eciPass && (!overScaThreshold || challengeRequired);

  const chargebackRiskLevel = passes
    ? "low"
    : !audited
      ? "unknown"
      : !liabilityShifted || overScaThreshold && !challengeRequired
        ? "high"
        : "medium";

  const riskBadge = {
    low: "bg-emerald-50 text-emerald-700",
    medium: "bg-amber-50 text-amber-800",
    high: "bg-red-500/10 text-red-700",
    unknown: "bg-gray-100 text-gray-600",
  }[chargebackRiskLevel] || "bg-gray-100 text-gray-600";

  const riskLabel = {
    low: "Low chargeback risk",
    medium: "Moderate chargeback risk",
    high: "Elevated chargeback risk",
    unknown: "No 3DS audit data",
  }[chargebackRiskLevel] || "Unknown";

  const remediation = [];
  if (!audited) remediation.push("Attach a payment processor 3DS summary payload before settling the transaction.");
  if (!liabilityShifted) remediation.push("Confirm with gateway that `three_ds.liability_shifted=true` before writing off this discrepancy.");
  if (overScaThreshold && !challengeRequired) remediation.push(`SCA threshold (≈ ${formatCurrency(threshold, thresholdCurrency)}) exceeded without a challenge flow. Flag for manual review / possible refund.`);
  if (!eciPass) remediation.push(`ECI indicator '${eci || "n/a"}' does not match a strong-authentication outcome. Cross-check in the provider dashboard.`);
  if (!passes && remediation.length === 0) remediation.push("Review discrepancy source and mark verified if out-of-band evidence confirms legitimacy.");

  return (
    <div className="mt-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#111827]">
            <span className="text-[#B91C1C]"><ShieldIcon ok={false} /></span>
            3DS Compliance Audit
          </div>
          <div className="mt-1 text-[12px] text-[#6B7280]">
            Cross-check SCA thresholds, challenge indicators, and liability shift for this transaction.
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${riskBadge}`}>
          {riskLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Merchant Country</div>
          <div className="mt-2 flex items-center gap-2">
            <FlagIcon code={merchantCountry} />
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-[#111827]">{merchantCountry || "—"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Donor / Card Country</div>
          <div className="mt-2 flex items-center gap-2">
            <FlagIcon code={donorCountry} />
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-[#111827]">{donorCountry || "—"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Amount vs SCA Threshold</div>
          <div className="mt-2">
            <div className="text-[13px] font-semibold text-[#111827]">
              {formatCurrency(amount, currency)}
              <span className="text-[12px] text-[#6B7280] mx-1">vs</span>
              <span className={overScaThreshold ? "text-[#B91C1C]" : "text-emerald-700"}>
                {formatCurrency(threshold, thresholdCurrency)}
              </span>
            </div>
            <div className={`mt-0.5 text-[11px] font-semibold ${overScaThreshold ? "text-[#B91C1C]" : "text-emerald-700"}`}>
              {overScaThreshold ? "Over SCA threshold — challenge required by law" : "Under SCA threshold"}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">3DS Result</div>
          <div className="mt-2 space-y-1 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Challenge required</span>
              <span className={`font-semibold ${challengeRequired ? "text-amber-700" : "text-[#6B7280]"}`}>{challengeRequired ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Liability shifted</span>
              <span className={`font-semibold ${liabilityShifted ? "text-emerald-700" : "text-[#B91C1C]"}`}>{liabilityShifted ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">ECI</span>
              <span className={`font-mono font-semibold ${eciPass ? "text-emerald-700" : "text-[#B91C1C]"}`}>{eci || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {chargebackRiskLevel === "high" || chargebackRiskLevel === "medium" ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <span className="mt-0.5 text-amber-700"><WarningIcon /></span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-amber-800">
              {chargebackRiskLevel === "high" ? "Potential chargeback liability" : "Watchlist item"}
            </div>
            <div className="mt-1 text-[12px] text-amber-800/90">
              If this transaction is challenged by the cardholder, the merchant may be liable for the full amount.
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white p-4">
        <div className="text-[12px] font-semibold text-[#111827]">Suggested remediation</div>
        <ul className="mt-2 space-y-1.5">
          {remediation.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-[#111827]">
              <span className="mt-1 text-[#111827]/50"><BulletIcon /></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ThreeDSComplianceAuditDetail;
