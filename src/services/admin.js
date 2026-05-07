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

export function getAdminForms({ page, limit, sort, order, q, status, campaignId } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (typeof campaignId === "string" && campaignId.trim()) params.set("campaignId", campaignId.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/forms?${query}` : "/admin/forms";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminCampaignForms(campaignId) {
  return adminApiRequest(`/admin/campaigns/${campaignId}/forms`, { method: "GET" });
}

export function createAdminCampaignForm(campaignId, payload) {
  return adminApiRequest(`/admin/campaigns/${campaignId}/forms`, { method: "POST", body: JSON.stringify(payload) });
}

export function getAdminFormBasics(formId) {
  return adminApiRequest(`/admin/forms/${formId}/basics`, { method: "GET" });
}

export function updateAdminFormBasics(formId, payload) {
  return adminApiRequest(`/admin/forms/${formId}/basics`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function publishAdminForm(formId) {
  return adminApiRequest(`/admin/forms/${formId}/publish`, { method: "POST" });
}

export function unpublishAdminForm(formId) {
  return adminApiRequest(`/admin/forms/${formId}/unpublish`, { method: "POST" });
}

export function archiveAdminForm(formId) {
  return adminApiRequest(`/admin/forms/${formId}/archive`, { method: "POST" });
}

export function restoreAdminForm(formId) {
  return adminApiRequest(`/admin/forms/${formId}/restore`, { method: "POST" });
}
