import { adminApiRequest } from "./api";
import { apiBase } from "@/utils/constants";

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
  const isFormDataBody = typeof FormData !== "undefined" && payload instanceof FormData;
  return adminApiRequest(`/admin/forms/${formId}/basics`, { method: "PATCH", body: isFormDataBody ? payload : JSON.stringify(payload) });
}

export function getAdminFormGoalsDates(formId, options = {}) {
  return adminApiRequest(`/admin/forms/${formId}/goals-dates`, { method: "GET", ...(options || {}) });
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
// Designations
// -----------------------------
export function getAdminDesignations({ page, limit, sort, order, q, status } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/designations?${query}` : "/admin/designations";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function createAdminDesignation(payload) {
  return adminApiRequest("/admin/designations", { method: "POST", body: JSON.stringify(payload) });
}

export function getAdminDesignationById(designationId) {
  return adminApiRequest(`/admin/designations/${designationId}`, { method: "GET" });
}

export function updateAdminDesignation(designationId, payload) {
  return adminApiRequest(`/admin/designations/${designationId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function archiveAdminDesignation(designationId) {
  return adminApiRequest(`/admin/designations/${designationId}/archive`, { method: "POST" });
}

export function restoreAdminDesignation(designationId) {
  return adminApiRequest(`/admin/designations/${designationId}/restore`, { method: "POST" });
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

export function getAdminTransactions({ page, limit, sort, order, q, status, provider, reconciled, campaignId, formId, from, to } = {}) {
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

  if (typeof campaignId === "string" && campaignId.trim()) params.set("campaignId", campaignId.trim());
  if (typeof formId === "string" && formId.trim()) params.set("formId", formId.trim());

  if (typeof from === "string" && from.trim()) params.set("from", from.trim());
  if (typeof to === "string" && to.trim()) params.set("to", to.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/transactions?${query}` : "/admin/transactions";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function sendTransactionReceipt({ donationId, transactionId } = {}) {
  const body = { donationId };
  if (transactionId) body.transactionId = transactionId;

  return adminApiRequest("/admin/transactions/send-receipt", {
    method: "POST",
    body: JSON.stringify(body),
  });
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

export function retryAdminScheduleInstallment({ donationId, installmentId } = {}) {
  return adminApiRequest(
    `/admin/schedules/${donationId}/installments/${installmentId}/retry`,
    { method: "POST" },
  );
}

// -----------------------------
// Fund Breakdown
// -----------------------------
function buildFundBreakdownParams({ page, limit, sort, order, q, currency, campaignIds, formIds, from, to } = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof currency === "string" && currency.trim()) params.set("currency", currency.trim());
  if (typeof from === "string" && from.trim()) params.set("from", from.trim());
  if (typeof to === "string" && to.trim()) params.set("to", to.trim());
  if (Array.isArray(campaignIds) && campaignIds.length) params.set("campaignIds", campaignIds.join(","));
  if (Array.isArray(formIds) && formIds.length) params.set("formIds", formIds.join(","));

  return params;
}

export function getAdminFundBreakdown(options = {}) {
  const query = buildFundBreakdownParams(options).toString();
  const endpoint = query ? `/admin/fund-breakdown?${query}` : "/admin/fund-breakdown";

  return adminApiRequest(endpoint, { method: "GET" });
}

// Unpaginated CSV of every row matching the same filters. adminApiRequest returns
// response.text() for non-JSON content types, so this resolves to the raw CSV string.
export function exportAdminFundBreakdown(options = {}) {
  const query = buildFundBreakdownParams(options).toString();
  const endpoint = query ? `/admin/fund-breakdown/export?${query}` : "/admin/fund-breakdown/export";

  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminSettingsGeneral() {
  return adminApiRequest("/admin/settings/general", { method: "GET" });
}

export function updateAdminSettingsGeneral(payload) {
  return adminApiRequest("/admin/settings/general", { method: "PATCH", body: JSON.stringify(payload) });
}

export function getAdminSettingsNotifications() {
  return adminApiRequest("/admin/settings/notifications", { method: "GET" });
}

export function updateAdminSettingsNotifications(payload) {
  return adminApiRequest("/admin/settings/notifications", { method: "PATCH", body: JSON.stringify(payload) });
}

export function getAdminSettingsSecurity() {
  return adminApiRequest("/admin/settings/security", { method: "GET" });
}

export function updateAdminSettingsSecurity(payload) {
  return adminApiRequest("/admin/settings/security", { method: "PATCH", body: JSON.stringify(payload) });
}

// -----------------------------
// Notifications (personal inbox — no permission needed)
// -----------------------------
export function getAdminNotifications({ page, limit } = {}) {
  const params = new URLSearchParams();
  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  const query = params.toString();
  const endpoint = query ? `/admin/notifications?${query}` : "/admin/notifications";
  return adminApiRequest(endpoint, { method: "GET" });
}

export function getAdminNotificationsUnreadCount() {
  return adminApiRequest("/admin/notifications/unread-count", { method: "GET" });
}

export function markAdminNotificationRead(notificationId) {
  return adminApiRequest(`/admin/notifications/${notificationId}/read`, { method: "POST" });
}

export function markAllAdminNotificationsRead() {
  return adminApiRequest("/admin/notifications/read-all", { method: "POST" });
}

export function changeAuthPassword(payload) {
  return adminApiRequest("/auth/change-password", { method: "POST", body: JSON.stringify(payload) });
}

export function changeAdminPassword(payload) {
  return adminApiRequest("/admin/auth/change-password", { method: "POST", body: JSON.stringify(payload) });
}

export function getAdminSettingsBranding() {
  return adminApiRequest("/admin/settings/branding", { method: "GET" });
}

export function updateAdminSettingsBranding(payload) {
  return adminApiRequest("/admin/settings/branding", { method: "PATCH", body: JSON.stringify(payload) });
}

export function uploadAdminBrandingLogo(file) {
  const body = new FormData();
  body.append("file", file);
  return adminApiRequest("/admin/settings/branding/logo", { method: "POST", body });
}

export function deleteAdminBrandingLogo() {
  return adminApiRequest("/admin/settings/branding/logo", { method: "DELETE" });
}

export function getAdminSettingsHomepage() {
  return adminApiRequest("/admin/settings/homepage", { method: "GET" });
}

export function updateAdminSettingsHomepage(payload) {
  return adminApiRequest("/admin/settings/homepage", { method: "PATCH", body: JSON.stringify(payload) });
}

export function uploadAdminHomepageMedia(file) {
  const body = new FormData();
  body.append("file", file);
  return adminApiRequest("/admin/settings/homepage/media", { method: "POST", body });
}

export function getAdminTranslationSettings() {
  return adminApiRequest("/admin/settings/translation", { method: "GET" });
}

export function updateAdminTranslationSettings(payload) {
  return adminApiRequest("/admin/settings/translation", { method: "PATCH", body: JSON.stringify(payload) });
}

export function translateAdminTranslation({ locale, keys } = {}) {
  const body = { locale };
  if (Array.isArray(keys) && keys.length) body.keys = keys;
  return adminApiRequest("/admin/settings/translation/translate", { method: "POST", body: JSON.stringify(body) });
}

export function getAdminExportEntities() {
  return adminApiRequest("/admin/data-export/entities", { method: "GET" });
}

export function createAdminExportJob(payload) {
  return adminApiRequest("/admin/data-export/jobs", { method: "POST", body: JSON.stringify(payload) });
}

export function getAdminExportJobs({ limit } = {}) {
  const query = limit ? `?limit=${encodeURIComponent(limit)}` : "";
  return adminApiRequest(`/admin/data-export/jobs${query}`, { method: "GET" });
}

function getAdminCookie(name) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

/** Downloads a completed export via blob (the file is binary for xlsx/pdf). */
export async function downloadAdminExport(jobId) {
  const token = getAdminCookie("adminToken");
  const res = await fetch(`${apiBase}/admin/data-export/jobs/${jobId}/download`, {
    method: "GET",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Download failed with status ${res.status}`);

  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  const filename = match ? match[1] : `export-${jobId}`;
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  return filename;
}

export function getAdminSettingsPayment() {
  return adminApiRequest("/admin/settings/payment", { method: "GET" });
}

export function getAdminSettingsEmail() {
  return adminApiRequest("/admin/settings/email", { method: "GET" });
}

export function updateAdminSettingsEmail(payload) {
  return adminApiRequest("/admin/settings/email", { method: "PATCH", body: JSON.stringify(payload) });
}

export function sendAdminSettingsTestEmail({ to } = {}) {
  const body = {};
  if (typeof to === "string" && to.trim()) body.to = to.trim();
  return adminApiRequest("/admin/settings/email/test", { method: "POST", body: JSON.stringify(body) });
}

export function getAdminPaymentOrchestration() {
  return adminApiRequest("/admin/settings/payment/orchestration", { method: "GET" });
}

export function updateAdminPaymentOrchestration(payload) {
  return adminApiRequest("/admin/settings/payment/orchestration", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getAdminSettingsExchangeRates() {
  return adminApiRequest("/admin/settings/exchange-rates", { method: "GET" });
}

export function updateAdminSettingsExchangeRates(payload) {
  return adminApiRequest("/admin/settings/exchange-rates", { method: "PUT", body: JSON.stringify(payload) });
}

export function syncAdminSettingsExchangeRates() {
  return adminApiRequest("/admin/settings/exchange-rates/sync", { method: "POST" });
}

export function updateAdminPaymentGatewayConfiguration(provider, payload) {
  return adminApiRequest(`/admin/settings/payment/gateways/${provider}/configuration`, { method: "PUT", body: JSON.stringify(payload) });
}

export function updateAdminPaymentGatewayConfigurationExtended(provider, payload) {
  const extended = { ...(payload || {}) };
  if (extended.priority === undefined) extended.priority = 50;
  if (!Array.isArray(extended.regionTags)) {
    extended.regionTags = [];
  } else {
    extended.regionTags = extended.regionTags
      .map((t) => String(t || "").trim())
      .filter((t) => t.length > 0 && t.length <= 20)
      .slice(0, 20);
  }
  if (!Array.isArray(extended.supportedCurrencies)) extended.supportedCurrencies = ["USD"];
  if (!extended.defaultCurrency && Array.isArray(extended.supportedCurrencies) && extended.supportedCurrencies[0]) {
    extended.defaultCurrency = extended.supportedCurrencies[0];
  }
  if (extended.feeBps === undefined) extended.feeBps = 0;
  if (!extended.merchantCountry) extended.merchantCountry = "";
  if (extended.scaThresholdsByCurrency === undefined || extended.scaThresholdsByCurrency === null || typeof extended.scaThresholdsByCurrency !== "object") {
    extended.scaThresholdsByCurrency = {};
  }
  if (!extended.environment) extended.environment = "AUTO-INFER";
  if (!extended.description) extended.description = "";
  if (!extended.adminNotes) extended.adminNotes = extended.description || "";
  if (extended.isDefault === undefined) extended.isDefault = false;
  return updateAdminPaymentGatewayConfiguration(provider, extended);
}

export function setAdminPaymentGatewayEnabled(provider, enabled, configurationId, extra) {
  const body = { enabled: Boolean(enabled), configurationId };
  if (extra && typeof extra === "object") Object.assign(body, extra);
  return adminApiRequest(`/admin/settings/payment/gateways/${provider}/enabled`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function setAdminPaymentGatewayEnabledExtended(provider, enabled, configurationId, extra) {
  const extendedExtra = { ...(extra || {}) };
  if (extendedExtra.isDefault !== undefined) {
    // allow setting default flag along with enable
  }
  return setAdminPaymentGatewayEnabled(provider, enabled, configurationId, extendedExtra);
}

export function setAdminPaymentGatewayDefault(provider, configurationId) {
  return setAdminPaymentGatewayEnabledExtended(provider, true, configurationId, { isDefault: true });
}

export function disconnectAdminPaymentGateway(provider, configurationId) {
  return adminApiRequest(`/admin/settings/payment/gateways/${provider}/disconnect`, {
    method: "POST",
    body: JSON.stringify(configurationId ? { configurationId } : {}),
  });
}

export function runGatewayHealthCanary(provider, configurationId, options = {}) {
  const body = {
    amountMinor: options.amountMinor ?? 100,
    currency: options.currency ?? "USD",
    testMode: options.testMode ?? true,
  };
  return adminApiRequest(`/admin/gateway-health/${provider}/${configurationId}/canary`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getAdminSettingsPaymentExtended() {
  return getAdminSettingsPayment();
}

export function setAdminSavedCardsConfiguration(configurationId) {
  return adminApiRequest("/admin/settings/payment/saved-cards-configuration", {
    method: "PATCH",
    body: JSON.stringify({ configurationId }),
  });
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

export function enableAdminAddOn(addOnId) {
  return adminApiRequest(`/admin/add-ons/${addOnId}/enable`, { method: "POST" });
}

export function disableAdminAddOn(addOnId) {
  return adminApiRequest(`/admin/add-ons/${addOnId}/disable`, { method: "POST" });
}

export function toggleAdminAddOn(addOnId, enabled) {
  if (Boolean(enabled)) return enableAdminAddOn(addOnId);
  return disableAdminAddOn(addOnId);
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

export function getAdminFormUnavailablePage(formId) {
  return adminApiRequest(`/admin/forms/${formId}/unavailable-page`, { method: "GET" });
}

export function updateAdminFormUnavailablePage(formId, payload) {
  return adminApiRequest(`/admin/forms/${formId}/unavailable-page`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function getAdminFormReview(formId, options = {}) {
  return adminApiRequest(`/admin/forms/${formId}/review`, { method: "GET", ...(options || {}) });
}

// -----------------------------
// Audit Logs
// -----------------------------
export function getAdminAuditLogs({
  page,
  limit,
  sort,
  q,
  actorId,
  actorEmail,
  action,
  actionPrefix,
  targetType,
  targetId,
  requestId,
  ip,
  from,
  to,
} = {}) {
  const params = new URLSearchParams();

  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof actorId === "string" && actorId.trim()) params.set("actorId", actorId.trim());
  if (typeof actorEmail === "string" && actorEmail.trim()) params.set("actorEmail", actorEmail.trim());
  if (typeof action === "string" && action.trim()) params.set("action", action.trim());
  if (typeof actionPrefix === "string" && actionPrefix.trim()) params.set("actionPrefix", actionPrefix.trim());
  if (typeof targetType === "string" && targetType.trim()) params.set("targetType", targetType.trim());
  if (typeof targetId === "string" && targetId.trim()) params.set("targetId", targetId.trim());
  if (typeof requestId === "string" && requestId.trim()) params.set("requestId", requestId.trim());
  if (typeof ip === "string" && ip.trim()) params.set("ip", ip.trim());
  if (typeof from === "string" && from.trim()) params.set("from", from.trim());
  if (typeof to === "string" && to.trim()) params.set("to", to.trim());

  const query = params.toString();
  const endpoint = query ? `/admin/audit-logs?${query}` : "/admin/audit-logs";
  return adminApiRequest(endpoint, { method: "GET" });
}
