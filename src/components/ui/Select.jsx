const Select = ({ value, onChange, options }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-[14px] text-[#383838] outline-none focus:border-[#EA3335] transition-colors cursor-pointer pr-9"
      >
        {options.map((opt) => {
          const val = typeof opt === "object" ? opt.value : String(opt);
          const lab = typeof opt === "object" ? opt.label : String(opt);
          return <option key={val} value={val}>{lab}</option>;
        })}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </div>
  );
}

export default Select;