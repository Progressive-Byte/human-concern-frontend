import { apiRequest } from "./api";

// In-app notifications (the bell in the donor portal). The admin equivalent lives in services/admin.js.

export function getUserNotifications({ page, limit } = {}) {
  const params = new URLSearchParams();
  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  const query = params.toString();
  const endpoint = query ? `/user/notifications?${query}` : "/user/notifications";
  return apiRequest(endpoint, { method: "GET" });
}

export function getUserNotificationsUnreadCount() {
  return apiRequest("/user/notifications/unread-count", { method: "GET" });
}

export function markUserNotificationRead(notificationId) {
  return apiRequest(`/user/notifications/${notificationId}/read`, { method: "POST" });
}

export function markAllUserNotificationsRead() {
  return apiRequest("/user/notifications/read-all", { method: "POST" });
}
