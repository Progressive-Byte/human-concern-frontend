"use client";

import ProgressBar from "@/app/admin/components/ProgressBar";

const HealthScoreGauge = ({ value = 0 }) => {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  const percent = Math.max(0, Math.min(100, safe));

  let colorClass = "bg-emerald-500";
  if (percent < 50) colorClass = "bg-red-500";
  else if (percent < 80) colorClass = "bg-amber-500";

  return (
    <div className="min-w-[140px]">
      <div className="flex items-center justify-between gap-2">
        <ProgressBar value={percent} fillClassName={colorClass} />
        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[#111827]">{Math.round(percent)}%</span>
      </div>
    </div>
  );
};

export default HealthScoreGauge;
