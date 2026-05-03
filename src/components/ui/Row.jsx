const Row = ({ label, value, bold = false }) => {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[#F0F0F0] last:border-0">
      <span className={`text-[13px] shrink-0 ${bold ? "font-bold text-[#383838]" : "text-[#737373]"}`}>
        {label}
      </span>
      <span className={`text-[13px] text-right ${bold ? "font-bold text-[#383838] text-[17px]" : "font-medium text-[#383838]"}`}>
        {value}
      </span>
    </div>
  );
}

export default Row