const SectionStep = ({ title, mobileTitle }) => (
  <p className="text-[15px] sm:text-[17px] font-bold leading-snug text-[#1A1A1A]">
    {mobileTitle ? (
      <>
        <span className="sm:hidden">{mobileTitle}</span>
        <span className="hidden sm:inline">{title}</span>
      </>
    ) : (
      title
    )}
  </p>
);

export default SectionStep;
