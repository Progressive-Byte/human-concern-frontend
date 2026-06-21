"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import { getUserFundBreakdown } from "@/services/donationService";
import { DistributionOverviewCard } from "./components/DistributionOverviewCard";
import { FundDetailsCard } from "./components/FundDetailsCard";

const DONUT_C   = 2 * Math.PI * 75;
const DONUT_GAP = 4;

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
        setData(res?.data?.data || res?.data || null);
      } catch (e) {
        if (!alive) return;
        setData(null);
        setError(e?.message || "Failed to load fund breakdown.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const currency    = String(data?.currency || "USD");
  const totalDonated = Number(data?.totalDonated ?? 0);

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
      return {
        label,
        amount: Number(it?.amount ?? 0),
        pct:    Number(it?.percentOfTotal ?? 0),
        ...colorFor(label, idx),
      };
    });

    const totalAllocated = Number(
      data?.totalAllocated ?? base.reduce((sum, f) => sum + f.amount, 0)
    );
    let cum = 0;
    const segments = base.map((f) => {
      const arc = totalAllocated > 0 ? (f.amount / totalAllocated) * DONUT_C : 0;
      const seg = {
        ...f,
        arc:     arc - DONUT_GAP,
        offset:  cum,
        pctText: Number.isFinite(f.pct) ? f.pct.toFixed(1) : "0.0",
      };
      cum += arc;
      return seg;
    });
    return { segments, totalAllocated };
  }, [donutItems, data?.totalAllocated]);

  return (
    <>
      <DashboardHeader
        title="Fund Breakdown"
        subtitle="See how your donations are distributed across different funds"
      />

      <div className="flex-1 p-4 md:p-6 space-y-5">
        {error ? (
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DistributionOverviewCard
            loading={loading}
            segments={segments}
            hovered={hovered}
            onHover={setHovered}
            totalAllocated={totalAllocated}
            currency={currency}
          />
          <FundDetailsCard
            loading={loading}
            items={detailItems}
            hovered={hovered}
            onHover={setHovered}
            totalDonated={totalDonated}
            currency={currency}
          />
        </div>
      </div>
    </>
  );
};

export default FundBreakdownPage;
