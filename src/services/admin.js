import { adminApiRequest } from "./api";

export function getAdminDashboardOverview({ currency, activeLimit } = {}) {
  const params = new URLSearchParams();

  if (typeof currency === "string" && currency.trim()) {
    params.set("currency", currency.trim());
  }

  if (activeLimit !== undefined && activeLimit !== null && String(activeLimit).trim()) {
    params.set("activeLimit", String(activeLimit).trim());
  }

  const query = params.toString();
  const endpoint = query ? `/admin/dashboard/overview?${query}` : "/admin/dashboard/overview";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminCampaigns({ page, limit, sort, order, q, status } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/campaigns?${query}` : "/admin/campaigns";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function createAdminCampaign(payload) {
  return adminApiRequest("/admin/campaigns", { method: "POST", body: JSON.stringify(payload) });
}

export function getAdminCampaignById(campaignId) {
  return adminApiRequest(`/admin/campaigns/${campaignId}`, { method: "GET" });
}

export function updateAdminCampaign(campaignId, payload) {
  return adminApiRequest(`/admin/campaigns/${campaignId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function publishAdminCampaign(campaignId) {
  return adminApiRequest(`/admin/campaigns/${campaignId}/publish`, { method: "POST" });
}

export function unpublishAdminCampaign(campaignId) {
  return adminApiRequest(`/admin/campaigns/${campaignId}/unpublish`, { method: "POST" });
}

export function archiveAdminCampaign(campaignId) {
  return adminApiRequest(`/admin/campaigns/${campaignId}/archive`, { method: "POST" });
}

export function restoreAdminCampaign(campaignId) {
  return adminApiRequest(`/admin/campaigns/${campaignId}/restore`, { method: "POST" });
}
