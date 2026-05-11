import DonorRowActions from "./DonorRowActions";
import DonorStatusPill from "./DonorStatusPill";
import { formatCurrency } from "@/utils/helpers";

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

function PaginationBar({ pagination, showingCount, onPrev, onNext }) {
  if (!pagination) return null;

  const page = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 1);
  const total = Number(pagination?.total || 0);

  return (
    <div className="flex items-center justify-between border-t border-[#F3F4F6] px-5 py-4">
      <div className="text-[12px] text-[#6B7280]">
        Showing <span className="font-semibold text-[#111827]">{Number(showingCount || 0)}</span> of{" "}
        <span className="font-semibold text-[#111827]">{total}</span> donors
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-2 text-[13px] font-semibold text-[#111827] transition hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch (e) {
    return "—";
  }
}

function initialsFrom(value) {
  const s = String(value || "").trim();
  if (!s) return "—";
  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  const out = `${first}${last}`.toUpperCase();
  return out || "—";
}

function RecurringPill({ value, loading }) {
  if (loading) return <span className="text-[#9CA3AF]">—</span>;
  return value ? (
    <span className="inline-flex rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[12px] font-semibold text-[#047857]">Yes</span>
  ) : (
    <span className="text-[#9CA3AF]">—</span>
  );
}

export default function DonorsTable({
  items,
  loading,
  pagination,
  recurringByKey,
  onPrevPage,
  onNextPage,
  onViewDetails,
  onEditProfile,
  onToggleStatus,
  onSendEmail,
}) {
  const rows = Array.isArray(items) ? items : [];
  const totalCount = Number(pagination?.total || 0);
  const titleCount = totalCount > 0 ? totalCount : rows.length;

  return (
    <section className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white">
      <div className="px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#111827]">All Donors ({titleCount})</h2>
      </div>

      <div className="border-t border-[#F3F4F6]" />

      {loading ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6B7280]">No donors found. Try a different search or filter.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-[13px] text-[#111827]">
            <thead>
              <tr className="text-left text-[12px] font-medium text-[#6B7280]">
                <th className="px-5 py-3">Donor</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Total Donated</th>
                <th className="py-3 pr-4">Donations</th>
                <th className="py-3 pr-4">Last Donation</th>
                <th className="py-3 pr-4">Recurring</th>
                <th className="py-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((item) => (
                <tr
                  key={item?.key || item?.email || item?.name}
                  className="border-t border-[#F3F4F6] transition-colors duration-200 hover:bg-[#F9FAFB]"
                >
                  <td className="px-5 py-4 align-top">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111827]/5 text-[13px] font-semibold text-[#111827]">
                        {initialsFrom(item?.name || item?.email)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#111827]">{item?.name || "—"}</div>
                        <div className="mt-1 truncate text-[13px] text-[#6B7280]">{item?.email || item?.phone || "—"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 pr-4 align-top">
                    <DonorStatusPill status={item?.status} />
                  </td>

                  <td className="py-4 pr-4 align-top text-[#111827]">
                    {formatCurrency(Number(item?.totalDonated || 0))}
                  </td>

                  <td className="py-4 pr-4 align-top text-[#111827]">{item?.donationCount ?? "—"}</td>

                  <td className="py-4 pr-4 align-top text-[#6B7280]">{formatDate(item?.lastDonationAt)}</td>

                  <td className="py-4 pr-4 align-top text-[#6B7280]">
                    <RecurringPill
                      value={Boolean(recurringByKey?.[item?.key]?.isRecurring)}
                      loading={Boolean(recurringByKey?.[item?.key]?.loading)}
                    />
                  </td>

                  <td className="py-4 pr-5 align-top text-right">
                    <DonorRowActions
                      donor={item}
                      onViewDetails={onViewDetails}
                      onEditProfile={onEditProfile}
                      onToggleStatus={onToggleStatus}
                      onSendEmail={onSendEmail}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaginationBar pagination={pagination} showingCount={rows.length} onPrev={onPrevPage} onNext={onNextPage} />
    </section>
  );
}
