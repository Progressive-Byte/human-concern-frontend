/*
  One small pill naming the site a gift came from.

  Both values are legitimate gifts, so the pill is deliberately neutral: the words carry the
  meaning, not a colour. An unknown value is shown as it arrived, and an empty one renders a dash,
  because a caller that does not say where it is from is not an error.
*/

const SOURCE_LABELS = {
  hcusa: "HCUSA site",
  "human-concern": "Human Concern site",
};

export function SourceBadge({ source = "" }) {
  const value = String(source || "").trim();
  const label = SOURCE_LABELS[value.toLowerCase()] || value;

  if (!label) return <span className="text-[#9CA3AF]">—</span>;

  return (
    <span className="inline-flex rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#6B7280]">
      {label}
    </span>
  );
}

export default SourceBadge;
