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

export function getAdminCategories({ page, limit, sort, order, q, status } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/categories?${query}` : "/admin/categories";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function createAdminCategory(payload) {
  return adminApiRequest("/admin/categories", { method: "POST", body: JSON.stringify(payload) });
}

export function getAdminCategoryById(categoryId) {
  return adminApiRequest(`/admin/categories/${categoryId}`, { method: "GET" });
}

export function updateAdminCategory(categoryId, payload) {
  return adminApiRequest(`/admin/categories/${categoryId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteAdminCategory(categoryId) {
  return adminApiRequest(`/admin/categories/${categoryId}`, { method: "DELETE" });
}

export function archiveAdminCategory(categoryId) {
  return adminApiRequest(`/admin/categories/${categoryId}/archive`, { method: "POST" });
}

export function restoreAdminCategory(categoryId) {
  return adminApiRequest(`/admin/categories/${categoryId}/restore`, { method: "POST" });
}

export function createAdminCampaignForm(campaignId, payload) {
  return adminApiRequest(`/admin/campaigns/${campaignId}/forms`, { method: "POST", body: JSON.stringify(payload) });
}

export function getAdminFormById(formId) {
  return adminApiRequest(`/admin/forms/${formId}`, { method: "GET" });
}

export function getAdminFormBasics(formId) {
  return adminApiRequest(`/admin/forms/${formId}/basics`, { method: "GET" });
}

export function updateAdminFormBasics(formId, payload) {
  return adminApiRequest(`/admin/forms/${formId}/basics`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function getAdminFormGoalsDates(formId) {
  return adminApiRequest(`/admin/forms/${formId}/goals-dates`, { method: "GET" });
}

export function updateAdminFormGoalsDates(formId, payload) {
  return adminApiRequest(`/admin/forms/${formId}/goals-dates`, { method: "PATCH", body: JSON.stringify(payload) });
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

export function getAdminCauses({ page, limit, sort, order, q, status, enabled } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (enabled !== undefined && enabled !== null && String(enabled).trim()) params.set("enabled", String(enabled).trim());

  const query = params.toString();
  const endpoint = query ? `/admin/causes?${query}` : "/admin/causes";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function createAdminCause(payload) {
  return adminApiRequest("/admin/causes", { method: "POST", body: JSON.stringify(payload) });
}

export function getAdminCauseById(causeId) {
  return adminApiRequest(`/admin/causes/${causeId}`, { method: "GET" });
}

export function updateAdminCause(causeId, payload) {
  return adminApiRequest(`/admin/causes/${causeId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteAdminCause(causeId) {
  return adminApiRequest(`/admin/causes/${causeId}`, { method: "DELETE" });
}

export function archiveAdminCause(causeId) {
  return adminApiRequest(`/admin/causes/${causeId}/archive`, { method: "POST" });
}

export function restoreAdminCause(causeId) {
  return adminApiRequest(`/admin/causes/${causeId}/restore`, { method: "POST" });
}

export function getAdminObjectives({ page, limit, sort, order, q, status, ramadanOnly } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (ramadanOnly !== undefined && ramadanOnly !== null && String(ramadanOnly).trim()) params.set("ramadanOnly", String(ramadanOnly).trim());

  const query = params.toString();
  const endpoint = query ? `/admin/objectives?${query}` : "/admin/objectives";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function createAdminObjective(payload) {
  return adminApiRequest("/admin/objectives", { method: "POST", body: JSON.stringify(payload) });
}

export function getAdminObjectiveById(objectiveId) {
  return adminApiRequest(`/admin/objectives/${objectiveId}`, { method: "GET" });
}

export function updateAdminObjective(objectiveId, payload) {
  return adminApiRequest(`/admin/objectives/${objectiveId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function archiveAdminObjective(objectiveId) {
  return adminApiRequest(`/admin/objectives/${objectiveId}/archive`, { method: "POST" });
}

export function restoreAdminObjective(objectiveId) {
  return adminApiRequest(`/admin/objectives/${objectiveId}/restore`, { method: "POST" });
}

export function getAdminAddOns({ page, limit, sort, order, q, status, enabled } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (enabled !== undefined && enabled !== null && String(enabled).trim()) params.set("enabled", String(enabled).trim());

  const query = params.toString();
  const endpoint = query ? `/admin/add-ons?${query}` : "/admin/add-ons";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminFormCauses(formId) {
  return adminApiRequest(`/admin/forms/${formId}/causes`, { method: "GET" });
}

export function updateAdminFormCauses(formId, payload) {
  return adminApiRequest(`/admin/forms/${formId}/causes`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function getAdminFormObjectives(formId) {
  return adminApiRequest(`/admin/forms/${formId}/objectives`, { method: "GET" });
}

export function updateAdminFormObjectives(formId, payload) {
  return adminApiRequest(`/admin/forms/${formId}/objectives`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function getAdminFormAddons(formId) {
  return adminApiRequest(`/admin/forms/${formId}/addons`, { method: "GET" });
}

export function updateAdminFormAddons(formId, payload) {
  return adminApiRequest(`/admin/forms/${formId}/addons`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function getAdminFormMedia(formId) {
  return adminApiRequest(`/admin/forms/${formId}/media`, { method: "GET" });
}

export function updateAdminFormMedia(formId, body) {
  return adminApiRequest(`/admin/forms/${formId}/media`, { method: "PATCH", body });
}

export function getAdminFormReview(formId) {
  return adminApiRequest(`/admin/forms/${formId}/review`, { method: "GET" });
}
