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
