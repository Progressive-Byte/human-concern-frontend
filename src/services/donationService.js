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
