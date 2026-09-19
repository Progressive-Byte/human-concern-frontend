/**
 * Frontend permission check shared by the admin sidebar and admin page guards.
 *
 * This only controls what the UI shows/hides — the backend enforces every
 * permission again via `requirePermission`, so a hidden menu is not security.
 *
 * Rules (mirroring the backend):
 * - No permission required -> always allowed.
 * - super-admin / owner role -> allowed (safety net; the role also holds every key).
 * - Exact key match in `admin.permissions`.
 * - Wildcards: `prefix.*` and `*`.
 */
export function adminHasPermission(admin, required) {
  if (!required) return true;
  if (!admin) return true;

  const roles = [];
  if (Array.isArray(admin.roles)) roles.push(...admin.roles);
  if (admin.role) roles.push(admin.role);
  const normalizedRoles = roles.map((r) => String(r || "").toLowerCase());
  if (normalizedRoles.includes("super-admin") || normalizedRoles.includes("super_admin")) return true;
  if (normalizedRoles.includes("owner")) return true;

  const permissions = Array.isArray(admin.permissions) ? admin.permissions : [];
  if (permissions.includes(required)) return true;

  const prefix = required.split(".")[0];
  if (permissions.includes(`${prefix}.*`) || permissions.includes("*")) return true;

  return false;
}
