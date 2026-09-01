"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";

function providerColor(provider, idx) {
  const palette = [
    { stroke: "#635BFF", fill: "#635BFF33" },
    { stroke: "#003087", fill: "#00308733" },
    { stroke: "#0AB15F", fill: "#0AB15F33" },
    { stroke: "#006AFF", fill: "#006AFF33" },
    { stroke: "#EA3335", fill: "#EA333533" },
    { stroke: "#F59E0B", fill: "#F59E0B33" },
  ];
  const key = typeof provider === "string" && provider.trim() ? provider : String(idx);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

function normalizeTimeLabel(t) {
  if (!t) return "";
  try {
    const d = new Date(t);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(t || "");
  }
}

function mergeSeries(series) {
  if (!Array.isArray(series) || series.length === 0) return [];
  const timeMap = new Map();
  series.forEach((s, sIdx) => {
    const provider = s.provider;
    const points = Array.isArray(s.points) ? s.points : [];
    points.forEach((p) => {
      const t = String(p.time || p.ts || p.timestamp || "");
      const successRate = Number(p.successRate ?? p.rate ?? p.value ?? 0);
      if (!timeMap.has(t)) timeMap.set(t, { time: t });
      const entry = timeMap.get(t);
      entry[`provider_${sIdx}`] = successRate;
      entry[`label_${sIdx}`] = provider;
    });
  });
  return Array.from(timeMap.values()).sort((a, b) => String(a.time).localeCompare(String(b.time)));
}

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

const SuccessRateChart = ({ series = [] }) => {
  const seriesArr = Array.isArray(series) ? series : [];
  const data = safeCall(() => mergeSeries(seriesArr), []);

  if (seriesArr.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] text-[13px] text-[#6B7280]">
        No success rate data available for the selected window.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[15px] font-semibold text-[#111827]">Success Rate Over Time</div>
          <div className="text-[12px] text-[#6B7280]">0 – 100% per provider</div>
        </div>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="time"
              tickFormatter={normalizeTimeLabel}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={{ stroke: "#E5E7EB" }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              labelFormatter={normalizeTimeLabel}
              formatter={(value) => [`${Number(value || 0).toFixed(1)}%`, "Success rate"]}
              contentStyle={{ borderRadius: 12, border: "1px dashed #E5E7EB", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={95} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1.2} label={{ value: "95% SLO", fontSize: 10, fill: "#F59E0B", position: "right" }} />
            {(() => {
              const nameCounts = new Map();
              return seriesArr.map((s, idx) => {
                const rawName = typeof s.provider === "string" && s.provider.trim() ? s.provider : `provider_${idx}`;
                const prior = nameCounts.get(rawName) || 0;
                nameCounts.set(rawName, prior + 1);
                const finalName = prior > 0 ? `${rawName} (${prior + 1})` : rawName;
                const color = providerColor(rawName, idx);
                return (
                  <Line
                    key={`${idx}_${rawName}_${s.points?.length || 0}`}
                    type="monotone"
                    dataKey={`provider_${idx}`}
                    name={finalName}
                    stroke={color.stroke}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                );
              });
            })()}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

function normalizeLatencyData(points) {
  if (!Array.isArray(points)) return [];
  return points.map((p) => ({
    time: p.time || p.ts || p.timestamp || "",
    p95: Number(p.p95 ?? p.p95Latency ?? p.value ?? 0),
  })).sort((a, b) => String(a.time).localeCompare(String(b.time)));
}

const LatencyBarChart = ({ latencyPoints = [] }) => {
  const data = safeCall(() => normalizeLatencyData(latencyPoints), []);
  const thresholdMs = 4000;
  const maxVal = Math.max(thresholdMs, ...data.map((d) => d.p95), 1);

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] text-[13px] text-[#6B7280]">
        No latency data available.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[15px] font-semibold text-[#111827]">p95 Latency</div>
          <div className="text-[12px] text-[#6B7280]">Per minute, threshold 4000 ms</div>
        </div>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="time"
              tickFormatter={normalizeTimeLabel}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              domain={[0, Math.ceil(maxVal / 1000) * 1000]}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={{ stroke: "#E5E7EB" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}s`}
            />
            <Tooltip
              labelFormatter={normalizeTimeLabel}
              formatter={(v) => [`${Number(v || 0).toFixed(0)} ms`, "p95 latency"]}
              contentStyle={{ borderRadius: 12, border: "1px dashed #E5E7EB", fontSize: 12 }}
            />
            <ReferenceLine
              y={thresholdMs}
              stroke="#EA3335"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{ value: "4000 ms threshold", fontSize: 10, fill: "#EA3335", position: "right" }}
            />
            <Bar dataKey="p95" name="p95 (ms)" fill="#635BFF" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export { SuccessRateChart, LatencyBarChart };
