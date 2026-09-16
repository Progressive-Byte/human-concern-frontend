import { apiRequest } from "./api";

export function requestDonationTrackLink({ email } = {}) {
  return apiRequest("/track-donation/request", {
    method: "POST",
    body: JSON.stringify({ email: String(email || "").trim().toLowerCase() }),
  });
}

export function getTrackedDonations({ token } = {}) {
  const params = new URLSearchParams();
  if (token) params.set("token", String(token).trim());
  const query = params.toString();
  const endpoint = query ? `/track-donation/donations?${query}` : "/track-donation/donations";
  return apiRequest(endpoint, { method: "GET" });
}
