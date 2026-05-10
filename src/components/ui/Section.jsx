const Section = { label, children }) => {
  return (
    <div className="flex flex-col gap-2 py-3.5 border-b border-[#F3F4F6] last:border-b-0 last:pb-0 first:pt-0">
      <p className="text-[10px] font-semibold text-[#AEAEAE] uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

export default Section;