const Stepper = ({ label, hint, value, onChange, min = 1, max = 99 }) => {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-3 flex flex-col gap-2 flex-1 min-w-0">
      <p className="text-[12px] font-medium text-[#383838] text-center">{label}:</p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-7 h-7 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#383838] font-bold text-lg leading-none hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer"
        >
          −
        </button>
        <span className="text-[20px] font-bold text-[#383838] min-w-[28px] text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-7 h-7 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#383838] font-bold text-lg leading-none hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer"
        >
          +
        </button>
      </div>
      {hint && <p className="text-[11px] text-[#AEAEAE] text-center">{hint}</p>}
    </div>
  );
}

export default Stepper