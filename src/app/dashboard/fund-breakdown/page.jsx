"use client";

import { useState, useMemo } from "react";
import DashboardHeader from "../components/DashboardHeader";

const RAW_FUNDS = [
  { label: "Zakat",            amount: 2500, color: "#055A46", bg: "#ECF9F3" },
  { label: "Sadaqah",          amount: 1200, color: "#B45309", bg: "#FFF8EC" },
  { label: "Emergency Relief", amount: 350,  color: "#EA3335", bg: "#FFF5F5" },
  { label: "Fitrana",          amount: 200,  color: "#1D4ED8", bg: "#EFF6FF" },
];

const impactStats = [
  { value: 156, label: "Families Fed",       color: "#055A46", bg: "#ECF9F3" },
  { value: 24,  label: "Children Educated",  color: "#B45309", bg: "#FFF8EC" },
  { value: 12,  label: "Medical Treatments", color: "#EA3335", bg: "#FFF5F5" },
  { value: 3,   label: "Water Wells Built",  color: "#1D4ED8", bg: "#EFF6FF" },
];

const R     = 75;
const STROKE = 30;
const C     = 2 * Math.PI * R;
const GAP   = 4;

export default function FundBreakdownPage() {
  const [hovered, setHovered] = useState(null);

  const { segments, total } = useMemo(() => {
    const total = RAW_FUNDS.reduce((sum, f) => sum + f.amount, 0);
    let cum = 0;
    const segments = RAW_FUNDS.map((f) => {
      const arc = (f.amount / total) * C;
      const seg = {
        ...f,
        arc: arc - GAP,
        offset: cum,
        pct: ((f.amount / total) * 100).toFixed(1),
      };
      cum += arc;
      return seg;
    });
    return { segments, total };
  }, []);

  const active = hovered ? segments.find((s) => s.label === hovered) : null;

  return (
    <>
      <DashboardHeader
        title="Fund Breakdown"
        subtitle="See how your donations are distributed across different funds"
      />

      <div className="flex-1 p-4 md:p-6 space-y-5">

        {/* Top two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Distribution Overview */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[#383838] mb-6">Distribution Overview</h2>

            <div className="flex flex-col items-center">
              <svg
                viewBox="0 0 200 200"
                className="w-48 h-48 md:w-56 md:h-56"
                onMouseLeave={() => setHovered(null)}
              >
                {/* Track ring */}
                <circle
                  cx="100" cy="100" r={R}
                  fill="none"
                  stroke="#F0F0F0"
                  strokeWidth={STROKE}
                />

                <g transform="rotate(-90 100 100)">
                  {segments.map((s) => {
                    const isHovered   = hovered === s.label;
                    const isDimmed    = hovered && !isHovered;
                    return (
                      <circle
                        key={s.label}
                        cx="100" cy="100" r={R}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={isHovered ? STROKE + 7 : STROKE}
                        strokeDasharray={`${s.arc} ${C}`}
                        strokeDashoffset={-s.offset}
                        strokeLinecap="butt"
                        opacity={isDimmed ? 0.25 : 1}
                        style={{ transition: "stroke-width 0.2s ease, opacity 0.2s ease", cursor: "pointer" }}
                        onMouseEnter={() => setHovered(s.label)}
                      />
                    );
                  })}
                </g>

                {/* Centre label — updates on hover */}
                {active ? (
                  <>
                    <text x="100" y="93" textAnchor="middle" style={{ fontSize: 16, fill: active.color, fontWeight: 700 }}>
                      ${active.amount.toLocaleString()}
                    </text>
                    <text x="100" y="108" textAnchor="middle" style={{ fontSize: 10, fill: active.color, fontWeight: 600 }}>
                      {active.pct}%
                    </text>
                    <text x="100" y="121" textAnchor="middle" style={{ fontSize: 9, fill: "#8C8C8C" }}>
                      {active.label}
                    </text>
                  </>
                ) : (
                  <>
                    <text x="100" y="96" textAnchor="middle" style={{ fontSize: 18, fill: "#383838", fontWeight: 700 }}>
                      ${(total / 1000).toFixed(1)}k
                    </text>
                    <text x="100" y="113" textAnchor="middle" style={{ fontSize: 10, fill: "#8C8C8C" }}>
                      Total
                    </text>
                  </>
                )}
              </svg>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                {segments.map((f) => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 text-xs cursor-pointer transition-opacity"
                    style={{ opacity: hovered && hovered !== f.label ? 0.35 : 1 }}
                    onMouseEnter={() => setHovered(f.label)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: f.color }} />
                    <span style={{ color: hovered === f.label ? f.color : "#383838", fontWeight: hovered === f.label ? 600 : 400 }}>
                      {f.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Fund Details */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[#383838] mb-5">Fund Details</h2>

            <div className="space-y-2">
              {segments.map((f) => {
                const isHovered = hovered === f.label;
                const isDimmed  = hovered && !isHovered;
                return (
                  <div
                    key={f.label}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all cursor-pointer"
                    style={{
                      backgroundColor: isHovered ? f.bg : "#FAFAFA",
                      borderColor: isHovered ? f.color + "40" : "#F0F0F0",
                      opacity: isDimmed ? 0.45 : 1,
                    }}
                    onMouseEnter={() => setHovered(f.label)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#383838]">{f.label}</p>
                        <p className="text-xs text-[#8C8C8C] mt-0.5">{f.pct}% of total</p>
                      </div>
                    </div>
                    <p
                      className="font-semibold shrink-0 ml-3 transition-colors"
                      style={{ color: isHovered ? f.color : "#383838" }}
                    >
                      ${f.amount.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Total row */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#EBEBEB]">
              <p className="font-semibold text-[#383838]">Total Donated</p>
              <p className="text-lg font-bold text-[#055A46]">${total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 md:p-6">
          <h2 className="text-lg font-semibold text-[#383838] mb-5">Your Impact Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {impactStats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[#F0F0F0] p-4 md:p-5 text-center transition-all hover:shadow-sm"
                style={{ backgroundColor: s.bg }}
              >
                <p className="text-3xl md:text-4xl font-bold leading-none" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-xs text-[#8C8C8C] mt-2 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
