const SectionStep = ({ num, title }) => (
  <div className="flex items-center gap-2.5">
    <span className="w-6 h-6 rounded-full bg-[#1A1A1A] text-white text-[11px] font-bold flex items-center justify-center shrink-0 leading-none">
      {num}
    </span>
    <p className="text-[13px] font-semibold text-[#383838]">{title}</p>
  </div>
);

export default SectionStep;