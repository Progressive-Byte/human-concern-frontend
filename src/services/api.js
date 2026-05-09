import { apiBase } from "@/utils/constants";

function getCookieValue(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function makeRequest(endpoint, options = {}, cookieName = "token") {
  const token = getCookieValue(cookieName);
  const isFormDataBody = typeof FormData !== "undefined" && options?.body instanceof FormData;

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  if (!isFormDataBody && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${apiBase}${endpoint}`, {
    method: options.method || "GET",
    credentials: "include",
    headers,
    body: options.body,
  });

  if (!response.ok) {
    let message;
    const ct = response.headers.get("content-type") || "";
    try {
      if (ct.includes("application/json")) {
        const body = await response.json();
        const raw = body.message || body.error;
        if (typeof raw === "string") {
          message = raw;
        } else if (raw && typeof raw === "object") {
          message = raw.message || raw.msg || Object.values(raw).find((v) => typeof v === "string") || JSON.stringify(raw);
        } else {
          message = JSON.stringify(body);
        }
      } else {
        message = await response.text();
      }
    } catch {
      message = `Request failed with status ${response.status}`;
    }
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export function apiRequest(endpoint, options = {}) {
  return makeRequest(endpoint, options, "token");
}

export function adminApiRequest(endpoint, options = {}) {
  return makeRequest(endpoint, options, "adminToken");
}
