const Toggle = ({ enabled, onChange }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 cursor-pointer ${
        enabled ? "bg-[#EA3335]" : "bg-[#CCCCCC]"
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default Toggle