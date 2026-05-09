const OutlineButton = ({ children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-xl border border-[#EBEBEB] px-4 py-2 text-xs font-medium text-[#383838] hover:border-[#055A46]/40 hover:text-[#055A46] hover:bg-[#ECF9F3] transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

export default OutlineButton;