"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function formatCurrency(value) {
  const n = Number(value) || 0;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const TrendChart = ({ series = [], bucket = "day" }) => {
  const data = (Array.isArray(series) ? series : []).map((p) => ({
    bucket: String(p?.bucket || ""),
    amount: Number(p?.amount || 0),
    donations: Number(p?.count || 0),
  }));

  const title = bucket === "month" ? "Donation trend (monthly)" : bucket === "week" ? "Donation trend (weekly)" : "Donation trend (daily)";

  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-5">
      <h2 className="mb-4 text-[16px] font-semibold text-[#111827]">{title}</h2>

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-[#6B7280]">
          No donations in this period
        </div>
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="reportTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--admin-accent-600, #EA3335)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--admin-accent-600, #EA3335)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" />
              <XAxis dataKey="bucket" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value, name) => (name === "amount" ? [formatCurrency(value), "Committed"] : [value, "Donations"])}
                contentStyle={{ borderRadius: 12, borderColor: "#E5E7EB" }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--admin-accent-600, #EA3335)"
                strokeWidth={2}
                fill="url(#reportTrend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TrendChart;
