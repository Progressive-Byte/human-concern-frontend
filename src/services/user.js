import { apiRequest } from "./api";

export function createUserPaymentMethodSetupIntent({ setDefault } = {}) {
  return apiRequest("user/payment-methods/setup-intent", { method: "POST", body: JSON.stringify({ setDefault: Boolean(setDefault) }) });
}

export function finalizeUserPaymentMethod({ setupIntentId, configurationId, setDefault } = {}) {
  return apiRequest("user/payment-methods", {
    method: "POST",
    body: JSON.stringify({ setupIntentId, configurationId, setDefault: Boolean(setDefault) }),
  });
}

export function getUserPaymentMethods() {
  return apiRequest("user/payment-methods", { method: "GET" });
}

export function setUserDefaultPaymentMethod(id) {
  return apiRequest(`user/payment-methods/${encodeURIComponent(String(id))}/default`, { method: "PATCH", body: JSON.stringify({ isDefault: true }) });
}

export function deleteUserPaymentMethod(id) {
  return apiRequest(`user/payment-methods/${encodeURIComponent(String(id))}`, { method: "DELETE" });
}
