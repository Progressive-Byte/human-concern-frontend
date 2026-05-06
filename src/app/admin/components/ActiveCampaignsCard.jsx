import ProgressBar from "./ProgressBar";
import { formatCurrency } from "@/utils/helpers";

export default function ActiveCampaignsCard({ items = [], currency = "USD" }) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-[#111827]">Active Campaigns</h2>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-[#6B7280]">
          No active campaigns found
        </div>
      ) : (
        <div className="space-y-5">
          {rows.map((item) => (
            <div key={item?.campaignId || item?.campaignName} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-[#111827]">
                    {item?.campaignName || "—"}
                  </div>
                </div>
                <div className="text-[12px] text-[#6B7280]">{Number(item?.progressPercent || 0)}%</div>
              </div>

              <ProgressBar value={item?.progressPercent || 0} />

              <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                <div>{formatCurrency(item?.collected || 0, currency)}</div>
                <div>{Number(item?.donorsCount || 0).toLocaleString()} donors</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

