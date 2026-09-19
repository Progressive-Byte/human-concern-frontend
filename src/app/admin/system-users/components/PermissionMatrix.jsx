const GROUP_LABELS = {
  dashboard: "Dashboard",
  campaigns: "Campaigns",
  forms: "Forms",
  categories: "Categories",
  causes: "Causes",
  designations: "Designations",
  objectives: "Objectives",
  addons: "Add-ons",
  donors: "Donors",
  transactions: "Transactions",
  schedules: "Schedules",
  settings: "Settings",
  payment: "Payments",
  abandonment: "Abandonments",
  audit: "Audit Logs",
  data: "Data Export",
  users: "System Users",
  roles: "Roles & Permissions",
};

function groupLabel(prefix) {
  if (GROUP_LABELS[prefix]) return GROUP_LABELS[prefix];
  const s = String(prefix || "other");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const PermissionMatrix = ({ groups, value, onChange, disabled = false }) => {
  const selected = Array.isArray(value) ? value : [];
  const list = Array.isArray(groups) ? groups : [];

  function toggle(key) {
    if (disabled) return;
    onChange?.(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }

  function toggleGroup(keys, allSelected) {
    if (disabled) return;
    if (allSelected) {
      onChange?.(selected.filter((k) => !keys.includes(k)));
    } else {
      const merged = new Set([...selected, ...keys]);
      onChange?.(Array.from(merged));
    }
  }

  if (list.length === 0) {
    return <div className="text-[13px] text-[#6B7280]">No permissions available.</div>;
  }

  return (
    <div className="max-h-[360px] space-y-4 overflow-y-auto rounded-xl border border-dashed border-[#E5E7EB] p-3">
      {list.map((group) => {
        const keys = (group.permissions || []).map((p) => p.key);
        const allSelected = keys.length > 0 && keys.every((k) => selected.includes(k));

        return (
          <div key={group.prefix}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">
                {groupLabel(group.prefix)}
              </span>
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(keys, allSelected)}
                  className="cursor-pointer text-[12px] font-semibold text-red-600 hover:underline"
                >
                  {allSelected ? "Clear" : "Select all"}
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(group.permissions || []).map((perm) => (
                <label
                  key={perm.key}
                  className={`flex items-start gap-2 text-[13px] ${disabled ? "cursor-not-allowed text-[#9CA3AF]" : "text-[#111827]"}`}
                >
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selected.includes(perm.key)}
                    onChange={() => toggle(perm.key)}
                    className="mt-0.5 h-4 w-4 accent-red-600"
                  />
                  <span>
                    <span className="block font-medium">{perm.key}</span>
                    {perm.description ? (
                      <span className="block text-[12px] text-[#9CA3AF]">{perm.description}</span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PermissionMatrix;
