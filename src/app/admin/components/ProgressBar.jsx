export default function ProgressBar({ value = 0, className = "", trackClassName = "", fillClassName = "" }) {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  const percent = Math.max(0, Math.min(100, safe));

  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB] ${trackClassName} ${className}`.trim()}>
      <div className={`h-full rounded-full bg-[#111827] ${fillClassName}`.trim()} style={{ width: `${percent}%` }} />
    </div>
  );
}

