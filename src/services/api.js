const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Read the auth token from the browser cookie store (client-side only). */
function getBrowserToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiRequest(endpoint, options = {}) {
  const token = getBrowserToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    // Send cookies on cross-origin requests (needed when API is on a different port/domain)
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      // Send token as Bearer header in addition to the cookie
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    // Try to parse a JSON error body first, fall back to plain text
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
