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
