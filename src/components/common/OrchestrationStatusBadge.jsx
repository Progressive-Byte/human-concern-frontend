"use client";

import { CIRCUIT_STATUS, CHALLENGE_STATUS, RECON_STATUS, categoryDisplay } from "@/utils/errorMaps";
import DonationStatusPill from "@/app/admin/donations/components/DonationStatusPill";

function LookupBadge({ map, key, fallback }) {
  const lookup = String(key || "").trim();
  const entry = map?.[lookup];
  if (!entry) return fallback ?? <DonationStatusPill status={lookup} />;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${entry.className}`.trim()}>
      {entry.label}
    </span>
  );
}

const CircuitStatusBadge = ({ status, ...rest }) => (
  <LookupBadge map={CIRCUIT_STATUS} key={status} {...rest} />
);

const ChallengeStatusBadge = ({ status, ...rest }) => (
  <LookupBadge map={CHALLENGE_STATUS} key={status} {...rest} />
);

const ReconStatusBadge = ({ status, ...rest }) => (
  <LookupBadge map={RECON_STATUS} key={status} {...rest} />
);

const DiscrepancyCategoryBadge = ({ category, ...rest }) => (
  <LookupBadge map={categoryDisplay} key={category} {...rest} />
);

export function OrchestrationStatusBadge({ type, value, ...rest }) {
  const t = String(type || "").toLowerCase();
  if (t === "circuit") return <CircuitStatusBadge status={value} {...rest} />;
  if (t === "challenge" || t === "auth" || t === "installment") return <ChallengeStatusBadge status={value} {...rest} />;
  if (t === "recon" || t === "reconciliation") return <ReconStatusBadge status={value} {...rest} />;
  if (t === "discrepancy" || t === "category") return <DiscrepancyCategoryBadge category={value} {...rest} />;
  return <DonationStatusPill status={value} />;
}

export {
  CircuitStatusBadge,
  ChallengeStatusBadge,
  ReconStatusBadge,
  DiscrepancyCategoryBadge,
};

export default OrchestrationStatusBadge;
