const OutlineButton = ({ children, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-xl border border-dashed border-[#E5E7EB] px-4 py-2 text-xs font-medium text-[#111827] hover:border-red-500/40 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

export default OutlineButton;
