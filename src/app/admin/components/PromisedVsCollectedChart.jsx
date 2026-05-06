"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString();
}

function truncateLabel(value, max = 14) {
  const s = String(value || "");
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export default function PromisedVsCollectedChart({ items = [] }) {
  const rows = Array.isArray(items) ? items : [];
  const data = rows.map((item) => ({
    name: item?.campaignName || "—",
    committed: Number(item?.promised || 0),
    collected: Number(item?.collected || 0),
  }));

  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-[#111827]">Promised vs Collected</h2>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-[#6B7280]">
          No chart data available
        </div>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }} barCategoryGap={22}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
                interval={0}
                tickFormatter={(v) => truncateLabel(v, 14)}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatNumber}
              />
              <Tooltip
                formatter={(value, name) => {
                  const key = String(name || "").toLowerCase();
                  const label = key.includes("commit") ? "Committed" : key.includes("collect") ? "Collected" : String(name || "");
                  return [formatNumber(value), label];
                }}
                labelFormatter={(label) => String(label)}
                contentStyle={{ borderRadius: 12, borderColor: "#E5E7EB" }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="square"
                formatter={(value) => <span className="text-[12px] text-[#6B7280]">{value}</span>}
              />
              <Bar dataKey="committed" name="Committed" fill="#4B5563" radius={[6, 6, 0, 0]} barSize={22} animationDuration={500} />
              <Bar dataKey="collected" name="Collected" fill="#111827" radius={[6, 6, 0, 0]} barSize={22} animationDuration={500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
