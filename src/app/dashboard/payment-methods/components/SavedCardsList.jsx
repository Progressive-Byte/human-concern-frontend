import { CardIcon, NoCheckIcon, TrashIcon } from "@/components/common/SvgIcon";

function formatBrand(value) {
  const s = String(value || "").trim();
  if (!s) return "Card";
  return s[0].toUpperCase() + s.slice(1);
}

function formatExpiry(method) {
  const m = Number(method?.expMonth ?? method?.exp_month);
  const y = Number(method?.expYear ?? method?.exp_year);
  if (!Number.isFinite(m) || !Number.isFinite(y)) return "";
  const mm = String(m).padStart(2, "0");
  return `${mm}/${String(y).slice(-2)}`;
}

function CardItem({ method, isLast, onSetDefault, onRemove, busy }) {
  const brand = formatBrand(method?.brand);
  const last4 = String(method?.last4 || "").trim();
  const expiry = formatExpiry(method);
  const isDefault = Boolean(method?.isDefault);

  return (
    <div
      className={`flex items-center gap-3 md:gap-4 px-4 md:px-5 py-4 md:py-5 hover:bg-[#F9FAFB] transition-colors ${
        !isLast ? "border-b border-dashed border-[#E5E7EB]" : ""
      }`}
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-[#F3F4F6] border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
        {CardIcon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2">
          <p className="text-sm font-semibold text-[#111827]">
            {brand} ···· {last4 || "----"}
          </p>
          {isDefault && (
            <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857]">
              Default
            </span>
          )}
        </div>
        {expiry ? <p className="text-xs text-[#6B7280] mt-0.5">Expires {expiry}</p> : null}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {!isDefault && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetDefault?.(method)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#111827] hover:border-red-500/40 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            {NoCheckIcon}
            Set Default
          </button>
        )}
        <button
          type="button"
          title="Remove"
          disabled={busy}
          onClick={() => onRemove?.(method)}
          className="w-8 h-8 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#EA3335]/40 hover:text-[#EA3335] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
        >
          {TrashIcon}
        </button>
      </div>
    </div>
  );
}

export function SavedCardsList({ methods, onSetDefault, onRemove, busy }) {
  const list = Array.isArray(methods) ? methods : [];
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">
      {list.map((method, idx) => (
        <CardItem key={method.id || `${method.provider}-${method.last4}-${idx}`} method={method} isLast={idx === list.length - 1} onSetDefault={onSetDefault} onRemove={onRemove} busy={busy} />
      ))}
    </div>
  );
}
