import { apiRequest } from "./api";
import { apiBase } from "@/utils/constants";

function getCookieValue(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Download a donation receipt as a PDF.
 *
 * Cannot use `apiRequest` (it parses JSON/text) — receipts are binary, so this
 * mirrors the blob-download pattern used by the reconciliation CSV export.
 * `email` is required for the guest path (thank-you page); signed-in donors are
 * authorized by their bearer token alone.
 */
export function downloadReceipt({ donationId, transactionId, email } = {}) {
  const id = String(donationId || "").trim();
  if (!id) return Promise.reject(new Error("Missing donation reference."));

  const token = getCookieValue("token");
  const base = typeof apiBase === "string" ? apiBase : "";
  const url = `${base.replace(/\/+$/, "")}/receipt/download`;

  const body = { donationId: id };
  if (transactionId) body.transactionId = String(transactionId).trim();
  if (email) body.email = String(email).trim();

  return fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  }).then(async (res) => {
    if (!res.ok) {
      let message = "Could not download receipt.";
      try {
        const payload = await res.json();
        message = (payload && payload.error && payload.error.message) || message;
      } catch {
        // non-JSON error body — keep the generic message
      }
      const err = new Error(message);
      err.statusCode = res.status;
      throw err;
    }

    const blob = await res.blob();
    const disposition = res.headers.get("content-disposition") || "";
    const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    const filename = match ? match[1] : `receipt-${id}.pdf`;
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  });
}

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

export function getUserSchedules({ page, limit, q } = {}) {
  const params = new URLSearchParams();
  if (page !== undefined && page !== null && String(page).trim()) params.set("page", String(page).trim());
  if (limit !== undefined && limit !== null && String(limit).trim()) params.set("limit", String(limit).trim());
  if (typeof q === "string" && q.trim()) params.set("q", q.trim());
  
  const query = params.toString();
  const endpoint = query ? `/user/schedules?${query}` : "/user/schedules";
  return apiRequest(endpoint, { method: "GET" });
}

export function getUserScheduleById(scheduleId) {
  return apiRequest(`/user/schedules/${encodeURIComponent(String(scheduleId || "").trim())}`, { method: "GET" });
}

export function getUserFundBreakdown() {
  return apiRequest("/user/fund-breakdown", { method: "GET" });
}

export function getUserProfile() {
  return apiRequest("/user/profile", { method: "GET" });
}

export function updateUserProfile(payload) {
  return apiRequest("/user/profile", { method: "PATCH", body: JSON.stringify(payload) });
}

export function getUserNotificationPreferences() {
  return apiRequest("/user/profile/notification-preferences", { method: "GET" });
}

export function updateUserNotificationPreferences(payload) {
  return apiRequest("/user/profile/notification-preferences", { method: "PATCH", body: JSON.stringify(payload) });
}

export function getUserInstallmentAction(installmentId) {
  const id = encodeURIComponent(String(installmentId || "").trim());
  return apiRequest(`/user/installments/${id}/action`, { method: "GET" });
}

export function syncUserInstallment(installmentId) {
  const id = encodeURIComponent(String(installmentId || "").trim());
  return apiRequest(`/user/installments/${id}/sync`, { method: "POST" });
}

export function getUserScheduleEditable(scheduleId) {
  const id = encodeURIComponent(String(scheduleId || "").trim());
  return apiRequest(`/user/schedules/${id}/editable`, { method: "GET" });
}

export function getUserScheduleEditForm(scheduleId) {
  const id = encodeURIComponent(String(scheduleId || "").trim());
  return apiRequest(`/user/schedules/${id}/edit-form`, { method: "GET" });
}

export function submitScheduleEditForm(scheduleId, payload) {
  const id = encodeURIComponent(String(scheduleId || "").trim());
  return apiRequest(`/user/schedules/${id}/edit-form`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Change the amount of ONE scheduled payment (leaves the other installments untouched).
export function updateUserInstallmentAmount({ scheduleId, installmentId, amount } = {}) {
  const sid = encodeURIComponent(String(scheduleId || "").trim());
  const iid = encodeURIComponent(String(installmentId || "").trim());
  return apiRequest(`/user/schedules/${sid}/installments/${iid}`, {
    method: "PATCH",
    body: JSON.stringify({ amount: Number(amount) }),
  });
}

export function pauseUserSchedule(scheduleId, reason = "") {
  const id = encodeURIComponent(String(scheduleId || "").trim());
  return apiRequest(`/user/schedules/${id}/pause`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function resumeUserSchedule(scheduleId, resumeFromDate = "") {
  const id = encodeURIComponent(String(scheduleId || "").trim());
  return apiRequest(`/user/schedules/${id}/resume`, {
    method: "POST",
    body: JSON.stringify({ resumeFromDate }),
  });
}

export function cancelUserSchedule(scheduleId, reason = "") {
  const id = encodeURIComponent(String(scheduleId || "").trim());
  return apiRequest(`/user/schedules/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function startSchedulePaymentMethodSwitch(scheduleId, provider) {
  const id = encodeURIComponent(String(scheduleId || "").trim());
  return apiRequest(`/user/schedules/${id}/payment-method`, {
    method: "POST",
    body: JSON.stringify({ provider: String(provider || "").trim() }),
  });
}

export function postFinalizeSplit(body, idemKey) {
  const options = {
    method: "POST",
    body: JSON.stringify(body || {}),
  };
  if (idemKey) options.idempotencyKey = String(idemKey);
  return apiRequest("/donations/finalize", options);
}

export async function postFinalizeOneTime(body, idemKey) {
  const options = {
    method: "POST",
    body: JSON.stringify(body || {}),
  };
  if (idemKey) options.idempotencyKey = String(idemKey);
  try {
    return await apiRequest("/donations/finalize-onetime", options);
  } catch (err) {
    const status = err?.statusCode;
    if (status === 404 || status === 405) {
      return apiRequest("/donations/finalize", options);
    }
    throw err;
  }
}
