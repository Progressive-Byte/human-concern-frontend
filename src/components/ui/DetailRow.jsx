const DetailRow = ({ label, value, valueClass = "text-sm font-semibold text-[#111827]" }) => (
  <div>
    <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] mb-1">{label}</p>
    <p className={valueClass}>{value}</p>
  </div>
);

export default DetailRow;