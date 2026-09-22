import { adminHasPermission } from "./adminPermissions";

/**
 * One source of truth for the admin menu. `permission` is what the item's API requires, and it
 * drives BOTH the sidebar visibility and the page a user lands on after login.
 *
 * Forms accepts either key (the backend allows both — see `requireAnyPermission`). Reconciliation
 * and Abandonments are placeholders with no page yet.
 */
export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "overview", permission: "dashboard.read" },
  { href: "/admin/campaigns", label: "Campaigns", icon: "campaigns", permission: "campaigns.read" },
  { href: "/admin/forms", label: "Forms", icon: "forms", permission: ["forms.read", "campaigns.read"] },
  { href: "/admin/categories", label: "FC Categories", icon: "categories", permission: "categories.read" },
  { href: "/admin/causes", label: "Causes", icon: "causes", permission: "causes.read" },
  { href: "/admin/designations", label: "Designations", icon: "designations", permission: "designations.read" },
  { href: "/admin/objectives", label: "Objectives", icon: "objectives", permission: "objectives.read" },
  { href: "/admin/add-ons", label: "Addons", icon: "addons", permission: "addons.read" },
  { href: "/admin/donors", label: "Donors", icon: "donors", permission: "donors.read" },
  { href: "/admin/donations", label: "Transactions", icon: "transactions", permission: "transactions.read" },
  { href: "/admin/schedules", label: "Schedules", icon: "schedules", permission: "schedules.read" },
  { href: "/admin/fund-breakdown", label: "Fund Breakdown", icon: "fund-breakdown", permission: "transactions.read" },
  { href: "/admin/gateway-health", label: "Gateway Health", icon: "gateway-health", permission: "settings.read" },
  { href: null, label: "Reconciliation", icon: "reconciliation", disabled: true },
  { href: null, label: "Abandonments", icon: "abandonments", disabled: true },
  { href: "/admin/logs", label: "Logs", icon: "logs", permission: "audit.read" },
  { href: "/admin/translation", label: "Translation", icon: "translation", permission: "settings.read" },
  { href: "/admin/data-export", label: "Data Export", icon: "data-export", permission: "data.export" },
  { href: "/admin/system-users", label: "System Users", icon: "users", permission: "users.read" },
  { href: "/admin/adminSettings", label: "Settings", icon: "settings", permission: "settings.read" },
];

/**
 * The first menu page this admin is allowed to open — the landing page after login, and the
 * fallback when they reach a page their role can't use. Returns "" when they have no access.
 */
export function firstAllowedAdminHref(admin) {
  const item = ADMIN_NAV_ITEMS.find(
    (entry) => entry.href && !entry.disabled && adminHasPermission(admin, entry.permission),
  );
  return item ? item.href : "";
}
