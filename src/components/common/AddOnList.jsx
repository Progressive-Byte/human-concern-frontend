import { formatCurrency } from "@/utils/helpers";

/**
 * Compact renderer for donation add-ons.
 *
 * The API returns add-ons as `[{ addOnId, name, amount, inputValues }]` on
 * donations and transactions. Renders nothing when there are none, so it is safe
 * to drop into any existing row/card without layout changes.
 */
export function AddOnList({ addons, currency = "USD", className = "", max = 0, tone = "light" }) {
  const list = (Array.isArray(addons) ? addons : []).filter(
    (a) => a && (String(a?.name || "").trim() || Number(a?.amount || 0) > 0),
  );
  if (!list.length) return null;

  // Intl throws on an empty/invalid currency, so fall back defensively.
  const cur = typeof currency === "string" && /^[A-Za-z]{3}$/.test(currency.trim())
    ? currency.trim().toUpperCase()
    : "USD";

  const shown = max > 0 ? list.slice(0, max) : list;
  const hiddenCount = list.length - shown.length;

  const chipClass =
    tone === "dark"
      ? "bg-white/10 text-white/90"
      : "bg-[#F3F4F6] text-[#4B5563]";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`.trim()}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Add-ons</span>
      {shown.map((a, idx) => {
        const name = String(a?.name || "").trim() || "Add-on";
        const amount = Number(a?.amount || 0);
        return (
          <span
            key={String(a?.addOnId || "") || `addon-${idx}`}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${chipClass}`}
          >
            <span className="max-w-[160px] truncate">{name}</span>
            {amount > 0 ? <span className="opacity-70">· {formatCurrency(amount, cur)}</span> : null}
          </span>
        );
      })}
      {hiddenCount > 0 ? (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${chipClass}`}>
          +{hiddenCount} more
        </span>
      ) : null}
    </div>
  );
}

export default AddOnList;
