import { SkeletonStack } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";

const KNOWN_COLORS = {
  Zakat:              { color: "#047857", bg: "#ECFDF5" },
  Sadaqah:            { color: "#B45309", bg: "#FFF8EC" },
  "Emergency Relief": { color: "#EA3335", bg: "#FFF5F5" },
  Fitrana:            { color: "#1D4ED8", bg: "#EFF6FF" },
  Other:              { color: "#6B7280", bg: "#F3F4F6" },
};
const COLOR_PALETTE = [
  { color: "#047857", bg: "#ECFDF5" },
  { color: "#B45309", bg: "#FFF8EC" },
  { color: "#EA3335", bg: "#FFF5F5" },
  { color: "#1D4ED8", bg: "#EFF6FF" },
  { color: "#6B7280", bg: "#F3F4F6" },
];
function colorFor(label, index) {
  return KNOWN_COLORS[label] || COLOR_PALETTE[index % COLOR_PALETTE.length];
}

function FundDetailItem({ it, idx, hovered, onHover, currency }) {
  const label    = String(it?.label || "").trim() || "—";
  const amount   = Number(it?.amount ?? 0);
  const pct      = Number(it?.percentOfTotal ?? 0);
  const style    = colorFor(label, idx);
  const isHovered = hovered === label;
  const isDimmed  = hovered && !isHovered;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl border border-dashed transition-all cursor-pointer ${
        isDimmed ? "opacity-[0.45]" : "opacity-100"
      }`}
      style={{
        backgroundColor: isHovered ? style.bg : "#F9FAFB",
        borderColor:     isHovered ? `${style.color}40` : "#E5E7EB",
      }}
      onMouseEnter={() => onHover(label)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: style.color }} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#111827]">{label}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">{pct.toFixed(1)}% of total</p>
        </div>
      </div>
      <p
        className="font-semibold shrink-0 ml-3 transition-colors"
        style={{ color: isHovered ? style.color : "#111827" }}
      >
        {formatCurrency(amount, currency)}
      </p>
    </div>
  );
}

export function FundDetailsCard({ loading, items, hovered, onHover, totalDonated, currency }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <h2 className="text-lg font-semibold text-[#111827] mb-5">Fund Details</h2>

      <div className="space-y-2">
        {loading ? (
          <SkeletonStack count={3} blockClass="h-12 rounded-xl" />
        ) : items.length ? (
          items.map((it, idx) => (
            <FundDetailItem
              key={String(it?.causeId || idx)}
              it={it}
              idx={idx}
              hovered={hovered}
              onHover={onHover}
              currency={currency}
            />
          ))
        ) : (
          <div className="py-10 text-center text-sm text-[#6B7280]">No data available.</div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-[#E5E7EB]">
        <p className="font-semibold text-[#111827]">Total Donated</p>
        <p className="text-lg font-bold text-[#EA3335]">
          {loading ? "—" : formatCurrency(totalDonated, currency)}
        </p>
      </div>
    </div>
  );
}
