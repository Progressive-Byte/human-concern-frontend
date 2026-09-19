const RoleBadge = ({ role }) => {
  const label = String(role?.name || role?.key || "").trim() || "—";
  const privileged = String(role?.key || "").toLowerCase() === "super-admin";

  const cls = privileged
    ? "bg-red-500/10 text-red-700"
    : "bg-[#F3F4F6] text-[#374151]";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${cls}`}>{label}</span>
  );
};

export default RoleBadge;
