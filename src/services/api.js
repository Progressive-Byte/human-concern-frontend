import { userAuthRegistration } from "@/utils/constants";

function getCookieValue(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function makeRequest(endpoint, options = {}, cookieName = "token") {
  const token = getCookieValue(cookieName);

  const response = await fetch(`${userAuthRegistration}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message;
    const ct = response.headers.get("content-type") || "";
    try {
      if (ct.includes("application/json")) {
        const body = await response.json();
        message = body.message || body.error || JSON.stringify(body);
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
