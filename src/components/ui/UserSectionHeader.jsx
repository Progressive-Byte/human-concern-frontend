const sections = {
  user:  { bg: "#ECF9F3", color: "#055A46" },
  bell:  { bg: "#FFF8EC", color: "#B45309" },
  lock:  { bg: "#EFF6FF", color: "#1D4ED8" },
};
const UserSectionHeader = ({ icon, title, variant = "user" }) => {
  const { bg, color } = sections[variant];
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg, color }}
      >
        {icon}
      </span>
      <h2 className="text-base font-semibold text-[#383838]">{title}</h2>
    </div>
  );
}

export default UserSectionHeader;
