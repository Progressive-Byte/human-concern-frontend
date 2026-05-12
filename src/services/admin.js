import { adminApiRequest } from "./api";

// Admin API service layer.
// Each function returns the parsed response from the backend and is responsible for building the request URL + query params.

// -----------------------------
// Dashboard
// -----------------------------
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

// -----------------------------
// Campaigns
// -----------------------------
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

// -----------------------------
// Forms
// -----------------------------
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

// -----------------------------
// Categories
// -----------------------------
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

// -----------------------------
// Causes
// -----------------------------
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

// -----------------------------
// Objectives
// -----------------------------
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

// -----------------------------
// Donors
// -----------------------------
export function getAdminDonors({ page, limit, sort, order, q, status, type } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (typeof type === "string" && type.trim()) params.set("type", type.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/donors?${query}` : "/admin/donors";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminDonorsSummary() {
  return adminApiRequest("/admin/donors/summary", { method: "GET" });
}

export function getAdminDonorByKey(donorKey) {
  return adminApiRequest(`/admin/donors/${donorKey}`, { method: "GET" });
}

export function getAdminDonorDonations(donorKey, { page, limit, sort, order, from, to, status } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof from === "string" && from.trim()) params.set("from", from.trim());
  if (typeof to === "string" && to.trim()) params.set("to", to.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/donors/${donorKey}/donations?${query}` : `/admin/donors/${donorKey}/donations`;

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminDonorCauses(donorKey) {
  return adminApiRequest(`/admin/donors/${donorKey}/causes`, { method: "GET" });
}

export function getAdminDonorSchedules(donorKey) {
  return adminApiRequest(`/admin/donors/${donorKey}/schedules`, { method: "GET" });
}

export function getAdminDonorActivity(donorKey, { page, limit } = {}) {
  const params = new URLSearchParams();
  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());

  const query = params.toString();
  const endpoint = query ? `/admin/donors/${donorKey}/activity?${query}` : `/admin/donors/${donorKey}/activity`;

  return adminApiRequest(endpoint, { method: "GET" });
}

export function updateAdminDonorStatus(donorKey, payload) {
  return adminApiRequest(`/admin/donors/${donorKey}/status`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function updateAdminDonor(donorKey, payload) {
  return adminApiRequest(`/admin/donors/${donorKey}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function sendAdminDonorEmail(donorKey, payload) {
  return adminApiRequest(`/admin/donors/${donorKey}/email`, { method: "POST", body: JSON.stringify(payload) });
}

// -----------------------------
// Donations / Transactions
// -----------------------------
export function getAdminDonations({ page, limit, sort, order, q, status, from, to, currency, campaignId, causeId } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (typeof from === "string" && from.trim()) params.set("from", from.trim());
  if (typeof to === "string" && to.trim()) params.set("to", to.trim());
  if (typeof currency === "string" && currency.trim()) params.set("currency", currency.trim());
  if (typeof campaignId === "string" && campaignId.trim()) params.set("campaignId", campaignId.trim());
  if (typeof causeId === "string" && causeId.trim()) params.set("causeId", causeId.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/donations?${query}` : "/admin/donations";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminDonationsSummary({ q, status, from, to, currency, campaignId, causeId } = {}) {
  const params = new URLSearchParams();
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (typeof from === "string" && from.trim()) params.set("from", from.trim());
  if (typeof to === "string" && to.trim()) params.set("to", to.trim());
  if (typeof currency === "string" && currency.trim()) params.set("currency", currency.trim());
  if (typeof campaignId === "string" && campaignId.trim()) params.set("campaignId", campaignId.trim());
  if (typeof causeId === "string" && causeId.trim()) params.set("causeId", causeId.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/donations/summary?${query}` : "/admin/donations/summary";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminDonationsExportUrl({ sort, order, q, status, from, to, currency, campaignId, causeId } = {}) {
  const params = new URLSearchParams();
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (typeof from === "string" && from.trim()) params.set("from", from.trim());
  if (typeof to === "string" && to.trim()) params.set("to", to.trim());
  if (typeof currency === "string" && currency.trim()) params.set("currency", currency.trim());
  if (typeof campaignId === "string" && campaignId.trim()) params.set("campaignId", campaignId.trim());
  if (typeof causeId === "string" && causeId.trim()) params.set("causeId", causeId.trim());

  const query = params.toString();
  return query ? `/admin/donations/export?${query}` : "/admin/donations/export";
}

export function getAdminTransactions({ page, limit, sort, order, q, status, provider, reconciled, from, to } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (typeof provider === "string" && provider.trim()) params.set("provider", provider.trim());
  if (typeof reconciled === "string" && reconciled.trim()) params.set("reconciled", reconciled.trim());

  if (typeof reconciled === "boolean") params.set("reconciled", reconciled ? "true" : "false");

  if (typeof from === "string" && from.trim()) params.set("from", from.trim());
  if (typeof to === "string" && to.trim()) params.set("to", to.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/transactions?${query}` : "/admin/transactions";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminSchedules({ page, limit, sort, order, q, status } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/schedules?${query}` : "/admin/schedules";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminScheduleByDonationId(donationId) {
  return adminApiRequest(`/admin/schedules/${donationId}`, { method: "GET" });
}

export function cancelAdminSchedule(donationId) {
  return adminApiRequest(`/admin/schedules/${donationId}/cancel`, { method: "POST" });
}

// -----------------------------
// Add-ons
// -----------------------------
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

export function getAdminAddOnById(addOnId) {
  return adminApiRequest(`/admin/add-ons/${addOnId}`, { method: "GET" });
}

export function createAdminAddOn(payload) {
  return adminApiRequest("/admin/add-ons", { method: "POST", body: JSON.stringify(payload) });
}

export function updateAdminAddOn(addOnId, payload) {
  return adminApiRequest(`/admin/add-ons/${addOnId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function archiveAdminAddOn(addOnId) {
  return adminApiRequest(`/admin/add-ons/${addOnId}/archive`, { method: "POST" });
}

export function restoreAdminAddOn(addOnId) {
  return adminApiRequest(`/admin/add-ons/${addOnId}/restore`, { method: "POST" });
}

export function toggleAdminAddOn(addOnId, enabled) {
  return adminApiRequest(`/admin/add-ons/${addOnId}/toggle`, { method: "PATCH", body: JSON.stringify({ enabled: Boolean(enabled) }) });
}

// -----------------------------
// Form Sub-Resources
// -----------------------------
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
