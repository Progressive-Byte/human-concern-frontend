const UserToggle = ({ label, desc, checked, onChange }) => {
  return (
    <div
      className={`flex items-center justify-between px-3 py-4 rounded-xl transition-colors ${
        checked ? "bg-[#ECF9F3]" : "bg-transparent"
      }`}
    >
      <div className="min-w-0 pr-4">
        <p className={`text-sm font-medium transition-colors ${checked ? "text-[#055A46]" : "text-[#383838]"}`}>
          {label}
        </p>
        <p className="text-xs text-[#8C8C8C] mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? "bg-[#055A46]" : "bg-[#DEDEDE]"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
export default UserToggle;