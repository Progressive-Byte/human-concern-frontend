const Toggle = ({ enabled, onChange }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-[#CCCCCC] transition-colors duration-200 focus:outline-none"
      style={enabled ? { backgroundColor: "var(--admin-accent-600, var(--brand-primary, #EA3335))" } : undefined}
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
