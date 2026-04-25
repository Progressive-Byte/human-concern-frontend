import { apiRequest } from "./api";

export function login(payload) {
  return apiRequest("auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export function register(payload) {
  return apiRequest("auth/register", { method: "POST", body: JSON.stringify(payload) });
}

// export function getCurrentUser() {
//   return apiRequest("auth/me");
// }

export function changePassword(payload) {
  return apiRequest("auth/change-password", { method: "POST", body: JSON.stringify(payload) });
}

export function requestPasswordReset(payload) {
  return apiRequest("auth/request-password-reset", { method: "POST", body: JSON.stringify(payload) });
}

export function resetPassword(payload) {
  return apiRequest("auth/reset-password", { method: "POST", body: JSON.stringify(payload) });
}
