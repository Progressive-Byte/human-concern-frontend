"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { getUserFundBreakdown } from "@/services/donationService";
import { formatCurrency } from "@/utils/helpers";
import { SkeletonBlock, SkeletonStack } from "@/components/ui/Skeleton";

const R     = 75;
const STROKE = 30;
const C     = 2 * Math.PI * R;
const GAP   = 4;

const FundBreakdownPage = () => {
  const [hovered, setHovered] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserFundBreakdown();
        if (!alive) return;
        const d = res?.data?.data || res?.data || null;
        setData(d);
      } catch (e) {
        if (!alive) return;
        setData(null);
        setError(e?.message || "Failed to load fund breakdown.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const currency = String(data?.currency || "USD");

  const colorFor = useMemo(() => {
    const known = {
      Zakat: { color: "#047857", bg: "#ECFDF5" },
      Sadaqah: { color: "#B45309", bg: "#FFF8EC" },
      "Emergency Relief": { color: "#EA3335", bg: "#FFF5F5" },
      Fitrana: { color: "#1D4ED8", bg: "#EFF6FF" },
      Other: { color: "#6B7280", bg: "#F3F4F6" },
    };
    const palette = [
      { color: "#047857", bg: "#ECFDF5" },
      { color: "#B45309", bg: "#FFF8EC" },
      { color: "#EA3335", bg: "#FFF5F5" },
      { color: "#1D4ED8", bg: "#EFF6FF" },
      { color: "#6B7280", bg: "#F3F4F6" },
    ];
    return (label, index) => known[label] || palette[index % palette.length];
  }, []);

  const donutItems = useMemo(() => {
    const items = data?.distributionOverview?.items;
    return Array.isArray(items) ? items : [];
  }, [data]);

  const detailItems = useMemo(() => {
    const items = data?.funds?.items;
    return Array.isArray(items) ? items : [];
  }, [data]);

  const { segments, totalAllocated } = useMemo(() => {
    const base = donutItems.map((it, idx) => {
      const label = String(it?.label || "").trim() || "—";
      const amount = Number(it?.amount ?? 0);
      const pct = Number(it?.percentOfTotal ?? 0);
      const style = colorFor(label, idx);
      return { label, amount, pct, ...style };
    });

    const totalAllocated = Number(data?.totalAllocated ?? base.reduce((sum, f) => sum + (Number(f.amount) || 0), 0));
    let cum = 0;
    const segments = base.map((f) => {
      const arc = totalAllocated > 0 ? (f.amount / totalAllocated) * C : 0;
      const seg = {
        ...f,
        arc: arc - GAP,
        offset: cum,
        pctText: `${Number.isFinite(f.pct) ? f.pct.toFixed(1) : "0.0"}`,
      };
      cum += arc;
      return seg;
    });
    return { segments, totalAllocated };
  }, [donutItems, data?.totalAllocated, colorFor]);

  const active = hovered ? segments.find((s) => s.label === hovered) : null;
  const totalDonated = Number(data?.totalDonated ?? 0);

  return (
    <>
      <DashboardHeader
        title="Fund Breakdown"
        subtitle="See how your donations are distributed across different funds"
      />

      <div className="flex-1 p-4 md:p-6 space-y-5">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</div>
        ) : null}

        {/* Top two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Distribution Overview */}
          <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[#111827] mb-6">Distribution Overview</h2>

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
                  stroke="#F3F4F6"
                  strokeWidth={STROKE}
                />

                <g transform="rotate(-90 100 100)">
                  {loading ? null : segments.map((s) => {
                    const isHovered = hovered === s.label;
                    const isDimmed  = hovered && !isHovered;
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

                {active ? (
                  <>
                    <text x="100" y="93" textAnchor="middle" style={{ fontSize: 16, fill: active.color, fontWeight: 700 }}>
                      {formatCurrency(active.amount, currency)}
                    </text>
                    <text x="100" y="108" textAnchor="middle" style={{ fontSize: 10, fill: active.color, fontWeight: 600 }}>
                      {active.pctText}%
                    </text>
                    <text x="100" y="121" textAnchor="middle" style={{ fontSize: 9, fill: "#6B7280" }}>
                      {active.label}
                    </text>
                  </>
                ) : (
                  <>
                    <text x="100" y="96" textAnchor="middle" style={{ fontSize: 18, fill: "#111827", fontWeight: 700 }}>
                      {loading ? "—" : formatCurrency(totalAllocated, currency)}
                    </text>
                    <text x="100" y="113" textAnchor="middle" style={{ fontSize: 10, fill: "#6B7280" }}>
                      {loading ? "Loading" : "Total Allocated"}
                    </text>
                  </>
                )}
              </svg>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                {loading ? (
                  <SkeletonBlock className="h-5 w-44 rounded" />
                ) : (
                  segments.map((f) => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 text-xs cursor-pointer transition-opacity"
                    style={{ opacity: hovered && hovered !== f.label ? 0.35 : 1 }}
                    onMouseEnter={() => setHovered(f.label)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: f.color }} />
                    <span style={{ color: hovered === f.label ? f.color : "#111827", fontWeight: hovered === f.label ? 600 : 400 }}>
                      {f.label}
                    </span>
                  </span>
                ))
                )}
              </div>
            </div>
          </div>

          {/* Fund Details */}
          <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-5 md:p-6">
            <h2 className="text-lg font-semibold text-[#111827] mb-5">Fund Details</h2>

            <div className="space-y-2">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
                  <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
                  <div className="h-12 animate-pulse rounded-xl bg-[#F3F4F6]" />
                </div>
              ) : detailItems.length ? (
                detailItems.map((it, idx) => {
                  const label = String(it?.label || "").trim() || "—";
                  const amount = Number(it?.amount ?? 0);
                  const pct = Number(it?.percentOfTotal ?? 0);
                  const style = colorFor(label, idx);
                  const isHovered = hovered === label;
                  const isDimmed = hovered && !isHovered;
                  return (
                    <div
                      key={String(it?.causeId || idx)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-dashed transition-all cursor-pointer"
                      style={{
                        backgroundColor: isHovered ? style.bg : "#F9FAFB",
                        borderColor: isHovered ? style.color + "40" : "#E5E7EB",
                        opacity: isDimmed ? 0.45 : 1,
                      }}
                      onMouseEnter={() => setHovered(label)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: style.color }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#111827]">{label}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5">{pct.toFixed(1)}% of total</p>
                        </div>
                      </div>
                      <p className="font-semibold shrink-0 ml-3 transition-colors" style={{ color: isHovered ? style.color : "#111827" }}>
                        {formatCurrency(amount, currency)}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-sm text-[#6B7280]">No data available.</div>
              )}
            </div>

            {/* Total row */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-[#E5E7EB]">
              <p className="font-semibold text-[#111827]">Total Donated</p>
              <p className="text-lg font-bold text-[#EA3335]">{loading ? "—" : formatCurrency(totalDonated, currency)}</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
export default FundBreakdownPage;
