export default function CausesFilters({ q, onChangeQ }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <input
        value={q}
        onChange={(e) => onChangeQ?.(e.target.value)}
        placeholder="Search causes..."
        className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
      />
    </div>
  );
}

