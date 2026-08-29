import { adminApiRequest } from "./api";
import { apiBase } from "@/utils/constants";

function getCookieValue(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  return qs.toString();
}

export function getReconciliationReports({
  page,
  limit,
  sort,
  order,
  provider,
  statuses,
  dateFrom,
  dateTo,
} = {}) {
  const params = {};
  if (page !== undefined && page !== null && String(page).trim()) params.page = String(page).trim();
  if (limit !== undefined && limit !== null && String(limit).trim()) params.limit = String(limit).trim();
  if (typeof sort === "string" && sort.trim()) params.sort = sort.trim();
  if (typeof order === "string" && order.trim()) params.order = order.trim();
  if (typeof provider === "string" && provider.trim()) params.provider = provider.trim();
  if (Array.isArray(statuses) && statuses.length > 0) params.statuses = statuses.join(",");
  if (typeof dateFrom === "string" && dateFrom.trim()) params.dateFrom = dateFrom.trim();
  if (typeof dateTo === "string" && dateTo.trim()) params.dateTo = dateTo.trim();

  const query = buildQuery(params);
  const endpoint = query
    ? `/admin/payments/reconciliation/reports?${query}`
    : `/admin/payments/reconciliation/reports`;

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getReconciliationReportDetail(reportId, {
  page,
  limit,
  category,
} = {}) {
  const params = {};
  if (page !== undefined && page !== null && String(page).trim()) params.page = String(page).trim();
  if (limit !== undefined && limit !== null && String(limit).trim()) params.limit = String(limit).trim();
  if (typeof category === "string" && category.trim() && category.toUpperCase() !== "ALL") {
    params.category = category.trim();
  }

  const query = buildQuery(params);
  const endpoint = query
    ? `/admin/payments/reconciliation/reports/${reportId}?${query}`
    : `/admin/payments/reconciliation/reports/${reportId}`;

  return adminApiRequest(endpoint, { method: "GET" });
}

export function downloadReconciliationReportCsv(reportId) {
  const token = typeof getCookieValue === "function" ? getCookieValue("token") : null;
  const base = typeof apiBase === "string" ? apiBase : "";
  const url = `${base}/admin/payments/reconciliation/reports/${reportId}/csv`;

  if (token) {
    return fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`CSV download failed with status ${res.status}`);
        const blob = await res.blob();
        const disposition = res.headers.get("content-disposition") || "";
        const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
        const filename = match ? match[1] : `reconciliation-${reportId}.csv`;
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      });
  }

  window.location.href = url;
  return Promise.resolve();
}

export function postManualReconciliationRun({
  provider,
  gatewayConfigurationId,
  dateStrYYYYMMDD,
  upToHoursOverride,
} = {}) {
  const payload = {};
  if (typeof provider === "string" && provider.trim()) payload.provider = provider.trim();
  if (typeof gatewayConfigurationId === "string") payload.gatewayConfigurationId = gatewayConfigurationId.trim() || "default";
  if (typeof dateStrYYYYMMDD === "string" && dateStrYYYYMMDD.trim()) payload.dateStrYYYYMMDD = dateStrYYYYMMDD.trim();
  const hours = Number(upToHoursOverride);
  if (Number.isFinite(hours) && hours >= 1 && hours <= 720) payload.upToHoursOverride = hours;

  return adminApiRequest("/admin/payments/reconciliation/manual-run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function postExpireStaleChallenges({ force = false } = {}) {
  return adminApiRequest("/admin/payments/reconciliation/expire-stale-challenges", {
    method: "POST",
    body: JSON.stringify({ force: Boolean(force) }),
  });
}

export function postResolveDiscrepancy(reportId, discrepancyId, {
  resolution,
  reason,
} = {}) {
  const payload = {};
  if (typeof resolution === "string" && resolution.trim()) payload.resolution = resolution.trim();
  if (typeof reason === "string" && reason.trim()) payload.reason = reason.trim();

  return adminApiRequest(
    `/admin/payments/reconciliation/reports/${reportId}/discrepancies/${discrepancyId}/resolve`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function postRerunReconciliationReport(reportId) {
  return adminApiRequest(`/admin/payments/reconciliation/reports/${reportId}/rerun`, {
    method: "POST",
  });
}
