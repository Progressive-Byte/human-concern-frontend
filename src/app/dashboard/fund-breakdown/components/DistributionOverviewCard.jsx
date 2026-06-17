import { SkeletonBlock } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/helpers";

const DONUT_R      = 75;
const DONUT_STROKE = 30;
const DONUT_C      = 2 * Math.PI * DONUT_R;

export function DistributionOverviewCard({ loading, segments, hovered, onHover, totalAllocated, currency }) {
  const active = hovered ? segments.find((s) => s.label === hovered) : null;

  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
      <h2 className="text-lg font-semibold text-[#111827] mb-6">Distribution Overview</h2>

      <div className="flex flex-col items-center">
        <svg
          viewBox="0 0 200 200"
          className="w-48 h-48 md:w-56 md:h-56"
          onMouseLeave={() => onHover(null)}
        >
          <circle
            cx="100" cy="100" r={DONUT_R}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={DONUT_STROKE}
          />

          <g transform="rotate(-90 100 100)">
            {!loading && segments.map((s) => {
              const isActive = hovered === s.label;
              const isDimmed = hovered && !isActive;
              return (
                <circle
                  key={s.label}
                  cx="100" cy="100" r={DONUT_R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={isActive ? DONUT_STROKE + 7 : DONUT_STROKE}
                  strokeDasharray={`${s.arc} ${DONUT_C}`}
                  strokeDashoffset={-s.offset}
                  strokeLinecap="butt"
                  opacity={isDimmed ? 0.25 : 1}
                  className="cursor-pointer [transition:stroke-width_0.2s_ease,opacity_0.2s_ease]"
                  onMouseEnter={() => onHover(s.label)}
                />
              );
            })}
          </g>

          {active ? (
            <>
              <text x="100" y="93" textAnchor="middle" style={{ fill: active.color }} className="text-base font-bold">
                {formatCurrency(active.amount, currency)}
              </text>
              <text x="100" y="108" textAnchor="middle" style={{ fill: active.color }} className="text-[10px] font-semibold">
                {active.pctText}%
              </text>
              <text x="100" y="121" textAnchor="middle" className="text-[9px] fill-[#6B7280]">
                {active.label}
              </text>
            </>
          ) : (
            <>
              <text x="100" y="96" textAnchor="middle" className="text-lg fill-[#111827] font-bold">
                {loading ? "—" : formatCurrency(totalAllocated, currency)}
              </text>
              <text x="100" y="113" textAnchor="middle" className="text-[10px] fill-[#6B7280]">
                {loading ? "Loading" : "Total Allocated"}
              </text>
            </>
          )}
        </svg>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
          {loading ? (
            <SkeletonBlock className="h-5 w-44 rounded" />
          ) : (
            segments.map((f) => (
              <span
                key={f.label}
                className={`inline-flex items-center gap-1.5 text-xs cursor-pointer transition-opacity ${
                  hovered && hovered !== f.label ? "opacity-35" : "opacity-100"
                }`}
                onMouseEnter={() => onHover(f.label)}
                onMouseLeave={() => onHover(null)}
              >
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: f.color }} />
                <span
                  className={hovered === f.label ? "font-semibold" : "font-normal"}
                  style={{ color: hovered === f.label ? f.color : "#111827" }}
                >
                  {f.label}
                </span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
