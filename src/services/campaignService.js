import { apiRequest } from "./api";

export function getCampaigns() {
  return apiRequest("/campaigns");
}

export function getCampaignById(id) {
  return apiRequest(`/campaigns/${id}`);
}

export function getPublicBranding() {
  return apiRequest("/settings/branding");
}
