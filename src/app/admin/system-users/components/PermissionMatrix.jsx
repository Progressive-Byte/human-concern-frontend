"use client";

import { useMemo, useState } from "react";

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

// Areas that exist in the permission catalog but have no screen yet.
const NOT_BUILT = new Set(["abandonment"]);

const VISIBLE_CHIPS = 6;

function groupLabel(prefix) {
  if (GROUP_LABELS[prefix]) return GROUP_LABELS[prefix];
  const s = String(prefix || "other");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Permission picker: search + one compact line per permission (friendly name, key in the tooltip),
 * a running "n of m selected" counter, per-group select all/none and removable chips of what's
 * already granted — so a long catalog stays scannable.
 */
const PermissionMatrix = ({ groups, value, onChange, disabled = false }) => {
  const selected = Array.isArray(value) ? value : [];
  const [query, setQuery] = useState("");
  const list = useMemo(() => (Array.isArray(groups) ? groups : []), [groups]);

  const totalCount = useMemo(
    () => list.reduce((sum, g) => sum + (g.permissions || []).length, 0),
    [list],
  );

  const labelByKey = useMemo(() => {
    const map = new Map();
    list.forEach((g) => {
      (g.permissions || []).forEach((p) => map.set(p.key, p.description || p.key));
    });
    return map;
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list
      .map((g) => ({
        prefix: g.prefix,
        permissions: (g.permissions || []).filter(
          (p) =>
            p.key.toLowerCase().includes(q) ||
            String(p.description || "").toLowerCase().includes(q) ||
            groupLabel(g.prefix).toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.permissions.length > 0);
  }, [list, query]);

  const matchedCount = useMemo(
    () => filtered.reduce((sum, g) => sum + (g.permissions || []).length, 0),
    [filtered],
  );

  function setKeys(next) {
    if (disabled) return;
    onChange?.(next);
  }

  function toggle(key) {
    setKeys(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }

  function setGroup(keys, selectAll) {
    if (selectAll) setKeys(Array.from(new Set([...selected, ...keys])));
    else setKeys(selected.filter((k) => !keys.includes(k)));
  }

  if (list.length === 0) {
    return <div className="text-[13px] text-[#6B7280]">No permissions available.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-dashed border-[#E5E7EB]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5">
        <input
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search permissions…"
          className="w-full max-w-[220px] rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[12px] text-[#111827] outline-none transition focus:border-[#111827]/30 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span className="text-[12px] font-semibold text-[#111827]">
          {selected.length} of {totalCount} selected
        </span>
        {query.trim() ? (
          <span className="text-[12px] text-[#6B7280]">{matchedCount} match{matchedCount === 1 ? "" : "es"}</span>
        ) : null}
        {!disabled && selected.length > 0 ? (
          <button
            type="button"
            onClick={() => setKeys([])}
            className="ml-auto cursor-pointer text-[12px] font-semibold text-red-600 hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-dashed border-[#E5E7EB] px-3 py-2">
          {selected.slice(0, VISIBLE_CHIPS).map((key) => (
            <span
              key={key}
              className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-medium text-[#383838]"
              title={key}
            >
              <span className="truncate">{labelByKey.get(key) || key}</span>
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  aria-label={`Remove ${key}`}
                  className="cursor-pointer text-[#9CA3AF] transition hover:text-red-600"
                >
                  ×
                </button>
              ) : null}
            </span>
          ))}
          {selected.length > VISIBLE_CHIPS ? (
            <span className="text-[11px] text-[#6B7280]">+{selected.length - VISIBLE_CHIPS} more</span>
          ) : null}
        </div>
      ) : null}

      <div className="max-h-[52vh] space-y-0.5 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="px-3 py-8 text-center text-[13px] text-[#6B7280]">
            No permissions match “{query.trim()}”.
          </div>
        ) : null}

        {filtered.map((group) => {
          const perms = group.permissions || [];
          const keys = perms.map((p) => p.key);
          const picked = keys.filter((k) => selected.includes(k)).length;
          const allSelected = keys.length > 0 && picked === keys.length;
          const notBuilt = NOT_BUILT.has(group.prefix);

          return (
            <div key={group.prefix} className="rounded-lg px-1 py-1">
              <div className="flex items-center justify-between gap-2 px-2 py-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  {groupLabel(group.prefix)}
                  <span className="ml-1.5 font-normal normal-case tracking-normal text-[#9CA3AF]">
                    {picked}/{keys.length}
                    {notBuilt ? " · not built yet" : ""}
                  </span>
                </span>
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => setGroup(keys, !allSelected)}
                    className="cursor-pointer text-[11px] font-semibold text-red-600 hover:underline"
                  >
                    {allSelected ? "None" : "Select all"}
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                {perms.map((perm) => (
                  <label
                    key={perm.key}
                    title={perm.key}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] transition ${
                      disabled
                        ? "cursor-not-allowed text-[#9CA3AF]"
                        : "cursor-pointer text-[#111827] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={selected.includes(perm.key)}
                      onChange={() => toggle(perm.key)}
                      className="h-4 w-4 shrink-0 accent-red-600"
                    />
                    <span className="min-w-0 truncate">{perm.description || perm.key}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionMatrix;
