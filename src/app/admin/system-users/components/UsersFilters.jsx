const UsersFilters = ({ q, roleId, status, roles, onChangeQ, onChangeRoleId, onChangeStatus }) => {
  const roleOptions = Array.isArray(roles) ? roles : [];

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          value={q}
          onChange={(e) => onChangeQ?.(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30"
        />
      </div>

      <select
        value={roleId}
        onChange={(e) => onChangeRoleId?.(e.target.value)}
        className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 md:w-[200px]"
      >
        <option value="">All Roles</option>
        {roleOptions.map((role) => (
          <option key={role.id || role.key} value={role.id}>
            {role.name || role.key}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => onChangeStatus?.(e.target.value)}
        className="w-full rounded-xl border border-dashed border-[#E5E7EB] bg-white px-3 py-3 text-[13px] text-[#111827] outline-none transition focus:border-[#111827]/30 md:w-[180px]"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="disabled">Disabled</option>
      </select>
    </div>
  );
};

export default UsersFilters;
