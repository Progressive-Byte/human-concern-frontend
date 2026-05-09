"use client";

import StatusPill from "./StatusPill";
import FormsPagination from "./FormsPagination";
import FormRowActions from "./FormRowActions";

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

function safeDisplayName(item) {
  return item?.basics?.public?.displayName || item?.public?.displayName || item?.name || "—";
}

function getCampaignType(item) {
  return String(item?.basics?.public?.campaignType || item?.public?.campaignType || "").trim().toLowerCase();
}

function getFeatured(item) {
  return Boolean(item?.basics?.public?.featured || item?.public?.featured);
}

function labelCampaignType(value) {
  if (value === "ongoing") return "Ongoing";
  if (value === "seasonal") return "Seasonal";
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "—";
}

function computeCompletionPercent(item) {
  const sections = item?.sectionsCompleted || {};
  const keys = ["basics", "goalsDates", "causes", "objectives", "addons", "media"];

  const total = keys.length;
  const filled = keys.filter((k) => Boolean(sections?.[k])).length;
  return Math.round((filled / total) * 100);
}

export default function FormsTable({ items, loading, pagination, onPrevPage, onNextPage, onRefresh }) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#111827]">All Forms</h2>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      {loading ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No forms found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full border-collapse">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="px-5 py-3">Form</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Complete</th>
                <th className="py-3 pr-4">Fund Code</th>
                <th className="py-3 pr-4">Designation</th>
                <th className="py-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-[13px] text-[#111827]">
              {rows.map((item) => {
                const id = item?.id || item?.formId || item?._id;
                const fundCode = item?.basics?.internal?.fundCode || item?.internal?.fundCode || "—";
                const designation = item?.basics?.internal?.designation || item?.internal?.designation || "—";
                const status = item?.status || "draft";
                const campaignType = getCampaignType(item);
                const featured = getFeatured(item);
                const completion = computeCompletionPercent(item);

                return (
                  <tr
                    key={id || safeDisplayName(item)}
                    className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium">{safeDisplayName(item)}</div>
                      <div className="mt-1 text-[12px] text-[#6B7280]">
                        {labelCampaignType(campaignType)} • {featured ? "Featured" : "Not featured"}
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <StatusPill status={status} />
                    </td>
                    <td className="py-4 pr-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-[110px] rounded-full bg-[#F3F4F6]">
                          <div
                            className="h-2 rounded-full bg-red-600"
                            style={{ width: `${Math.max(0, Math.min(100, completion))}%` }}
                          />
                        </div>
                        <div className="text-[12px] font-semibold text-[#111827]">{completion}%</div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-top">{String(fundCode)}</td>
                    <td className="py-4 pr-4 align-top">{String(designation)}</td>
                    <td className="py-4 pr-5 align-top text-right">
                      <FormRowActions item={item} onRefresh={onRefresh} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FormsPagination pagination={pagination} onPrev={onPrevPage} onNext={onNextPage} />
    </section>
  );
}
