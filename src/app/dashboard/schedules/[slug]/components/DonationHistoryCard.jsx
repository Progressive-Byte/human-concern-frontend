import { SkeletonRows } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";
const causeBadgeStyles = {
  Zakat:     "bg-[#ECFDF5] text-[#047857]",
  Sadaqah:   "bg-[#FFF8EC] text-[#B45309]",
  Emergency: "bg-[#FFF5F5] text-[#EA3335]",
  Fitrana:   "bg-[#EFF6FF] text-[#1D4ED8]",
};
function statusClass(key) {
  const s = String(key || "").toLowerCase();
  if (s === "succeeded") return "text-[#047857]";
  if (s === "pending" || s === "requires_action") return "text-[#B45309]";
  if (s === "failed") return "text-[#EA3335]";
  if (s === "refunded") return "text-[#6B7280]";
  return "text-[#047857]";
}
function statusDotClass(key) {
  const s = String(key || "").toLowerCase();
  if (s === "succeeded") return "bg-[#047857]";
  if (s === "pending" || s === "requires_action") return "bg-[#B45309]";
  if (s === "failed") return "bg-[#EA3335]";
  if (s === "refunded") return "bg-[#6B7280]";
  return "bg-[#047857]";
}
function formatShortDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

const HEADERS = ["Date", "Amount", "Cause", "Status", "Receipt"];

function HistoryRow({ row, currency }) {
  const date = formatShortDate(row?.date) || "—";
  const amount = Number(row?.amount ?? 0);
  const cur = String(row?.currency || currency);
  const causes = Array.isArray(row?.causes) ? row.causes : [];
  const causeLabel = String(causes?.[0]?.label || "").trim() || "—";
  const rowStatusKey = String(row?.status?.key || "").trim().toLowerCase();
  const rowStatusLabel = String(row?.status?.label || "").trim() || "—";

  return (
    <tr className="hover:bg-[#F9FAFB] transition-colors">
      <td className="py-3.5 px-2 first:pl-0 text-[#111827] font-medium">{date}</td>
      <td className="py-3.5 px-2 text-[#111827] font-semibold">{formatCurrency(amount, cur)}</td>
      <td className="py-3.5 px-2">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${causeBadgeStyles[causeLabel] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
          {causeLabel}
        </span>
      </td>
      <td className="py-3.5 px-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusClass(rowStatusKey)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass(rowStatusKey)}`} />
          {rowStatusLabel}
        </span>
      </td>
      <td className="py-3.5 px-2 last:pr-0 text-[#6B7280]">—</td>
    </tr>
  );
}

export function DonationHistoryCard({ loading, history, currency }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <h2 className="text-base font-semibold text-[#111827] mb-4">Donation History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-120">
          <thead>
            <tr className="text-left border-b border-[#E5E7EB]">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="pb-3 px-2 first:pl-0 last:pr-0 text-[11px] font-semibold tracking-widest uppercase text-[#6B7280]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {loading ? (
              <SkeletonRows rows={4} cols={5} cellClass="px-2 py-2.5" />
            ) : history.length ? (
              history.map((row, i) => (
                <HistoryRow key={String(row?.transactionId || i)} row={row} currency={currency} />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-[#6B7280]">
                  No donations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
