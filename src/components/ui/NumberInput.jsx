const NumberInput = ({ value, onChange, min = 1, max = 99 }) => {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
      className="w-16 border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-[14px] text-[#383838] outline-none focus:border-[#EA3335] text-center"
    />
  );
}

export default NumberInput