import { apiRequest } from "./api";

export function createDonation(payload) {
  return apiRequest("/donations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getUserDonations() {
  return apiRequest("/donations/me");
}

export function getUserDashboard({ recentLimit, schedulesLimit, distributionLimit } = {}) {
  const params = new URLSearchParams();
  if (recentLimit !== undefined && recentLimit !== null && String(recentLimit).trim()) params.set("recentLimit", String(recentLimit).trim());
  if (schedulesLimit !== undefined && schedulesLimit !== null && String(schedulesLimit).trim()) params.set("schedulesLimit", String(schedulesLimit).trim());
  if (distributionLimit !== undefined && distributionLimit !== null && String(distributionLimit).trim()) params.set("distributionLimit", String(distributionLimit).trim());
  const query = params.toString();
  const endpoint = query ? `/user/dashboard?${query}` : "/user/dashboard";
  return apiRequest(endpoint, { method: "GET" });
}

export function getUserDonationsList({ page, limit, q, filter, status, sort, order } = {}) {
  const params = new URLSearchParams();
  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof filter === "string" && filter.trim()) params.set("filter", filter.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  const query = params.toString();
  const endpoint = query ? `/user/donations?${query}` : "/user/donations";
  return apiRequest(endpoint, { method: "GET" });
}

export function exportUserDonationsCsv({ q, filter, status, sort, order } = {}) {
  const params = new URLSearchParams();
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  if (typeof filter === "string" && filter.trim()) params.set("filter", filter.trim());
  if (typeof status === "string" && status.trim()) params.set("status", status.trim());
  if (typeof sort === "string" && sort.trim()) params.set("sort", sort.trim());
  if (typeof order === "string" && order.trim()) params.set("order", order.trim());
  const query = params.toString();
  const endpoint = query ? `/user/donations/export?${query}` : "/user/donations/export";
  return apiRequest(endpoint, { method: "GET" });
}
