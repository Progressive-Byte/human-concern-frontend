"use client";

import Link from "next/link";

const FLAG_LABELS = [
  { key: "showProgressBar", label: "Show progress bar" },
  { key: "showStartEndDates", label: "Show start/end dates" },
  { key: "showAmountRaised", label: "Show amount raised" },
  { key: "showTargetAmount", label: "Show target amount" },
];

function Pill({ on }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        on ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#F3F4F6] text-[#6B7280]"
      }`}
    >
      {on ? "On" : "Off"}
    </span>
  );
}

/** Read-only view of the public display switches. Editing happens in the form wizard. */
const CampaignPublicDisplaySection = ({ data, loading }) => {
  const rows = Array.isArray(data?.display) ? data.display : [];

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[18px] font-semibold text-[#111827]">Public display</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          What each form shows on its public campaign page. These are display settings only — the figures
          above always show the real numbers. Edit them in the form&apos;s <strong>Goals &amp; Dates</strong> step.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
        {loading ? (
          <div className="space-y-3 px-5 py-4">
            <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#6B7280]">This campaign has no forms yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                  <th className="px-5 py-3">Form</th>
                  {FLAG_LABELS.map((f) => (
                    <th key={f.key} className="py-3 pr-4">
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {rows.map((r) => (
                  <tr key={r.formId} className="border-t border-[#F3F4F6]">
                    <td className="px-5 py-3">
                      <div className="font-semibold">{r.formName}</div>
                      <div className="text-[12px] text-[#6B7280]">{r.status}</div>
                    </td>
                    {FLAG_LABELS.map((f) => (
                      <td key={f.key} className="py-3 pr-4">
                        <Pill on={r[f.key] !== false} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data?.campaign?.id ? (
          <div className="border-t border-[#F3F4F6] px-5 py-3 text-[12px]">
            <Link href={`/admin/forms?campaignId=${data.campaign.id}`} className="text-[#111827] underline">
              Open this campaign&apos;s forms
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CampaignPublicDisplaySection;
