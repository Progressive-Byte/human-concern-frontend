import { CardIcon, NoCheckIcon, TrashIcon } from "@/components/common/SvgIcon";

function CardItem({ card, isLast }) {
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
            {card.brand} ···· {card.last4}
          </p>
          {card.isDefault && (
            <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857]">
              Default
            </span>
          )}
        </div>
        <p className="text-xs text-[#6B7280] mt-0.5">Expires {card.exp}</p>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {!card.isDefault && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#111827] hover:border-red-500/40 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            {NoCheckIcon}
            Set Default
          </button>
        )}
        <button
          type="button"
          title="Remove"
          className="w-8 h-8 rounded-lg border border-dashed border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#EA3335]/40 hover:text-[#EA3335] hover:bg-[#FFF5F5] transition-colors cursor-pointer"
        >
          {TrashIcon}
        </button>
      </div>
    </div>
  );
}

export function SavedCardsList({ cards }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] overflow-hidden">
      {cards.map((card, idx) => (
        <CardItem key={card.id} card={card} isLast={idx === cards.length - 1} />
      ))}
    </div>
  );
}
