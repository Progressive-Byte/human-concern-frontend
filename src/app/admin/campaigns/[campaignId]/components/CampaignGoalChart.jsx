"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/utils/helpers";

const COLORS = [
  "var(--admin-accent-200, #FCA5A5)",
  "#F59E9B",
  "var(--admin-accent-600, #EA3335)",
];

function compactMoney(value, currency) {
  const amount = Number(value) || 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return `$${Math.round(amount).toLocaleString()}`;
  }
}

/*
  Three figures on one chart: what the campaign asks for, what its forms ask for, and what has
  actually been paid. The forms goal is the sum of the goals set on the campaign's forms.
*/
const CampaignGoalChart = ({ data, loading }) => {
  const currency = data?.currency || "USD";
  const summary = data?.summary || {};
  const forms = Array.isArray(data?.forms) ? data.forms : [];

  const formsGoal = forms.reduce(
    (sum, form) => sum + (Number(form?.goalAmount) > 0 ? Number(form.goalAmount) : 0),
    0,
  );

  const rows = [
    { name: "Campaign goal", value: Number(summary.goal) > 0 ? Number(summary.goal) : 0 },
    { name: "Forms goal", value: formsGoal },
    { name: "Raised", value: Number(summary.collected) || 0 },
  ];
  const hasData = rows.some((row) => row.value > 0);

  return (
    <div className="hc-animate-fade-up hc-hover-lift rounded-2xl border border-solid border-[#E5E7EB] bg-white p-5">
      <div className="mb-4">
        <h2 className="text-[16px] font-semibold text-[#111827]">Goals vs raised</h2>
        <p className="mt-1 text-[12px] text-[#6B7280]">
          The campaign target, the sum of its form targets, and the money received.
        </p>
      </div>

      {loading ? (
        <div className="h-[300px] animate-pulse rounded-xl bg-[#F3F4F6]" />
      ) : !hasData ? (
        <div className="rounded-xl border border-solid border-[#E5E7EB] p-8 text-center text-sm text-[#6B7280]">
          No goal or payment data yet
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              barCategoryGap={40}
            >
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => compactMoney(value, currency)}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value) || 0, currency), "Amount"]}
                contentStyle={{ borderRadius: 12, borderColor: "#E5E7EB" }}
              />
              <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]} barSize={56} animationDuration={500}>
                {rows.map((row, index) => (
                  <Cell key={row.name} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CampaignGoalChart;
