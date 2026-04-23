import { adminApiRequest } from "./api";

export function adminLogin(payload) {
  return adminApiRequest("/admin/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export function adminChangePassword(payload) {
  return adminApiRequest("/admin/auth/change-password", { method: "POST", body: JSON.stringify(payload) });
}

export function adminRequestPasswordReset(payload) {
  return adminApiRequest("/admin/auth/request-password-reset", { method: "POST", body: JSON.stringify(payload) });
}

export function adminResetPassword(payload) {
  return adminApiRequest("/admin/auth/reset-password", { method: "POST", body: JSON.stringify(payload) });
}
