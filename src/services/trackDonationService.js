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

export function getTrackedDonation({ token, donationId } = {}) {
  const params = new URLSearchParams();
  if (token) params.set("token", String(token).trim());
  if (donationId) params.set("donationId", String(donationId).trim());
  return apiRequest(`/track-donation/donation?${params.toString()}`, { method: "GET" });
}
