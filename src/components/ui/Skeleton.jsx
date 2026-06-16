export function SkeletonBlock({ className = "h-10 rounded-xl" }) {
  return <div className={`animate-pulse bg-[#F3F4F6] ${className}`} />;
}

export function SkeletonStack({
  count = 3,
  blockClass = "h-10 rounded-xl",
  wrapperClass = "space-y-3",
  asFragment = false,
}) {
  const blocks = Array.from({ length: count }, (_, i) => (
    <SkeletonBlock key={i} className={blockClass} />
  ));
  if (asFragment) return <>{blocks}</>;
  return <div className={wrapperClass}>{blocks}</div>;
}

export function SkeletonRows({
  rows = 5,
  cols = 6,
  blockClass = "h-8 rounded-xl",
  cellClass = "px-4 py-2.5",
}) {
  return Array.from({ length: rows }, (_, i) => (
    <tr key={i}>
      <td colSpan={cols} className={cellClass}>
        <SkeletonBlock className={blockClass} />
      </td>
    </tr>
  ));
}
