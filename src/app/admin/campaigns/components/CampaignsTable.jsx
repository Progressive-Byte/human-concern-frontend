import { formatCurrency } from "@/utils/helpers";
import ProgressBar from "@/app/admin/components/ProgressBar";
import FormsPreviewChips from "./FormsPreviewChips";
import StatusPill from "./StatusPill";
import CampaignsPagination from "./CampaignsPagination";

function SkeletonRows() {
  return (
    <div className="space-y-3 px-5 py-4">
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
      <div className="h-10 animate-pulse rounded-lg bg-[#F3F4F6]" />
    </div>
  );
}

export default function CampaignsTable({
  items,
  currency = "USD",
  loading,
  pagination,
  onPrevPage,
  onNextPage,
}) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#111827]">All Campaigns</h2>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      {loading ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No campaigns found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="px-5 py-3">Campaign</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Goal</th>
                <th className="py-3 pr-4">Raised</th>
                <th className="py-3 pr-4">Progress</th>
                <th className="py-3 pr-4">Donors</th>
                <th className="py-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-[13px] text-[#111827]">
              {rows.map((item) => {
                const percent = item?.progressPercent;
                const showPercent = percent === null || percent === undefined ? null : Number(percent);

                return (
                  <tr
                    key={item?.id || item?.slug || item?.name}
                    className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium">{item?.name || "—"}</div>
                      <FormsPreviewChips items={item?.formsPreview || []} />
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <StatusPill status={item?.status} />
                    </td>
                    <td className="py-4 pr-4 align-top">{formatCurrency(item?.goalAmount || 0, currency)}</td>
                    <td className="py-4 pr-4 align-top">{formatCurrency(item?.raisedAmount || 0, currency)}</td>
                    <td className="py-4 pr-4 align-top">
                      {showPercent === null || Number.isNaN(showPercent) ? (
                        <span className="text-[#6B7280]">—</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-[140px]">
                            <ProgressBar value={showPercent} />
                          </div>
                          <div className="text-[12px] text-[#6B7280]">{showPercent}%</div>
                        </div>
                      )}
                    </td>
                    <td className="py-4 pr-4 align-top">{Number(item?.donorsCount || 0).toLocaleString()}</td>
                    <td className="py-4 pr-5 align-top text-right">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-white"
                        aria-label="Row actions"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#111827]" fill="none">
                          <path
                            d="M5 12h.01M12 12h.01M19 12h.01"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination ? (
        <CampaignsPagination pagination={pagination} onPrev={onPrevPage} onNext={onNextPage} />
      ) : null}
    </section>
  );
}

